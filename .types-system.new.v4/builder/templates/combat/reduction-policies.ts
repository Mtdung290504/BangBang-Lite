import { ModifyFuncBuilder } from '../../../dsl/runtime.types';

// Tránh bug nổ Infinity damage
const applyDef = (v: number, d: number) => (v * 100) / (100 + d === -100 ? -99 : d);

export const reduceByNaImmune: ModifyFuncBuilder = (target) => (v, ctx) => -(v * ctx[target]['na-damage-immunity']);
export const reduceBySkillImmune: ModifyFuncBuilder = (target) => (v, ctx) =>
	-(v * ctx[target]['skill-damage-immunity']);

export const reduceByEnergyShield: ModifyFuncBuilder = (target) => (v, ctx) => {
	const { 'energy-shield': shield, 'penetration-unit': penUnit, 'penetration-percent': penPercent } = ctx[target];
	const def = shield * (1 - penPercent / 100) - penUnit;
	return applyDef(v, def) - v;
};

export const reduceByPhysicalArmor: ModifyFuncBuilder = (target) => (v, ctx) => {
	const { 'physical-armor': armor, 'penetration-unit': penUnit, 'penetration-percent': penPercent } = ctx[target];
	const def = armor * (1 - penPercent / 100) - penUnit;
	return applyDef(v, def) - v;
};

/**Với damage chuẩn, không có policy */
