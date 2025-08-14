/**@type {import('.types/tank-manifest.js').TankManifest} */
export default {
	name: 'Tsubasa',
	// 'assets-manifest': '/assets/jsons/assets_manifests/001.json',
	// 'skill-manifest': '/assets/jsons/skill_manifests/001.json',
	'stat-components': {
		shooting: {
			'fire-rate': 90,
			range: 552,
			'flight-speed': 12,
		},
		survival: {
			'limit-HP': 2840,
			'physical-armor': 88,
			'enegy-shield': 68,
		},
		'attack-power': {
			'damage-type': 'physical',
			value: 324,
			penetration: 36,
			'crit-damage': 200,
		},
		additional: {
			'energy-point': 150,
		},
		'movement-speed': 160,
	},
};
