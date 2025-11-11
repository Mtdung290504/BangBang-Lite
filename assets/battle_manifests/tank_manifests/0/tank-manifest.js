/**
 * @typedef {{
 * 		TankManifest: import('.types-system/dsl/tank-manifest').TankManifest
 * 		SkillManifest: import('.types-system/dsl/skill-manifest').SkillManifest
 * }} Types
 */

/**@type {Types['TankManifest']} */
export const stats = {
	name: '???',
	'stat-components': {
		shooting: {
			'fire-rate': 120,
			'fire-range': 336,
			'flight-speed': 17.5,
		},
		survival: {
			'limit-HP': 7868,
			'physical-armor': 138,
			'energy-shield': 124,
		},
		'attack-power': {
			'damage-type': 'physical',
			'attack-power': 217,
			penetration: 50,
			'crit-damage': 200,
		},
		'movement-speed': 180,
		additional: { 'energy-point': { amount: 150 } },
	},
	'render-size': 62.5,
	'hitbox-size': 55,
};

/**@type {import('.types-system/dsl/skill-manifest').SkillManifest<[1, 2]>} */
export const skills = {
	phases: [1, 2],
	passive: [],

	'normal-attack': {
		type: 'phased',
		'phases-definition': {
			1: {
				type: 'normal',
				property: 'normal-attack',

				actions: [
					{
						description: `Bắn đạn`,
						action: '@create:projectile',
						type: 'default',
						collider: { type: 'rectangle', size: { width: 25 * 1.07 * 5, height: 25 * 1.07 } },
						'flight-range': 408,
						'on-hit': {
							enemy: [
								{
									action: '@apply:damage',

									'display-type': 'bonus',
									value: { amount: 4.5, unit: '%' },
									source: { attribute: 'lost-HP', of: 'self' },
								},
							],
							self: [
								{
									action: '@apply:recover-hp',
									source: { attribute: 'lost-HP', of: 'self' },
									value: { amount: 4.5, unit: '%' },
								},
								{
									action: '@apply:modify-energy',
									value: { amount: +30 },
								},
							],
						},
					},
				],
			},
			2: {
				type: 'normal',
				property: 'normal-attack',
				'resource-consumption': { energy: { amount: 30 }, 'current-HP': { amount: 10, unit: '%' } },

				actions: [
					{
						action: '@create:projectile',
						type: 'custom',
						'sprite-key': 'normal-attack',
						collider: { type: 'rectangle', size: { width: 25 * 1.07 * 5, height: 25 * 1.07 } },
						'on-hit': {
							enemy: [
								{
									action: '@apply:damage',
									'display-type': 'main',
									source: { attribute: 'attack-power', of: 'self' },
									value: { amount: 75, unit: '%' },
								},
								{
									action: '@apply:damage',
									'display-type': 'main',
									value: { amount: 3, unit: '%' },
									source: { attribute: 'lost-HP', of: 'self' },
								},
							],
							self: [
								{
									action: '@apply:recover-hp',
									source: { attribute: 'lost-HP', of: 'self' },
									value: { amount: 3, unit: '%' },
									'display-type': 'main',
								},
							],
						},
					},
					{
						action: '@create:projectile',
						type: 'custom',
						'sprite-key': 'normal-attack',
						'delta-angle': 15,
						collider: { type: 'rectangle', size: { width: 25 * 1.07 * 5, height: 25 * 1.07 } },
						'on-hit': {
							enemy: [
								{
									action: '@apply:damage',
									'display-type': 'bonus',
									source: { attribute: 'attack-power', of: 'self' },
									value: { amount: 75, unit: '%' },
								},
								{
									action: '@apply:damage',

									'display-type': 'bonus',
									value: { amount: 3, unit: '%' },
									source: { attribute: 'lost-HP', of: 'self' },
								},
							],
							self: [
								{
									action: '@apply:recover-hp',
									source: { attribute: 'lost-HP', of: 'self' },
									value: { amount: 3, unit: '%' },
									'display-type': 'bonus',
								},
							],
						},
					},
					{
						action: '@create:projectile',
						type: 'custom',
						'sprite-key': 'normal-attack',
						'delta-angle': -15,
						collider: { type: 'rectangle', size: { width: 25 * 1.07 * 5, height: 25 * 1.07 } },
						'on-hit': {
							enemy: [
								{
									action: '@apply:damage',
									'display-type': 'fallback',
									source: { attribute: 'attack-power', of: 'self' },
									value: { amount: 75, unit: '%' },
								},
								{
									action: '@apply:damage',

									'display-type': 'fallback',
									value: { amount: 3, unit: '%' },
									source: { attribute: 'lost-HP', of: 'self' },
								},
							],
							self: [
								{
									action: '@apply:recover-hp',
									source: { attribute: 'lost-HP', of: 'self' },
									value: { amount: 3, unit: '%' },
									'display-type': 'fallback',
								},
							],
						},
					},
				],
			},
		},
	},

	s1: {
		type: 'phased',
		'phases-definition': {
			1: {
				type: 'normal',
				property: 'skill',
				'resource-consumption': { 'current-HP': { amount: 15, unit: '%' } },
				cooldown: 2,
				actions: [
					// Viên 1
					{
						action: '@create:projectile',
						type: 'custom',
						'sprite-key': 'normal-attack',
						collider: { type: 'rectangle', size: { width: 25 * 1.07 * 5, height: 25 * 1.07 } },
						'flight-speed': 15 * 1.5,
						'flight-range': 650,
						'on-hit': {
							enemy: [
								{
									action: '@apply:damage',
									'display-type': 'main',
									source: { attribute: 'attack-power', of: 'self' },
									value: { amount: 100, unit: '%' },
								},
								{
									action: '@apply:damage',

									'display-type': 'bonus',
									value: { amount: 8, unit: '%' },
									source: { attribute: 'lost-HP', of: 'self' },
								},
							],
							self: [
								{
									action: '@apply:recover-hp',
									source: { attribute: 'lost-HP', of: 'self' },
									value: { amount: 8, unit: '%' },
									'display-type': 'main',
								},
								{ action: '@apply:modify-energy', value: { amount: 10 } },
							],
						},
						'delta-angle': 4,
					},
					// Viên 2
					{
						action: '@create:projectile',
						type: 'custom',
						'sprite-key': 'normal-attack',
						collider: { type: 'rectangle', size: { width: 25 * 1.07 * 5, height: 25 * 1.07 } },
						'flight-speed': 15 * 1.5,
						'flight-range': 650,
						'on-hit': {
							enemy: [
								{
									action: '@apply:damage',
									'display-type': 'main',
									source: { attribute: 'attack-power', of: 'self' },
									value: { amount: 100, unit: '%' },
								},
								{
									action: '@apply:damage',

									'display-type': 'bonus',
									value: { amount: 8, unit: '%' },
									source: { attribute: 'lost-HP', of: 'self' },
								},
							],
							self: [
								{
									action: '@apply:recover-hp',
									source: { attribute: 'lost-HP', of: 'self' },
									value: { amount: 8, unit: '%' },
									'display-type': 'bonus',
								},
								{ action: '@apply:modify-energy', value: { amount: 10 } },
							],
						},
						'delta-angle': -4,
					},
				],
			},
			2: {
				type: 'normal',
				property: 'skill',
				cooldown: 6,
				actions: [
					// Viên 1
					{
						action: '@create:projectile',
						type: 'custom',
						'sprite-key': 'normal-attack',
						collider: { type: 'rectangle', size: { width: 25 * 1.07 * 5, height: 25 * 1.07 } },
						'flight-speed': 15 * 1.5,
						'flight-range': 480,
						'on-hit': {
							enemy: [
								{
									action: '@apply:damage',
									'display-type': 'main',
									source: { attribute: 'attack-power', of: 'self' },
									value: { amount: 75, unit: '%' },
								},
								{
									action: '@apply:damage',
									value: { amount: 8, unit: '%' },
									source: { attribute: 'lost-HP', of: 'self' },
								},
							],
							self: [
								{
									action: '@apply:recover-hp',
									source: { attribute: 'lost-HP', of: 'self' },
									value: { amount: 8, unit: '%' },
								},
								{ action: '@apply:modify-energy', value: { amount: 10 } },
							],
						},
						enhancements: [{ name: 'piercing' }],
					},
					// Viên 2
					{
						action: '@create:projectile',
						type: 'custom',
						'sprite-key': 'normal-attack',
						collider: { type: 'rectangle', size: { width: 25 * 1.07 * 5, height: 25 * 1.07 } },
						'flight-speed': 15 * 1.5,
						'flight-range': 480,
						'on-hit': {
							enemy: [
								{
									action: '@apply:damage',
									'display-type': 'bonus',
									source: { attribute: 'attack-power', of: 'self' },
									value: { amount: 75, unit: '%' },
								},
								{
									action: '@apply:damage',
									'display-type': 'bonus',
									value: { amount: 8, unit: '%' },
									source: { attribute: 'lost-HP', of: 'self' },
								},
							],
							self: [
								{
									action: '@apply:recover-hp',
									source: { attribute: 'lost-HP', of: 'self' },
									value: { amount: 8, unit: '%' },
									'display-type': 'bonus',
								},
								{ action: '@apply:modify-energy', value: { amount: 10 } },
							],
						},
						'delta-angle': 7.5,
						enhancements: [{ name: 'piercing' }],
					},
					// Viên 3
					{
						action: '@create:projectile',
						type: 'custom',
						'sprite-key': 'normal-attack',
						collider: { type: 'rectangle', size: { width: 25 * 1.07 * 5, height: 25 * 1.07 } },
						'flight-speed': 15 * 1.5,
						'flight-range': 480,
						'on-hit': {
							enemy: [
								{
									action: '@apply:damage',
									'display-type': 'fallback',
									source: { attribute: 'attack-power', of: 'self' },
									value: { amount: 75, unit: '%' },
								},
								{
									action: '@apply:damage',

									'display-type': 'fallback',
									value: { amount: 8, unit: '%' },
									source: { attribute: 'lost-HP', of: 'self' },
								},
							],
							self: [
								{
									action: '@apply:recover-hp',
									source: { attribute: 'lost-HP', of: 'self' },
									value: { amount: 8, unit: '%' },
									'display-type': 'fallback',
								},
								{ action: '@apply:modify-energy', value: { amount: 10 } },
							],
						},
						'delta-angle': -7.5,
						enhancements: [{ name: 'piercing' }],
					},
					// Viên 4
					{
						action: '@create:projectile',
						type: 'custom',
						'sprite-key': 'normal-attack',
						collider: { type: 'rectangle', size: { width: 25 * 1.07 * 5, height: 25 * 1.07 } },
						'flight-speed': 15 * 1.5,
						'flight-range': 480,
						'on-hit': {
							enemy: [
								{
									action: '@apply:damage',
									'display-type': 'bonus',
									source: { attribute: 'attack-power', of: 'self' },
									value: { amount: 75, unit: '%' },
								},
								{
									action: '@apply:damage',

									'display-type': 'bonus',
									value: { amount: 8, unit: '%' },
									source: { attribute: 'lost-HP', of: 'self' },
								},
							],
							self: [
								{
									action: '@apply:recover-hp',
									source: { attribute: 'lost-HP', of: 'self' },
									value: { amount: 8, unit: '%' },
									'display-type': 'bonus',
								},
								{ action: '@apply:modify-energy', value: { amount: 10 } },
							],
						},

						enhancements: [{ name: 'piercing' }],
						'delta-angle': 15,
					},
					// Viên 5
					{
						action: '@create:projectile',
						type: 'custom',
						'sprite-key': 'normal-attack',
						collider: { type: 'rectangle', size: { width: 25 * 1.07 * 5, height: 25 * 1.07 } },
						'flight-speed': 15 * 1.5,
						'flight-range': 480,
						'on-hit': {
							enemy: [
								{
									action: '@apply:damage',
									'display-type': 'fallback',
									source: { attribute: 'attack-power', of: 'self' },
									value: { amount: 75, unit: '%' },
								},
								{
									action: '@apply:damage',

									'display-type': 'fallback',
									value: { amount: 8, unit: '%' },
									source: { attribute: 'lost-HP', of: 'self' },
								},
							],
							self: [
								{
									action: '@apply:recover-hp',
									source: { attribute: 'lost-HP', of: 'self' },
									value: { amount: 8, unit: '%' },
									'display-type': 'fallback',
								},
								{ action: '@apply:modify-energy', value: { amount: 10 } },
							],
						},

						enhancements: [{ name: 'piercing' }],
						'delta-angle': -15,
					},
				],
				'resource-consumption': { 'current-HP': { amount: 30, unit: '%' } },
			},
		},
	},

	s2: {
		type: 'normal',
		property: 'skill',
		cooldown: 24,
		actions: [
			{
				action: '@do:teleport',
				range: 800,
			},
			`implement-later:`,
		],
	},

	ultimate: {
		type: 'normal',
		property: 'skill',
		cooldown: 1,
		actions: [
			{
				action: '@do:change-phase',
				method: 'next',
			},
			// {
			// 	action: '@do:change-phase',
			// 	method: 'to-phase:2',
			// 	duration: 6,
			// },
		],
	},
};
