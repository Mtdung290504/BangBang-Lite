/**
 * @typedef {{
 * 		TankManifest: import('.types-system/dsl/tank-manifest').TankManifest
 * 		SkillManifest: import('.types-system/dsl/skill-manifest').SkillManifest
 * }} Types
 */

/**@type {Types['TankManifest']} */
export const stats = {
	name: 'Tsubasa',

	'stat-components': {
		shooting: {
			'fire-rate': 90 * 1.5,
			'fire-range': 552,
			'flight-speed': 15 * 1.5,
		},

		survival: {
			'limit-HP': 3672,
			'physical-armor': 88,
			'energy-shield': 68,
		},

		'attack-power': {
			'damage-type': 'physical',
			'attack-power': 351,
			penetration: 36,
			'crit-damage': 200,
		},

		additional: {
			'energy-point': {
				amount: 150,
				recover: { every: 3, value: { amount: 5 } },
			},
		},

		'movement-speed': 160,
	},

	'render-size': 54,
};

/**@type {Types['SkillManifest']} */
export const skills = {
	passive: [
		{
			type: 'permanent-buff',
			'stat-modifiers': [{ attribute: 'flight-speed', value: { amount: 50, unit: '%' } }],
		},
		{
			type: 'event-triggered',
			'trigger-event': 'on-activate-skill',
			actions: ['implement-later: Tạo khiên phản đòn'],
		},
	],

	'normal-attack': {
		type: 'normal',
		property: 'normal-attack',

		actions: [
			{
				description: `Bắn đạn tâng, tối đa 3 lần, mỗi lần giảm 50% ST, gây ST hồi 5 năng lượng`,

				action: '@create:projectile',
				type: 'custom',

				collider: { type: 'rectangle', size: { width: 41.53 * 1.07, height: 30.04 * 1.07 } },
				enhancements: [
					{
						name: 'bouncing',
						'hit-limit': 3,
						'bounce-range': 336,
						'damage-modifier': { amount: 50, unit: '%' },
					},
				],
				// 'on-dealt-damage': { self: [{ action: '@apply:modify-energy', value: { amount: 5 } }] },
				'on-hit': {
					enemy: [
						{
							action: '@apply:damage',
							source: { attribute: 'attack-power', of: 'self' },
							value: { amount: 100, unit: '%' },
							'is-main-damage': true,
							'display-type': 'main',
						},
						{
							action: '@apply:damage',
							source: { attribute: 'current-HP', of: 'target' },
							value: { amount: 8, unit: '%' },
							'display-type': 'fallback',
						},
					],
					self: [{ action: '@apply:modify-energy', value: { amount: 5 } }],
				},

				'sprite-key': 'normal-attack',
			},
		],
	},

	s1: {
		type: 'normal',
		property: 'skill',
		cooldown: 3,

		// Cách dùng chiêu: chọn hướng
		'casting-method': { type: 'in-direction', range: 528, display: { size: 60 } },

		// Tiêu hao 25đ năng lượng
		'resource-consumption': { energy: { amount: 25 } },

		actions: [
			{
				// Bắn đạn
				action: '@create:projectile',
				type: 'custom',
				'flight-speed': 12 * 1.5,
				'flight-range': 528,

				// Event
				'on-hit': {
					enemy: [
						// Gây 135% tấn công
						{
							action: '@apply:damage',
							source: { attribute: 'attack-power', of: 'self' },
							value: { amount: 150, unit: '%' },
						},
						{
							action: '@apply:damage',
							source: { attribute: 'lost-HP', of: 'target' },
							value: { amount: 10, unit: '%' },
							'damage-type': 'true',
							'display-type': 'bonus',
						},
						'implement-later: Bóng quay về, nhặt được hồi năng lượng, tạo giáp',
					],
					self: [
						{
							action: '@apply:recover-hp',
							value: { amount: 150, unit: '%' },
							source: { attribute: 'attack-power', of: 'self' },
							description: 'Hồi 150% Tấn công HP',
						},
						{ action: '@apply:modify-energy', value: { amount: 50 } },
					],
				},
				'on-dealt-damage': {
					self: ['implement-later: Tăng tốc 75%'],
				},

				// Hitbox
				collider: { type: 'circle', size: { radius: 45 } },

				// Sprite
				'sprite-key': 's1',
				// Không cần render-size, nó kế thừa từ collider
				// 'render-size': { width: 80, height: 80 },
			},
		],
	},

	s2: {
		// Skill cộng dồn
		type: 'stacked',
		property: 'skill',
		'max-stack': 2,
		'stack-time': 8,
		cooldown: 1.5,

		'casting-method': { type: 'in-direction', range: 780, display: { size: 60 } },
		'resource-consumption': { energy: { amount: 50 } },
		actions: [
			{ action: '@do:teleport', range: 150 },

			{
				description: `Bắn đạn tâng, tối đa 3 lần, mỗi lần giảm 50% ST, gây ST hồi 5 năng lượng`,

				action: '@create:projectile',
				type: 'custom',
				'flight-range': 720,
				'flight-speed': 15 * 1.5,
				collider: { type: 'rectangle', size: { width: 274 * 0.5, height: 151 * 0.5 } },

				// 'on-dealt-damage': { self: [{ action: '@apply:modify-energy', value: { amount: 5 } }] },
				'on-hit': {
					enemy: [
						{
							action: '@apply:damage',
							source: { attribute: 'attack-power', of: 'self' },
							value: { amount: 201, unit: '%' },
							'is-main-damage': true,
							'display-type': 'main',
						},
						{
							action: '@apply:damage',
							source: { attribute: 'current-HP', of: 'target' },
							value: { amount: 16, unit: '%' },
							'display-type': '???',
						},
					],
					self: [{ action: '@apply:modify-energy', value: { amount: 40 } }],
				},

				'sprite-key': 's0',
			},

			'implement-later:Lướt',
		],
	},

	ultimate: {
		type: 'normal',
		property: 'skill',
		cooldown: 8,

		'casting-method': { type: 'in-direction', range: 480, display: { size: 80 } },

		actions: [
			{
				action: '@create:projectile',
				description: 'Bắn đạn xuyên + đẩy lui, gây ST',

				type: 'custom',
				'flight-speed': 15,
				'flight-range': 720,

				// Event
				'on-hit': {
					enemy: [
						{
							action: '@apply:damage',
							source: { attribute: 'attack-power', of: 'self' },
							value: { amount: 581, unit: '%' },
						},
						'implement-later: Đẩy lui',
					],
					self: [{ action: '@apply:modify-energy', value: { amount: 30 } }],
				},
				// 'on-dealt-damage': { self: [{ action: '@apply:modify-energy', value: { amount: 20 } }] },

				// Hitbox
				collider: { type: 'rectangle', size: { width: 286.12, height: 160 } },

				// Sprite
				'sprite-key': 's3',

				// Enhances
				enhancements: [{ name: 'piercing' }],
			},
		],
	},
};
