export interface TankManifest {
	name: string;
	'assets-manifest': `/assets/jsons/assets_manifests/${string}.json`;
	'skill-manifest': `/assets/jsons/skill_manifests/${string}.json`;
	'stat-components': {
		shooting: {
			'fire-rate': 60 | 90 | 120;
			range: 336 | 408 | 480 | 552;
			'flight-speed': 12 | 15;
		};
		survival: {
			'limit-HP': number;
			'physical-armor': number;
			'enegy-shield': number;
		};
		'attack-power': {
			'damage-type': 'physical' | 'energy';
			value: number;
			penetration: number;
			'crit-damage': 150 | 200;
		};
		additional?: {
			'energy-point': 100 | 150 | 200;
		};
		'movement-speed': 160 | 165 | 170 | 175 | 180;
	};
}
