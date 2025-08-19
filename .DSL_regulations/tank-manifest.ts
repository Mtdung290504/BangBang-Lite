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

/**
 * ***Note:*** Nếu để phase này có năng lượng mà phase khác không sẽ chưa có case xử lý
 */
interface FullStats {
	shooting: ShootingStats;
	survival: SurvivalStats;
	'attack-power': AttackPowerStats;
	additional?: AdditionalStats;
	'movement-speed': 160 | 165 | 170 | 175 | 180;
}

/** Phase 2+ là Partial */
type PhasePatch = Partial<{ [K in keyof FullStats]: Partial<FullStats[K]> }>;

export interface TankManifest {
	/** Default: 52.5 */
	'hitbox-size'?: number;

	/** Default: 52.5 */
	'render-size'?: number;

	/** Phase 1 full, Phase 2+ optional */
	'stat-components': [FullStats, ...PhasePatch[]];
}
