import type { TankStatValueKey } from './entity/tank/.enums';

/**
 * Runtime stats — engine cung cấp khi gọi ValueResolver / ConditionPredicate.
 * Bao gồm mọi key trong TankStatValueKey.
 * KHÔNG có ally-nearby/enemy-nearby — dùng sensor entity pattern.
 */
export type RuntimeStats = Record<TankStatValueKey, number>;

/**
 * Context engine cung cấp cho function resolver.
 * Skill module JS nhận đầy đủ stats của cả self lẫn target.
 */
export interface ValueResolveContext {
	self: Readonly<RuntimeStats>;
	target: Readonly<RuntimeStats>;
}

/**
 * Hàm tính giá trị — khai báo trong JS module, engine gọi khi cần.
 * Return: giá trị đã tính xong (số thuần, không có đơn vị).
 *
 * @example
 * // Gây damage = 50% HP đã mất
 * const damageByLostHP: ValueResolver = (ctx) => ctx.self['lost-HP'] * 0.5;
 *
 * // Mỗi 1% HP mất tăng 1% tốc chạy
 * const speedByLostHP: ValueResolver = (ctx) =>
 *     ctx.self['movement-speed'] * (ctx.self['lost-HP'] / ctx.self['limit-HP']);
 */
export type ValueResolver = (ctx: ValueResolveContext) => number;

/**
 * Reduction function — 1 bước trong pipeline giảm trừ.
 * Engine chạy lần lượt: rawValue → fn1 → fn2 → ... → finalValue
 *
 * @example
 * // Giảm theo giáp vật lý
 * const armorReduction: ReductionFn = (value, ctx) =>
 *     value * (1 - ctx.target['physical-armor'] / (ctx.target['physical-armor'] + 600));
 */
export type ReductionFn = (value: number, ctx: ValueResolveContext) => number;

/**
 * Condition predicate — engine gọi khi cần check điều kiện.
 *
 * @example
 * const lowHP: ConditionPredicate = (ctx) =>
 *     ctx.self['current-HP'] / ctx.self['limit-HP'] < 0.3;
 */
export type ConditionPredicate = (ctx: ValueResolveContext) => boolean;
