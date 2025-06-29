/**@type {import('.types/tank-manifest.js').TankManifest} */
export default {
	name: 'Tsubasa',
	'assets-manifest': '/assets/jsons/assets_manifests/001.json',
	'skill-manifest': '/assets/jsons/skill_manifests/001.json',
	'stat-components': {
		shooting: {
			fireRate: 90,
			range: 552,
			flightSpeed: 12,
		},
		survival: {
			limitHP: 2840,
			armor: 88,
			shield: 68,
		},
		'attack-power': {
			dmgType: 'physics',
			value: 324,
			penetration: 36,
			critDmg: 200,
		},
		additional: {
			energyPoint: 150,
		},
		'movement-speed': 160,
	},
};
