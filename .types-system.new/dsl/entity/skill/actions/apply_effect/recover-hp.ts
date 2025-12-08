import { DealtDamage } from './dealt-damage';

export interface RecoverHP extends Omit<DealtDamage, 'action' | 'damage-type' | 'is-main-damage'> {
	action: '@apply:recover-hp';
}

// Example
const t: RecoverHP = {
	action: '@apply:recover-hp',
	source: {
		attribute: 'lost-HP',
		of: 'self',
	},
	value: { amount: 100 },
};
