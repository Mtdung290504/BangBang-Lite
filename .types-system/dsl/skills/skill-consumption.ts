import type { ValueWithUnit } from './value-with-unit';

/** Tiêu hao cả năng lượng và máu */
type SkillConsumptionBuilder<T extends string[] = []> = Partial<{ [K in T[number]]: ValueWithUnit }>;

type CONSUMPTION_TYPES = ['limit-HP', 'current-HP', 'energy'];

/**
 * Khai báo tiêu hao khi dùng skill
 */
type SkillConsumption = SkillConsumptionBuilder<CONSUMPTION_TYPES>;

export type { SkillConsumption };
