import { MovementSpeedEnum } from '../../physic/movement.enums';
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

type SkillSlot = 's1' | 's2' | 'ultimate' | 'normal-attack' | 'sp';

export type { TankManifest, ShootingStats, SurvivalStats, AttackPowerStats, AdditionalStats, SkillSlot };
