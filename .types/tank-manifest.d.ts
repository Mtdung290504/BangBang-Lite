export interface TankManifest {
	name: string;
	'assets-manifest': `/assets/jsons/assets_manifests/${string}.json`;
	'skill-manifest': `/assets/jsons/skill_manifests/${string}.json`;
	'stat-components': {
		shooting: {
			fireRate: 60 | 90 | 120;
			range: 336 | 408 | 480 | 552;
			flightSpeed: 12 | 15;
		};
		survival: {
			limitHP: number;
			armor: number;
			shield: number;
		};
		'attack-power': {
			dmgType: 'physics' | 'energy';
			value: number;
			penetration: number;
			critDmg: 150 | 200;
		};
		additional?: {
			energyPoint: 100 | 150 | 200;
		};
		'movement-speed': 160 | 165 | 170 | 175 | 180;
	};
}
