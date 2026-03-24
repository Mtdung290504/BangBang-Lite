import { RecordSameValueType } from '../../.types';
import { MovementSpeedEnum } from '../../physic/movement.enums';
import { ContextStatKeys } from './.enums';
import { AdditionalStats, AttackPowerStats, ShootingStats, SurvivalStats } from './.types';
import type { ValueResolver } from '../../runtime.types';

interface FullStats {
	shooting: ShootingStats;
	survival: SurvivalStats;
	'attack-power': AttackPowerStats;
	additional?: AdditionalStats;
	'movement-speed': MovementSpeedEnum;
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

export type { TankManifest, ShootingStats, SurvivalStats, AttackPowerStats, AdditionalStats };
