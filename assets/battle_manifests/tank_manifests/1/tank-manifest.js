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
			'fire-rate': 90,
			'fire-range': 552,
			'flight-speed': 12,
		},

		survival: {
			'limit-HP': 2840,
			'physical-armor': 88,
			'energy-shield': 68,
		},

		'attack-power': {
			'damage-type': 'physical',
			'attack-power': 324,
			penetration: 36,
			'crit-damage': 200,
		},

		additional: {
			'energy-point': {
				amount: 150,
				recover: { every: 3, amount: 5 },
			},
		},

		'movement-speed': 160,
	},
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
				type: 'default',

				collider: { type: 'rectangle', size: { width: 41.53 * 1.07, height: 30.04 * 1.07 } },
				enhancements: [{ name: 'bouncing', 'hit-limit': 3, 'damage-reduction': { amount: 50 } }],
				'on-dealt-damage': { self: [{ action: '@recover:energy', amount: 5 }] },
			},
		],
	},

	s1: {
		type: 'normal',
		property: 'skill',
		cooldown: 8,

		// Cách dùng chiêu: chọn hướng
		'casting-method': { type: 'in-direction', range: 528, display: { size: 60 } },

		// Tiêu hao 25đ năng lượng
		'resource-consumption': { energy: { amount: 25 } },

		actions: [
			{
				// Bắn đạn
				action: '@create:projectile',
				type: 'custom',
				'flight-speed': 12,

				// Event
				'on-hit': {
					enemy: [
						// Gây 135% tấn công
						{
							name: 'dealt-damage',
							source: { attribute: 'attack-power', of: 'self' },
							value: { amount: 135 },
						},
						'implement-later: Bóng quay về, nhặt được hồi năng lượng, tạo giáp',
					],
				},
				'on-dealt-damage': {
					self: ['implement-later: Tăng tốc 75%'],
				},

				// Hitbox
				collider: { type: 'circle', size: { radius: 40 } },

				// Sprite
				'sprite-key': 's1',
				'render-size': { width: 80, height: 80 },
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

		'casting-method': { type: 'in-direction', range: 480, display: { size: 60 } },
		'resource-consumption': { energy: { amount: 50, unit: 'unit' } },
		actions: ['implement-later: Lướt'],
	},

	ultimate: {
		type: 'normal',
		property: 'skill',
		cooldown: 8,

		'casting-method': { type: 'in-direction', range: 528, display: { size: 80 } },
		actions: ['implement-later: Tung bóng bay xuyên, đẩy lui'],
	},
};
