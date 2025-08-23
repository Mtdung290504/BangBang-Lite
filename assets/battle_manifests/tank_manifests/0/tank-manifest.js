/**
 * @typedef {import('DSL/tank-manifest').TankManifest} TankManifest
 * @typedef {import('DSL/skills/skill-manifest').SkillManifest} SkillManifest
 */

/**@type {TankManifest} */
export const stats = {
	name: '???',
	// 'assets-manifest': '/assets/jsons/assets_manifests/000.json',
	// 'skill-manifest': '/assets/jsons/skill_manifests/000.json',
	'stat-components': {
		shooting: {
			'fire-rate': 120,
			'fire-range': 480,
			'flight-speed': 10,
		},
		survival: {
			'limit-HP': 4840,
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
};

export const skills = {};
