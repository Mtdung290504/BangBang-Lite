/**@type {import('.DSL_regulations/skills/skill-manifest').SkillManifest} */
export default {
	passive: [
		{
			type: 'permanent-buff',
			'stat-modifiers': [
				{
					attribute: 'flight-speed',
					value: { amount: 50 },
				},
			],
		},
		{
			type: 'event-triggered',
			'trigger-event': 'on-activate-skill',
			actions: 'implement-later: Tạo khiên phản đòn',
		},
	],

	'normal-attack': {
		type: 'normal',
		property: 'normal-attack',
		'casting-method': { type: 'in-direction' },
		actions: [
			{
				name: 'create-default-projectile',
				collider: {
					type: 'rectangle',
					width: 0,
					height: 0,
				},
				enhancements: [{ name: 'bouncing', 'hit-limit': 3, 'damage-reduction': { amount: 50 } }],
				'on-dealt-damage': { self: ['implement-later: Hồi 5 năng lượng'] },
			},
		],
	},

	s1: {
		type: 'normal',
		property: 'skill',
		cooldown: 8,

		// Cách dùng chiêu: chọn hướng
		'casting-method': { type: 'in-direction' },

		// Tiêu hao 25đ năng lượng
		'resource-consumption': { energy: { amount: 25, unit: 'point' } },

		actions: [
			{
				// Bắn đạn
				name: 'create-custom-projectile',

				// Event của đạn
				'on-hit': {
					enemy: [
						// Gây 135% tấn công
						{ name: 'dealt-damage', source: { attribute: 'damage', of: 'self' }, value: { amount: 135 } },
						'implement-later: Bóng quay về, nhặt được hồi năng lượng, tạo giáp',
					],
				},
				'on-dealt-damage': {
					self: ['implement-later: Tăng tốc 75%'],
				},

				// Thông số đạn
				'flight-speed': 10,

				// Hitbox
				collider: {
					type: 'circle',
					radius: 30,
				},

				// Sprite đạn
				'sprite-key': 's1',
				'render-size': {
					width: 60,
					height: 60,
				},
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

		'casting-method': { type: 'in-direction' },
		'resource-consumption': { energy: { amount: 50, unit: 'point' } },
		actions: ['implement-later: Lướt'],
	},

	ultimate: {
		type: 'normal',
		property: 'skill',
		cooldown: 8,

		'casting-method': { type: 'in-direction' },
		actions: ['implement-later: Tung bóng bay xuyên, đẩy lui'],
	},
};
