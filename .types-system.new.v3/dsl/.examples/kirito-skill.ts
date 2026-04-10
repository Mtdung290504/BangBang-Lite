import { DefineSkill } from '../entity/skill/manifest.types';
import { physicalDamageReduction, energyDamageReduction } from '../../builder/templates/combat/reduction-policies';

export const KiritoManifest: DefineSkill = {
	manifest: {
		// NỘI TẠI CD30s: Khi nhận damage chí tử → bất tử 1.5s + xóa CD s1, s2
		'innate-cheat-death': {
			triggers: ['on-ready'],
			cooldown: Infinity,
			actions: { action: '@apply:effect', effect: 'k-listen-fatal' },
		},

		// S1 CD 8s: Ẩn 0.5s → nhảy đến vị trí chuột → 175% VL + giữ chân 1s + stack tăng tốc
		s1: {
			icon: 's1',
			triggers: ['on-key:s1'],
			cooldown: 8,
			actions: [
				{ action: '@apply:effect', effect: 'k-invisible-short' }, // Ẩn 0.5s
				{ action: '@do-act:wait', duration: 0.5 },
				// Blink: Anchor impactor tại mouse-pos → radial-push kéo caster đến đó tức thì
				// NOTE: pattern "blink to position" — anchor tại mouse + radial-push speed infinity
				{
					action: '@create-entity',
					from: 'mouse-pos',
					duration: 0.032, // 2 frames rồi xóa
					movement: { 'move-type': 'straight', speed: () => 0 },
					collider: { shape: { type: 'circle', size: { radius: 99999 } } },
					impact: {
						manifest: {
							'affected-faction': ['self'],
							'self-action': { action: '@apply:radial-push', speed: () => 99999 },
						},
					},
				},
				// Damage area tại mouse-pos
				{
					action: '@create-entity',
					from: 'mouse-pos',
					movement: { 'move-type': 'straight', speed: () => 0 },
					collider: { shape: { type: 'circle', size: { radius: 100 } }, 'impact-capacity': Infinity },
					impact: {
						manifest: [
							{ 'target-effect': { action: '@apply:effect', effect: 'k-s1-damage' } },
							{ 'target-effect': { action: '@apply:effect', effect: 'k-root' } },
							{ 'self-action': { action: '@apply:effect', effect: 'k-speed-stack' } },
						],
					},
				},
			],
		},

		// S2 CD 6s: Lướt theo hướng + drag địch → 150% VL; địch trúng tường +150% + same speed stack
		s2: {
			icon: 's2',
			triggers: ['on-key:s2'],
			cooldown: 6,
			actions: {
				action: '@create-entity',
				from: 'self-pos',
				strategy: { type: 'direction' },
				movement: { 'move-type': 'straight', speed: () => 800 },
				collider: {
					shape: { type: 'circle', size: { radius: 50 } },
					'pierce-targets': 'all',
					'drag-targets': true,
				},
				impact: {
					manifest: [
						{
							'target-effect': [
								{ action: '@apply:effect', effect: 'k-s2-damage' },
								// Effect này lắng nghe on-wall-collide để gây bonus damage
								{ action: '@apply:effect', effect: 'k-s2-wall-listener' },
							],
						},
						{ 'self-action': { action: '@apply:effect', effect: 'k-speed-stack' } },
					],
				},
			},
		},

		// ULT CD 25s: Ẩn 1.5s + chém 15 nhát area → xuất hiện → delay → nửa hình tròn 175% + 15% HP mất
		ultimate: {
			icon: 'ultimate',
			triggers: ['on-key:ultimate'],
			cooldown: 25,
			actions: [
				// Ẩn + 15 nhát trong 1.5s (interval ≈ 0.1s)
				{ action: '@apply:effect', effect: 'k-ult-invisible' },
				{
					action: '@create-entity',
					from: 'self-pos',
					duration: 1.5,
					movement: { 'move-type': 'straight', speed: () => 0 },
					collider: { shape: { type: 'circle', size: { radius: 300 } }, 'impact-capacity': Infinity },
					impact: {
						interval: 0.1, // 15 nhát / 1.5s
						manifest: { 'target-effect': { action: '@apply:effect', effect: 'k-ult-slash' } },
					},
				},
				{ action: '@do-act:wait', duration: 1.5 },
				// Xuất hiện + delay ngắn
				{ action: '@do-act:wait', duration: 0.2 },
				// Chém nửa hình tròn về hướng chuột: 175% VL + 15% HP mất chuẩn
				{
					action: '@create-entity',
					from: 'self-pos',
					strategy: { type: 'direction' },
					movement: { 'move-type': 'straight', speed: () => 0 },
					collider: {
						shape: { type: 'circle', size: { radius: 300, 'arc-angle': 180 } },
						'impact-capacity': Infinity,
					},
					impact: {
						manifest: { 'target-effect': { action: '@apply:effect', effect: 'k-ult-final-slash' } },
					},
				},
			],
		},
	},

	effects: {
		// Innate
		'k-listen-fatal': {
			unremovable: true,
			impacts: {
				'on-event': {
					'on-fatal-damage': [
						{ action: '@apply:effect', effect: 'k-invincible' },
						{ action: '@apply:modify-countdown', slot: ['s1', 's2'], value: '-100%' },
					],
				},
			},
		},
		'k-invincible': {
			duration: 1.5,
			impacts: { 'modify-states': { type: 'invincible' } },
		},

		// Shared
		'k-invisible-short': {
			duration: 0.5,
			impacts: { 'modify-states': { type: 'invisible' } },
		},
		'k-root': {
			duration: 1,
			impacts: { 'modify-states': { type: 'root' } },
		},
		'k-speed-stack': {
			duration: 2,
			description: 'Tăng 50% tốc chạy, tối đa 2 stack',
			impacts: [
				{ 'modify-stats': { attribute: 'movement-speed', value: '50%' as any } },
				{ 'modify-stats': { attribute: 'movement-speed', value: '100%' as any } },
			],
		},

		// S1
		'k-s1-damage': {
			impacts: {
				'on-start': {
					action: '@apply:modifier',
					attribute: 'current-HP',
					value: (ctx) => -ctx.caster['attack-power'] * 1.75,
					reductions: physicalDamageReduction,
				},
			},
		},

		// S2
		'k-s2-damage': {
			impacts: {
				'on-start': {
					action: '@apply:modifier',
					attribute: 'current-HP',
					value: (ctx) => -ctx.caster['attack-power'] * 1.5,
					reductions: physicalDamageReduction,
				},
			},
		},
		'k-s2-wall-listener': {
			duration: 2, // Tồn tại đủ lâu để bắt on-wall-collide khi đang bị drag
			impacts: {
				'on-event': {
					'on-wall-collide': [
						{
							action: '@apply:modifier',
							attribute: 'current-HP',
							value: (ctx) => -ctx.caster['attack-power'] * 1.5,
							reductions: physicalDamageReduction,
						},
						{ action: '@apply:clean-effect', filter: 'id:k-s2-wall-listener' }, // Chỉ 1 lần
					],
				},
			},
		},

		// Ult
		'k-ult-invisible': {
			duration: 1.5,
			impacts: {
				'modify-states': [{ type: 'invisible' }, { type: 'invincible' }],
			},
		},
		'k-ult-slash': {
			description: '30% VL + làm chậm 60% trong 1.5s',
			impacts: {
				'on-start': [
					{
						action: '@apply:modifier',
						attribute: 'current-HP',
						value: (ctx) => -ctx.caster['attack-power'] * 0.3,
						reductions: physicalDamageReduction,
					},
					{ action: '@apply:effect', effect: 'k-ult-slow' },
				],
			},
		},
		'k-ult-slow': {
			duration: 1.5,
			'stack-timeline-policy': 'reset-duration',
			impacts: { 'modify-stats': { attribute: 'movement-speed', value: '-60%' as any } },
		},
		'k-ult-final-slash': {
			description: '175% VL + 15% HP đã mất chuẩn',
			impacts: {
				'on-start': [
					{
						action: '@apply:modifier',
						attribute: 'current-HP',
						value: (ctx) => -ctx.caster['attack-power'] * 1.75,
						reductions: physicalDamageReduction,
					},
					{
						// True damage 15% lost HP
						action: '@apply:modifier',
						attribute: 'current-HP',
						value: (ctx) => -ctx.target['lost-HP'] * 0.15,
					},
				],
			},
		},
	},
};
