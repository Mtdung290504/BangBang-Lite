import { DefineSkill } from '../entity/skill/manifest.types';
import { energyDamageReduction } from '../../builder/templates/combat/reduction-policies';

export const FalconManifest: DefineSkill = {
	manifest: {
		// NỘI TẠI
		'innate-recharge': {
			triggers: ['on-ready'],
			cooldown: Infinity,
			actions: {
				action: '@apply:effect',
				effect: 'listen-energy-empty',
			},
		},

		// ĐÁNH THƯỜNG — 2 phase:
		// phase 0: đạn gốc (default)
		// phase 1: đạn cường hóa sau khi lướt S2
		'normal-attack': [
			{
				// phase 0 — default
				triggers: ['on-key:normal-attack'],
				conditions: (ctx) => !ctx.self.hasEffect('s2-empower') && ctx.self['current-energy-point'] >= 20,
				actions: [
					{ action: '@apply:modifier', attribute: 'current-energy-point', value: () => -20 },
					{
						action: '@create-entity',
						from: 'self-pos',
						strategy: { type: 'targeting', method: 'active-lock' },
						visual: { sprite: { key: 'normal-attack' } },
						movement: { 'move-type': 'straight', speed: ({ self }) => self['flight-speed'] },
						collider: { shape: { type: 'rectangle', size: { width: 100, height: 35 } } },
						impact: {
							actions: [
								{ 'target-effect': { action: '@apply:effect', effect: 'normal-damage' } },
								{ 'self-action': { action: '@apply:effect', effect: 'passive-hit-counter' } },
							],
						},
					},
				],
			},
			{
				// phase 1 — sau khi bật S2 lướt
				triggers: ['on-key:normal-attack'],
				conditions: (ctx) => ctx.self.hasEffect('s2-empower'),
				actions: {
					action: '@create-entity',
					from: 'self-pos',
					strategy: { type: 'targeting', method: 'active-lock' },
					visual: { sprite: { key: 'normal-attack-s2' } },
					movement: { 'move-type': 'straight', speed: ({ self }) => self['flight-speed'] },
					// Xuyên tường (ignore-wall), giả định wall tương đương faction hoặc pierce: 'wall'
					collider: {
						shape: { type: 'rectangle', size: { width: 100, height: 35 } },
						'pierce-targets': 'all',
					},
					impact: {
						actions: [
							{ 'target-effect': { action: '@apply:effect', effect: 'normal-damage-lifesteal' } }, // Hút máu & Damage
							{ 'self-action': { action: '@apply:effect', effect: 's2-attack-tracker' } }, // Tích lùi số lượng đạn
						],
					},
				},
			},
		],

		// CHIÊU 1: Vùng chiếu sáng
		s1: {
			visual: { sprite: { key: 's1-icon' } },
			triggers: ['on-key:s1'],
			cooldown: 8,
			actions: {
				action: '@create-entity',
				from: 'self-pos',
				strategy: { type: 'targeting', method: 'active-lock' },
				duration: 3,
				collider: { shape: { type: 'circle', size: { radius: 200 } } },
				impact: {
					interval: 1,
					actions: { 'target-effect': { action: '@apply:effect', effect: 'reveal-stealth' } },
				},
			},
		},

		// CHIÊU 2: Lướt
		s2: {
			visual: { sprite: { key: 's2-icon' } },
			triggers: ['on-key:s2'],
			cooldown: 12,
			actions: [
				{
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
						actions: {
							'affected-faction': ['self'],
							'self-action': [
								// Phase normal-attack → 1 (đạn cường hóa), buff S2, nạp 1 viên vào Tracker
								{
									action: '@do-act:change-phase',
									slot: 'normal-attack',
									phase: 1,
								},
								{ action: '@apply:effect', effect: 's2-empower' },
								{ action: '@apply:effect', effect: 's2-attack-tracker' },
							],
						},
					},
				},
			],
		},

		// ULTIMATE
		ultimate: {
			visual: { sprite: { key: 'ultimate-icon' } },
			triggers: ['on-key:ultimate'],
			cooldown: 60,
			actions: {
				action: '@create-entity',
				from: 'self-pos',
				strategy: { type: 'direction' },
				movement: { 'move-type': 'straight', speed: () => 1200 },
				collider: { shape: { type: 'circle', size: { radius: 60 } } },
				impact: {
					actions: { 'target-effect': { action: '@apply:effect', effect: 'ult-mark' } },
				},
			},
		},
	},

	effects: {
		// --- CƠ CHẾ NỘI TẠI MẶC ĐỊNH ---
		'listen-energy-empty': {
			unremovable: true,
			impacts: {
				'on-event': {
					'on-energy-empty': [{ action: '@apply:effect', effect: 'wait-recharge' }],
					'on-destroyed': {
						action: '@apply:modify-countdown',
						slot: 'innate-recharge',
						value: '-100%',
					},
				},
			},
		},
		'wait-recharge': {
			unremovable: true,
			duration: 1,
			impacts: {
				'on-end': [
					{
						action: '@apply:modifier',
						attribute: 'current-energy-point',
						value: '100%',
					},
				],
			},
		},

		// --- CƠ CHẾ CƯỜNG HÓA NỘI TẠI (4 HIT) ---
		'passive-hit-counter': {
			duration: 4,
			'stack-timeline-policy': 'reset-duration',
			description: 'Đánh thường trúng địch 4 lần -> cường hóa xuyên giáp',
			impacts: [
				{ visual: { sprite: { key: 'hit-count:1' } } },
				{ visual: { sprite: { key: 'hit-count:2' } } },
				{ visual: { sprite: { key: 'hit-count:3' } } },
				{
					visual: { sprite: { key: 'hit-count:4' } },
					'on-start': [
						{ action: '@apply:clean-effect', filter: 'id:passive-hit-counter' },
						{ action: '@apply:effect', effect: 'enhance-pierce' },
					],
				},
			],
		},
		'enhance-pierce': {
			duration: 4,
			description: 'Tăng chỉ số xuyên giáp theo % 100 điểm',
			impacts: {
				'modify-stats': { attribute: 'penetration-percent', value: () => 100 },
				'modify-states': { type: 'immune', filter: 'id:passive-hit-counter' }, // Khóa stack khi đang buff
			},
		},

		// --- CƠ CHẾ DAMAGE GỐC TRUYỀN THỐNG ---
		'normal-damage': {
			description: 'Sát thương cơ bản',
			impacts: {
				'on-start': [
					{
						action: '@apply:modifier',
						attribute: 'current-HP',
						value: (ctx) => -ctx.self['attack-power'],
						reductions: energyDamageReduction,
					},
				],
			},
		},

		// --- S1: REVEAL ---
		'reveal-stealth': {
			duration: 2,
			impacts: { 'modify-states': { type: 'unstealthable' } },
		},

		// --- S2: CƯỜNG HÓA 5 ĐẠN ---
		's2-empower': {
			duration: Infinity,
			description: 'Tăng 50% tốc đánh, hút máu, bắn xuyên tường',
			impacts: {
				'modify-stats': [{ attribute: 'fire-rate', value: ({ self }) => self['fire-rate'] * 0.5 }],
			},
		},
		's2-attack-tracker': {
			duration: Infinity,
			impacts: [
				{ visual: { sprite: { key: 's2-bullet:1' } } }, // Đạn 1
				{ visual: { sprite: { key: 's2-bullet:2' } } }, // Đạn 2
				{ visual: { sprite: { key: 's2-bullet:3' } } }, // Đạn 3
				{ visual: { sprite: { key: 's2-bullet:4' } } }, // Đạn 4
				{ visual: { sprite: { key: 's2-bullet:5' } } }, // Đạn 5
				{
					// Bắn hết viên thứ 5 (nhảy qua stack 6) -> Tự hủy toàn bộ, reset phase về 0
					'on-start': [
						{ action: '@do-act:change-phase', slot: 'normal-attack', phase: 0 },
						{ action: '@apply:clean-effect', filter: 'id:s2-empower' },
						{ action: '@apply:clean-effect', filter: 'id:s2-attack-tracker' },
					],
				},
			],
		},

		// --- ULTIMATE: DẤU ẤN BÙNG NỔ NỘI TẠI ---
		'ult-mark': {
			duration: 4,
			'stack-timeline-policy': 'reset-duration',
			description: 'Dấu ấn nổ 150% + 25% mỗi stack khi dính đòn',
			impacts: [
				{
					// Stack 1: Nổ 150%
					'on-event': {
						'on-hit-taken': [
							{
								action: '@apply:modifier',
								attribute: 'current-HP',
								value: (ctx) => -ctx.self['attack-power'] * 1.5,
								reductions: energyDamageReduction,
							},
							{ action: '@apply:effect', effect: 'ult-mark' }, // Tự bồi đắp stack!
						],
					},
				},
				{
					// Stack 2: Nổ 175%
					'on-event': {
						'on-hit-taken': [
							{
								action: '@apply:modifier',
								attribute: 'current-HP',
								value: (ctx) => -ctx.self['attack-power'] * 1.75,
								reductions: energyDamageReduction,
							},
							{ action: '@apply:effect', effect: 'ult-mark' },
						],
					},
				},
				{
					// Stack 3: Nổ 200%
					'on-event': {
						'on-hit-taken': [
							{
								action: '@apply:modifier',
								attribute: 'current-HP',
								value: (ctx) => -ctx.self['attack-power'] * 2.0,
								reductions: energyDamageReduction,
							},
							{ action: '@apply:effect', effect: 'ult-mark' },
						],
					},
				},
				{
					// Stack 4 (Max Cap - Giữ nổ 225%)
					'on-event': {
						'on-hit-taken': [
							{
								action: '@apply:modifier',
								attribute: 'current-HP',
								value: (ctx) => -ctx.self['attack-power'] * 2.25,
								reductions: energyDamageReduction,
							},
							{ action: '@apply:effect', effect: 'ult-mark' },
						],
					},
				},
			],
		},
	},
};
