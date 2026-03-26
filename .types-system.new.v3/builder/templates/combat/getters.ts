import { ValueResolveContext } from '../../../dsl/runtime.types';

export const getPierce = (ctx: ValueResolveContext, from: 'self' | 'target' = 'target') => ({
	pierceUnit: ctx[from]['penetration-unit'],
	piercePercent: ctx[from]['penetration-percent'],
});

export const getReduction = (ctx: ValueResolveContext, from: 'self' | 'target' = 'target') => ({
	shield: ctx[from]['energy-shield'],
	armor: ctx[from]['physical-armor'],
	damageReduction: ctx[from]['damage-reduction'],
});
