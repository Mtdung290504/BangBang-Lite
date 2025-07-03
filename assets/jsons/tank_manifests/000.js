/**@type {import('.types/tank-manifest.js').TankManifest} */
export default {
	name: 'Admin',
	'assets-manifest': '/assets/jsons/assets_manifests/000.json',
	'skill-manifest': '/assets/jsons/skill_manifests/000.json',
	'stat-components': {
		shooting: {
			'fire-rate': 120,
			range: 480,
			'flight-speed': 15,
		},
		survival: {
			'limit-HP': 4840,
			'physical-armor': 138,
			'enegy-shield': 108,
		},
		'attack-power': {
			'damage-type': 'physical',
			value: 306,
			penetration: 26,
			'crit-damage': 200,
		},
		'movement-speed': 180,
	},
};
