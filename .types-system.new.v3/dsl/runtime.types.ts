import type { TankStatValueKey } from './entity/tank/.enums';

/**
 * Runtime stats — engine cung cấp khi gọi ValueResolver / ConditionPredicate.
 * Bao gồm mọi key trong TankStatValueKey.
 * KHÔNG có ally-nearby/enemy-nearby — dùng sensor entity pattern.
 */
export type RuntimeStats = Record<TankStatValueKey, number>;

/**
 * Snapshot của 1 entity tại thời điểm tính toán.
 * Bao gồm toàn bộ stats + query effect.
 */
export type EntitySnapshot = Readonly<RuntimeStats> & {
	/**
	 * Lấy về object chứa stack của effect\
	 * Lưu ý stack sẽ không bao giờ có giá trị 0.
	 *
	 * @example
	 * // Conditional proc: chỉ heal khi target đang bị mark
	 * value: ctx => ctx.target.effect('enemy-mark')?.stack ? ctx.self['attack-power'] * 0.2 : 0
	 *
	 * // Check bản thân đang ở trạng thái cường hóa
	 * conditions: ctx => ctx.self.effect('s2-empower')?.stack
	 */
	effect(id: string): { stack?: number };
};

/**
 * Context engine cung cấp cho function resolver.
 *
 * **Convention quan trọng:**
 * - `self` — LUÔN là **caster** (tank đã kích hoạt skill), bất kể effect đang áp lên ai.
 * - `target` — entity đang nhận effect, kế thừa từ `impact` context:
 *   - Trong `target-effect`: target = entity trúng đòn.
 *   - Trong `self-action`: target = chính caster (trùng với self).
 *   - Trong `on-event`: target = entity trigger event (VD: attacker trong `on-hit-taken`).
 *
 * @example
 * // Damage = attack-power của CASTER
 * value: ctx => -ctx.self['attack-power'] * 1.5
 *
 * // Conditional: chỉ heal khi kẻ vừa đánh mình đang bị mark
 * value: ctx => ctx.target.hasEffect('enemy-mark') ? ctx.self['attack-power'] * 0.15 : 0
 */
export interface ValueResolveContext {
	/** Luôn là caster — tank đã kích hoạt skill */
	caster: EntitySnapshot;

	/** Entity nhận effect / trigger event (phụ thuộc context, xem JSDoc) */
	target: EntitySnapshot;

	/** Số hit mà skill parent đã đánh trúng */
	'skill-hit-count': number;

	getChargeTime(name: string): number;
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
export type ValueResolver<ReturnEnum = number> = (ctx: ValueResolveContext) => ReturnEnum | (number & {});

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
