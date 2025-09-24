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
			'flight-speed': 14,
		},
		survival: {
			'limit-HP': 6840,
			'physical-armor': 138,
			'energy-shield': 108,
		},
		'attack-power': {
			'damage-type': 'physical',
			'attack-power': 247,
			penetration: 26,
			'crit-damage': 200,
		},
		'movement-speed': 180,
	},
	'render-size': 62.5,
	'hitbox-size': 55,
};

/**@type {Types['SkillManifest']} */
export const skills = {
	passive: [],

	'normal-attack': {
		type: 'normal',
		property: 'normal-attack',

		actions: [
			{
				description: `Bắn đạn`,
				action: '@create:projectile',
				type: 'default',
				collider: { type: 'rectangle', size: { width: 25 * 1.07 * 5, height: 25 * 1.07 } },
			},
		],
	},

	s1: {
		type: 'normal',
		property: 'skill',
		cooldown: 8,
		actions: [`implement-later:`],
	},

	s2: {
		type: 'normal',
		property: 'skill',
		cooldown: 8,
		actions: [`implement-later:`],
	},

	ultimate: {
		type: 'normal',
		property: 'skill',
		cooldown: 8,
		actions: [`implement-later:`],
	},
};
