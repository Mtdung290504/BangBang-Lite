import { RecordSameValueType, ValueUnit } from '../../.types';
import { MovementSpeedEnum } from '../../physic/movement.enums';
import { ContextStatKeys } from './.enums';
import { AdditionalStats, AttackPowerStats, ShootingStats, SurvivalStats } from './.types';

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

type ContextStat = RecordSameValueType<ContextStatKeys, number>;
type CalcStat = (stat: FullStats, contextStat: ContextStat) => number;

// Test

/**Mỗi 1% HP đã mất tăng 1% tốc chạy */
const bonusSpeedByLostHP: CalcStat = (stat, contextStat) =>
	stat['movement-speed'] * (contextStat['lost-HP'] / stat.survival['limit-HP']); // *x nếu x% thay vì 1%

/**Gây damage = 50% HP đã mất */
const damageByLostHP: CalcStat = (_stat, contextStat) => contextStat['lost-HP'] * 0.5;
