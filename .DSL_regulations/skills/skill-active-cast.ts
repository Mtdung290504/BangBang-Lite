/** Chỉ bấm nút là dùng (Ví dụ: R Tào Tháo) */
interface ImmediateCast {
	type: 'immediately';
}

/**
 * - Skill khóa mục tiêu (Ví dụ: Q mất máu)
 * - Có thể chọn bằng chuột hoặc auto nearest
 */
interface TargetCast {
	type: 'on-target';
	'get-target-method': 'player-choose' | 'nearest';
	target: 'any' | 'ally' | 'enemy';
	range: number;
}

/** 3. Skill chọn vị trí tung ra (Ví dụ: R Magneto) */
interface PointCast {
	type: 'at-point';
	range: number;
}

/** Skill theo hướng (Ví dụ: E TV)*/
interface DirectionCast {
	type: 'in-direction';

	/** Dùng theo hướng ngược lại */
	reverse?: boolean;
}

type ActiveSkillCast = ImmediateCast | TargetCast | PointCast | DirectionCast;

export type { ImmediateCast, TargetCast, PointCast, DirectionCast, ActiveSkillCast };
