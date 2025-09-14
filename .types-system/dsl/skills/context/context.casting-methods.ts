/**
 * @description
 * - Mô tả skill được tung ra bằng cách nào để làm indicator
 * - Không chỉ thế, còn giới hạn bớt context mà các action có thể sử dụng
 */

interface UseRange {
	/** Quy định phạm vi kích hoạt chiêu, mặc định bằng tầm bắn của tank */
	range?: number;
}

/**
 * Skill người chơi khóa mục tiêu (Ví dụ: Q mất máu)
 */
interface ChosenTargetCast extends UseRange {
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
interface AreaCast extends UseRange {
	type: 'at-area';

	/** Không tác động đến logic game, chỉ hiển thị vòng tròn có d = size chỉ định */
	display?: { size: number };
}

/** Skill theo hướng (Ví dụ: E TV)*/
interface DirectionCast extends UseRange {
	type: 'in-direction';

	/** Không tác động đến logic game, chỉ hiển thị mũi tên có width = size chỉ định */
	display?: { size: number };
}

type SkillCast = ImmediateCast | AreaCast | DirectionCast;

type SkillCastingMethods = TargetedSkillCast | SkillCast;

export type { SkillCast, TargetedSkillCast, SkillCastingMethods };
