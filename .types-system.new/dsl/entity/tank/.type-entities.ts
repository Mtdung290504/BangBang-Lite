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

type ContextStat = RecordSameValueType<ContextStatKeys, number>;

// ===== Test: Sử dụng ValueResolver từ runtime.types.ts =====

/** Mỗi 1% HP đã mất tăng 1% tốc chạy */
const bonusSpeedByLostHP: ValueResolver = (ctx) =>
	ctx.self['movement-speed'] * (ctx.self['lost-HP'] / ctx.self['limit-HP']); // *x nếu x% thay vì 1%

/** Gây damage = 50% HP đã mất */
const damageByLostHP: ValueResolver = (ctx) => ctx.self['lost-HP'] * 0.5;
