import type { ValueWithUnit } from '../../value-with-unit';

export interface ModifyEnergyAction {
	action: '@apply:modify-energy';
	value: ValueWithUnit;
}
