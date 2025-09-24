import type { ValueWithUnit } from './skills/value-with-unit';
import type { TankDamageType } from './enums/damage-types';

interface ShootingStats {
	'fire-rate': 60 | 90 | 120;
	'fire-range': 336 | 408 | 480 | 552 | 168;
	'flight-speed': 12 | 14;
}

interface SurvivalStats {
	'limit-HP': number;
	'physical-armor': number;
	'energy-shield': number;
}

interface AttackPowerStats {
	'damage-type': TankDamageType;
	'attack-power': number;
	penetration: number;
	'crit-damage': 150 | 200;
}

interface AdditionalStats {
	'energy-point': {
		amount: 100 | 150 | 200;
		recover?: {
			every: number;
		} & ValueWithUnit;
	};
}

interface FullStats {
	shooting: ShootingStats;
	survival: SurvivalStats;
	'attack-power': AttackPowerStats;
	additional?: AdditionalStats;
	'movement-speed': 160 | 165 | 170 | 175 | 180;
}

interface TankManifest {
	/** Thực tế hiện tại không cần, đưa vào đọc manifest cho dễ */
	name: string;

	/** Default: 52.5 */
	'hitbox-size'?: number;

	/** Default: 52.5 */
	'render-size'?: number;

	'stat-components': FullStats;
}

type SkillSlot = 's1' | 's2' | 'ultimate' | 'normal-attack';

export type { TankManifest, ShootingStats, SurvivalStats, AttackPowerStats, AdditionalStats, SkillSlot };
