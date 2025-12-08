import { ValueWithUnit } from '../.types';
import { BonusStatStateEnum } from '../entity/tank/.enums';
import { AdditionalStats, AttackPowerStats, ShootingStats, SurvivalStats } from '../entity/tank/.types';

export interface ModifyStat {
	stat: keyof (ShootingStats & SurvivalStats & AttackPowerStats & AdditionalStats) | BonusStatStateEnum;
	value: ValueWithUnit;
}
