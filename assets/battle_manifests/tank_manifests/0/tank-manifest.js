/**
 * @typedef {import('.types-system/dsl/tank-manifest').TankManifest} TankManifest
 * @typedef {import('.types-system/dsl/skills/skill-manifest').SkillManifest} SkillManifest
 */

/**@type {TankManifest} */
export const stats = {
	name: '???',
	'stat-components': {
		shooting: {
			'fire-rate': 120,
			'fire-range': 480,
			'flight-speed': 10,
		},
		survival: {
			'limit-HP': 6840,
			'physical-armor': 138,
			'energy-shield': 108,
		},
		'attack-power': {
			'damage-type': 'physical',
			'attack-power': 306,
			penetration: 26,
			'crit-damage': 200,
		},
		'movement-speed': 180,
	},
	'render-size': 62.5,
	'hitbox-size': 55,
};

export const skills = {};
