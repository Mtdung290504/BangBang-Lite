import { ValueWithUnit } from '../../.types';
import { CritDamageEnum, EnergyAmountEnum, FireRateEnum, TankDamageType } from './.enums';
import { FlightSpeedEnum } from '../../physic/movement.enums';
import { RangeEnum } from '../../physic/range.enums';

export interface ShootingStats {
	'fire-rate': FireRateEnum;
	'fire-range': RangeEnum;
	'flight-speed': FlightSpeedEnum;
}

export interface SurvivalStats {
	'limit-HP': number;
	'physical-armor': number;
	'energy-shield': number;
}

export interface AttackPowerStats {
	'damage-type': TankDamageType;
	'attack-power': number;
	penetration: number;
	'crit-damage': CritDamageEnum;
}

export interface AdditionalStats {
	'energy-point': {
		amount: EnergyAmountEnum;
		recover?: {
			every: number;
			value: ValueWithUnit;
		};
	};
}
