/**
 * @description
 * - Mô tả skill được tung ra bằng cách nào để làm indicator
 * - Không chỉ thế, còn giới hạn bớt context mà các action có thể sử dụng
 */

/** Phạm vi giới hạn */
type Range = { range: number };

/** Kích thước, đường kính với skill `at-area`, độ rộng với skill `in-direction` */
type Size = { size: number };

/**
 * Skill người chơi khóa mục tiêu (Ví dụ: Q mất máu)
 */
interface ChosenTargetCast extends Range {
	type: 'on-target';
	target: 'any' | 'ally' | 'enemy';
}

/**
 * Skill khóa mục tiêu nhưng mục tiêu gần nhất thay vì player chọn
 */
interface NearestTargetCast extends Omit<ChosenTargetCast, 'type'> {
	type: 'on-nearest-target';
}

type TargetedSkillCast = ChosenTargetCast | NearestTargetCast;

/** Chỉ bấm nút là dùng (Ví dụ: R Tào Tháo) */
interface ImmediateCast {
	type: 'immediately';
}

/** Skill chọn vùng tung ra (Ví dụ: R Magneto) */
interface AreaCast extends Range, Size {
	type: 'at-area';
}

/** Skill theo hướng (Ví dụ: E TV)*/
interface DirectionCast extends Range, Size {
	type: 'in-direction';
}

type SkillCast = ImmediateCast | AreaCast | DirectionCast;

export type SkillCastingMethods = TargetedSkillCast | SkillCast;
