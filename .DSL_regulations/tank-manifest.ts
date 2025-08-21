interface ShootingStats {
	'fire-rate': 60 | 90 | 120;
	'fire-range': 336 | 408 | 480 | 552 | 168;
	'flight-speed': 10;
}

interface SurvivalStats {
	'limit-HP': number;
	'physical-armor': number;
	'energy-shield': number;
}

interface AttackPowerStats {
	'damage-type': 'physical' | 'energy';
	value: number;
	penetration: number;
	'crit-damage': 150 | 200;
}

interface AdditionalStats {
	'energy-point': 100 | 150 | 200;
}

interface FullStats {
	shooting: ShootingStats;
	survival: SurvivalStats;
	'attack-power': AttackPowerStats;
	additional?: AdditionalStats;
	'movement-speed': 160 | 165 | 170 | 175 | 180;
}

interface TankManifest {
	/** Default: 52.5 */
	'hitbox-size'?: number;

	/** Default: 52.5 */
	'render-size'?: number;

	/** Phase 1 full, Phase 2+ optional */
	'stat-components': FullStats;
}

export type { TankManifest, ShootingStats, SurvivalStats, AttackPowerStats, AdditionalStats };
