/**@type {import('.DSL_regulations/tank-manifest').TankManifest} */
export default {
	name: 'Tsubasa',

	'stat-components': {
		shooting: {
			'fire-rate': 90,
			'fire-range': 552,
			'flight-speed': 10,
		},

		survival: {
			'limit-HP': 2840,
			'physical-armor': 88,
			'energy-shield': 68,
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
