import { TankStatValueKey } from '../.types';

export interface TankEntity {
	id: string;
	/** Faction or Alliance id */
	faction: string;
	stats: Record<TankStatValueKey, number>;
	/** Các state hiện tại như bị choáng, tàng hình... */
	states: string[];
}

export interface ImpactorEntity {
	id: string;
	/** Thực thể trúng đạn này là mục tiêu thứ bao nhiêu? (Dùng cho logic sát thương giảm dần theo pierce) */
	hitCount: number;
	distanceTraveled: number;
	timeAlive: number;
}

export interface ModifierContext {
	caster: TankEntity;
	target: TankEntity;
	impactor: ImpactorEntity;
}

export type ModifierCalculation = (ctx: ModifierContext) => number;

export type DamageReductionPolicy = 'armor' | 'magic-armor' | 'true-damage' | 'none';

export interface ApplyModifier {
	/** Action Type identifier */
	type: 'apply-modifier';

	/** Chỉ số nào bị can thiệp? (HP, Energy, MovementSpeed, AP...) */
	attribute: TankStatValueKey;

	/**
	 * Cách thức áp dụng:
	 * - 'instant': Trừ thẳng/Cộng thẳng 1 lần (Cho Damage, Heal, Energy).
	 * - 'duration': Áp dụng liên tục trong tuổi thọ của Effect này (Cho Buff Speed, Buff AP).
	 */
	behavior: 'instant' | 'duration';

	/**
	 * Hàm tính toán lượng thay đổi.
	 * VD: (ctx) => ctx.caster.stats.AP * 0.5 + (ctx.target.stats.MaxHP - ctx.target.stats.HP) * 0.08
	 */
	valueFn: ModifierCalculation;

	/**
	 * (Chỉ dành cho Damage) Policy giảm trừ sát thương.
	 * Engine sẽ tự động móc nối với các buff giảm damage của mục tiêu dựa vào cái này.
	 */
	'reduction-policy'?: DamageReductionPolicy;
}
