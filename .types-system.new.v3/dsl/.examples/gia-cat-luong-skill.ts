import { DefineSkill } from '../entity/skill/manifest.types';
import { energyDamageReduction, physicalDamageReduction } from '../../builder/templates/combat/reduction-policies';

/**
 * Gia Cát Lượng — 3 hệ xoay vòng (Gió/Sét/Mây) qua S1.
 *
 * Cơ chế phase:
 * - S1 là mảng 3 phase (icon thay đổi theo hệ hiện tại)
 * - S1 thay đổi phase của s2 và s3 đồng thời
 * - Hệ được track qua `hasEffect` để condition trong phase entry
 * - Innate `on-ready` thiết lập phase ban đầu là Gió
 *
 * Mana = current-energy-point (max 100, regen 5 mỗi 0.5s)
 */
export const GiaCatLuongManifest: DefineSkill = {
	manifest: {
		// Khởi tạo phase Gió khi skill sẵn sàng
		'innate-init': {
			triggers: ['on-ready'],
			cooldown: Infinity,
			actions: { action: '@apply:effect', effect: 'gcl-phase-wind' },
		},

		// Mana regen 5 mỗi 0.5s
		'innate-mana-regen': {
			triggers: ['on-ready'],
			cooldown: 0.5,
			actions: { action: '@apply:modifier', attribute: 'current-energy-point', value: () => 5 },
		},

		// S1 CD 1s, 0 mana: Đổi hệ xoay vòng Gió → Sét → Mây → Gió
		s1: [
			{
				// Phase 0: đang ở Gió → chuyển sang Sét
				visual: { sprite: { key: 's1-wind' } },
				triggers: ['on-key:s1'],
				cooldown: 1,
				actions: [
					{ action: '@apply:clean-effect', filter: 'id:gcl-phase-wind' },
					{ action: '@apply:effect', effect: 'gcl-phase-thunder' },
					{ action: '@do-act:change-phase', slot: 's1', phase: 1 },
					{ action: '@do-act:change-phase', slot: 's2', phase: 1 },
					{ action: '@do-act:change-phase', slot: 's3', phase: 1 },
				],
			},
			{
				// Phase 1: đang ở Sét → chuyển sang Mây
				visual: { sprite: { key: 's1-thunder' } },
				triggers: ['on-key:s1'],
				cooldown: 1,
				actions: [
					{ action: '@apply:clean-effect', filter: 'id:gcl-phase-thunder' },
					{ action: '@apply:effect', effect: 'gcl-phase-cloud' },
					{ action: '@do-act:change-phase', slot: 's1', phase: 2 },
					{ action: '@do-act:change-phase', slot: 's2', phase: 2 },
					{ action: '@do-act:change-phase', slot: 's3', phase: 2 },
				],
			},
			{
				// Phase 2: đang ở Mây → chuyển về Gió
				visual: { sprite: { key: 's1-cloud' } },
				triggers: ['on-key:s1'],
				cooldown: 1,
				actions: [
					{ action: '@apply:clean-effect', filter: 'id:gcl-phase-cloud' },
					{ action: '@apply:effect', effect: 'gcl-phase-wind' },
					{ action: '@do-act:change-phase', slot: 's1', phase: 0 },
					{ action: '@do-act:change-phase', slot: 's2', phase: 0 },
					{ action: '@do-act:change-phase', slot: 's3', phase: 0 },
				],
			},
		],

		// S2 — 3 phase tương ứng 3 hệ
		s2: [
			{
				// Phase 0 — Gió CD 6s, 25 mana: Cơn gió xuyên thấu, hất tung + slow 40% + tăng ST chịu 15%
				visual: { sprite: { key: 's2-wind' } },
				triggers: ['on-key:s2'],
				cooldown: 6,
				conditions: (ctx) => ctx.caster['current-energy-point'] >= 25,
				actions: [
					{ action: '@apply:modifier', attribute: 'current-energy-point', value: () => -25 },
					{
						action: '@create-entity',
						from: 'caster-pos',
						strategy: { type: 'direction' },
						movement: { 'move-type': 'straight', speed: () => 18 },
						collider: {
							shape: { type: 'rectangle', size: { width: 80, height: 40 } },
							'impact-capacity': Infinity,
							'pierce-targets': 'all',
						},
						impact: {
							manifest: {
								'target-effect': {
									action: '@apply:effect',
									effect: ['gcl-s2-wind-hit', 'gcl-s2-wind-levitate'],
								},
							},
						},
					},
				],
			},
			{
				// Phase 1 — Sét CD 2s, 25 mana: Area mouse pos, sau 0.5s sét đánh; slow 50% 2s
				// Địch đã slow không bị slow lại trong 6s
				visual: { sprite: { key: 's2-thunder' } },
				triggers: ['on-key:s2'],
				cooldown: 2,
				conditions: (ctx) => ctx.caster['current-energy-point'] >= 25,
				actions: [
					{ action: '@apply:modifier', attribute: 'current-energy-point', value: () => -25 },
					{
						action: '@create-entity',
						from: 'mouse-pos',
						movement: { 'move-type': 'straight', speed: () => 0 },
						collider: {
							shape: { type: 'circle', size: { radius: 180 } },
							'impact-capacity': Infinity,
							'warm-up': 0.5,
						},
						impact: {
							manifest: [
								{ 'target-effect': { action: '@apply:effect', effect: 'gcl-s2-thunder-hit' } },
								{
									// Slow — immune nếu đã có slow này trong 6s trước
									'target-effect': { action: '@apply:effect', effect: 'gcl-s2-thunder-slow' },
								},
							],
						},
					},
				],
			},
			{
				// Phase 2 — Mây CD 6s, 10 mana: Shield miễn 1 skill, khi kích hoạt → counter-attack
				// NOTE: on-hit-taken fires cho ALL hits — không phân biệt skill/normal ở event level
				// Shield impact-shield filter 'skill' block damage, on-hit-taken dùng để counter
				// Simplification: counter fires khi bị hit bất kỳ trong khi có shield
				// Ideal cần engine phân biệt hit type trong event context
				visual: { sprite: { key: 's2-cloud' } },
				triggers: ['on-key:s2'],
				cooldown: 6,
				conditions: (ctx) => ctx.caster['current-energy-point'] >= 10,
				actions: [
					{ action: '@apply:modifier', attribute: 'current-energy-point', value: () => -10 },
					{ action: '@apply:effect', effect: 'gcl-s2-cloud-shield' },
				],
			},
		],

		// S3 — 3 phase, 50 mana
		s3: [
			{
				// Phase 0 — Gió CD 10s: Area mouse, 2s mỗi s 150% NL slow 40%, kết thúc hút vào tâm
				visual: { sprite: { key: 'ultimate-wind' } },
				triggers: ['on-key:ultimate'],
				cooldown: 10,
				conditions: (ctx) => ctx.caster['current-energy-point'] >= 50,
				actions: [
					{ action: '@apply:modifier', attribute: 'current-energy-point', value: () => -50 },
					{
						action: '@create-entity',
						from: 'mouse-pos',
						duration: 2,
						movement: { 'move-type': 'straight', speed: () => 0 },
						collider: {
							shape: { type: 'circle', size: { radius: 300 } },
							'impact-capacity': Infinity,
						},
						impact: {
							interval: 1,
							manifest: { 'target-effect': { action: '@apply:effect', effect: 'gcl-s3-wind-tick' } },
						},
					},
					// Kết thúc: hút tất cả địch trong vùng vào tâm
					{
						action: '@create-entity',
						from: 'mouse-pos',
						movement: { 'move-type': 'straight', speed: () => 0 },
						collider: {
							shape: { type: 'circle', size: { radius: 300 } },
							'impact-capacity': Infinity,
							'warm-up': 2,
						},
						impact: {
							manifest: { 'target-effect': { action: '@apply:radial-push', speed: () => 600 } },
						},
					},
				],
			},
			{
				// Phase 1 — Sét CD 6s: Area mouse, sau 1.25s sét 575% NL, vùng dư âm 2s mỗi s 96%
				visual: { sprite: { key: 'ultimate-thunder' } },
				triggers: ['on-key:ultimate'],
				cooldown: 6,
				conditions: (ctx) => ctx.caster['current-energy-point'] >= 50,
				actions: [
					{ action: '@apply:modifier', attribute: 'current-energy-point', value: () => -50 },
					{
						action: '@create-entity',
						from: 'mouse-pos',
						duration: 2, // dư âm 2s sau hit
						movement: { 'move-type': 'straight', speed: () => 0 },
						collider: {
							shape: { type: 'circle', size: { radius: 250 } },
							'impact-capacity': Infinity,
							'warm-up': 1.25,
						},
						impact: {
							interval: 1,
							manifest: { 'target-effect': { action: '@apply:effect', effect: 'gcl-s3-thunder-tick' } },
						},
					},
				],
			},
			{
				// Phase 2 — Mây CD 10s: Area tại chỗ đứng, sau 1s buff tàng hình + 40% tốc 3s cho ally trong vùng
				visual: { sprite: { key: 'ultimate-cloud' } },
				triggers: ['on-key:ultimate'],
				cooldown: 10,
				conditions: (ctx) => ctx.caster['current-energy-point'] >= 50,
				actions: [
					{ action: '@apply:modifier', attribute: 'current-energy-point', value: () => -50 },
					{
						action: '@create-entity',
						from: 'caster-pos',
						movement: { 'move-type': 'straight', speed: () => 0 },
						collider: {
							shape: { type: 'circle', size: { radius: 400 } },
							'impact-capacity': Infinity,
							'warm-up': 1,
						},
						impact: {
							manifest: {
								'affected-faction': ['ally', 'self'],
								'target-effect': [
									{ action: '@apply:effect', effect: 'gcl-s3-cloud-invis' },
									{ action: '@apply:effect', effect: 'gcl-s3-cloud-speed' },
								],
							},
						},
					},
				],
			},
		],
	},

	effects: {
		// Phase effects (continuous stat, unremovable để đảm bảo luôn có 1 hệ active)
		'gcl-phase-wind': {
			unremovable: true,
			duration: Infinity,
			impacts: { 'modify-stats': { attribute: 'movement-speed', value: '15%' as any } },
		},
		'gcl-phase-thunder': {
			unremovable: true,
			duration: Infinity,
			impacts: { 'modify-stats': { attribute: 'penetration-percent', value: '15%' as any } },
		},
		'gcl-phase-cloud': {
			unremovable: true,
			duration: Infinity,
			impacts: { 'modify-stats': { attribute: 'damage-reduction', value: '15%' as any } },
		},

		// S2 Wind
		'gcl-s2-wind-hit': {
			impacts: {
				'on-start': {
					action: '@apply:modifier',
					attribute: 'current-HP',
					value: (ctx) => -ctx.caster['attack-power'] * 1.86,
					reductions: energyDamageReduction,
				},
			},
		},
		'gcl-s2-wind-levitate': {
			duration: 1,
			description: 'Bị hất tung, khi rớt slow 40% + chịu tăng 15% ST trong 2s',
			impacts: {
				'modify-states': { type: 'root' },
				'on-end': [
					{ action: '@apply:effect', effect: 'gcl-s2-wind-land-slow' },
					{ action: '@apply:effect', effect: 'gcl-s2-wind-land-amp' },
				],
			},
		},
		'gcl-s2-wind-land-slow': {
			duration: 2,
			impacts: { 'modify-stats': { attribute: 'movement-speed', value: '-40%' as any } },
		},
		'gcl-s2-wind-land-amp': {
			duration: 2,
			description: 'Tăng 15% ST phải chịu — dùng incoming-reductions khi có; tạm thời mock bằng debuff giảm giáp',
			// TODO: Cần incoming-reductions khi implement để giảm damage chính xác theo phía attacker
			impacts: { 'modify-stats': { attribute: 'energy-shield', value: '-15%' as any } },
		},

		// S2 Thunder
		'gcl-s2-thunder-hit': {
			impacts: {
				'on-start': {
					action: '@apply:modifier',
					attribute: 'current-HP',
					value: (ctx) => -ctx.caster['attack-power'] * 2.01,
					reductions: energyDamageReduction,
				},
			},
		},
		'gcl-s2-thunder-slow': {
			duration: 2,
			description: 'Slow 50%; đã bị slow này → immune 6s',
			impacts: {
				'modify-stats': { attribute: 'movement-speed', value: '-50%' as any },
				'modify-states': { type: 'immune', filter: 'id:gcl-s2-thunder-slow' }, // Immune re-apply
			},
		},

		// S2 Cloud — Counter khi bị hit trong khi shield active
		'gcl-s2-cloud-shield': {
			duration: 2,
			description: 'Miễn 1 đòn skill; khi bị hit → counter. NOTE: on-hit-taken fires cho all hits',
			impacts: {
				'modify-states': { type: 'impact-immune', filter: 'skill' },
				'on-event': {
					'on-hit-taken': [
						// Tự heal + mana
						{
							action: '@apply:modifier',
							attribute: 'current-HP',
							value: (ctx) => ctx.caster['limit-HP'] * 0.15,
						},
						{ action: '@apply:modifier', attribute: 'current-energy-point', value: () => 40 },
						// Xóa chính shield sau khi kích hoạt
						{ action: '@apply:clean-effect', filter: 'id:gcl-s2-cloud-shield' },
						// Counter tại vị trí attacker: xóa immune, gây 130%, câm 1.5s
						{
							action: '@create-entity',
							from: 'target-pos', // target = attacker trong on-hit-taken context
							movement: { 'move-type': 'straight', speed: () => 0 },
							collider: { shape: { type: 'circle', size: { radius: 80 } } },
							impact: {
								manifest: [
									{ 'target-effect': { action: '@apply:clean-effect', filter: 'tag:immune' } },
									{
										'target-effect': {
											action: '@apply:effect',
											effect: 'gcl-s2-cloud-counter-dmg',
										},
									},
									{ 'target-effect': { action: '@apply:effect', effect: 'gcl-s2-cloud-silence' } },
								],
							},
						},
					],
				},
			},
		},
		'gcl-s2-cloud-counter-dmg': {
			impacts: {
				'on-start': {
					action: '@apply:modifier',
					attribute: 'current-HP',
					value: (ctx) => -ctx.caster['attack-power'] * 1.3,
					reductions: energyDamageReduction,
				},
			},
		},
		'gcl-s2-cloud-silence': {
			duration: 1.5,
			impacts: { 'modify-states': { type: 'silent', slot: 'all' } },
		},

		// S3 Wind
		'gcl-s3-wind-tick': {
			duration: 2,
			impacts: {
				'on-start': {
					action: '@apply:modifier',
					attribute: 'current-HP',
					value: (ctx) => -ctx.caster['attack-power'] * 1.5,
					reductions: energyDamageReduction,
				},
				'modify-states': { type: 'root' }, // làm chậm 40% — dùng slow thay root
			},
		},

		// S3 Thunder: tick đầu 575%, sau đó dư âm 96%/s
		'gcl-s3-thunder-tick': {
			impacts: [
				{
					// Lần hit đầu (stack 1): 575%
					'on-start': {
						action: '@apply:modifier',
						attribute: 'current-HP',
						value: (ctx) => -ctx.caster['attack-power'] * 5.75,
						reductions: energyDamageReduction,
					},
				},
				{
					// Dư âm (stack 2+): 96%/s
					'on-start': {
						action: '@apply:modifier',
						attribute: 'current-HP',
						value: (ctx) => -ctx.caster['attack-power'] * 0.96,
						reductions: energyDamageReduction,
					},
				},
				{
					'on-start': {
						action: '@apply:modifier',
						attribute: 'current-HP',
						value: (ctx) => -ctx.caster['attack-power'] * 0.96,
						reductions: energyDamageReduction,
					},
				},
			],
		},

		// S3 Cloud
		'gcl-s3-cloud-invis': {
			duration: 3,
			impacts: { 'modify-states': { type: 'invisible' } },
		},
		'gcl-s3-cloud-speed': {
			duration: 3,
			impacts: { 'modify-stats': { attribute: 'movement-speed', value: '40%' as any } },
		},
	},
};
