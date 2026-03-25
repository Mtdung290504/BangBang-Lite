import { ReductionFn } from '../../../dsl/runtime.types';
import { getPierce, getReduction } from './getters';

// Tránh bug nổ Infinity damage
const applyDef = (v: number, d: number) => (v * 100) / (100 + d === -100 ? -99 : d);
const applyDamageReduction = (v: number, r: number) => v * (1 - r / 100);

export const energyDamageReduction: ReductionFn = (v, ctx) => {
	const { pierceUnit, piercePercent } = getPierce(ctx, 'self');
	const { shield, damageReduction } = getReduction(ctx);

	const def = shield * (1 - piercePercent / 100) - pierceUnit;
	return applyDamageReduction(applyDef(v, def), damageReduction);
};

export const physicalDamageReduction: ReductionFn = (v, ctx) => {
	const { pierceUnit, piercePercent } = getPierce(ctx, 'self');
	const { armor, damageReduction } = getReduction(ctx);

	const def = armor * (1 - piercePercent / 100) - pierceUnit;
	return applyDamageReduction(applyDef(v, def), damageReduction);
};

/**Với damage chuẩn, không có policy */
