import type { ShapeComponent } from './components/physical.d.ts';
import { RotateDrawableComponent } from './components/render.d.ts';
import { AcceptanceTargetComponent } from './components/combat/state.d.ts';
import type { SingleSkill, MultiPhaseSkill } from './skills/skill-block.d.ts';

export type VarReference = `@get-var:${string}`;
export type AssetReference = `@get-asset:${string}`;
export type EffectReference = `@apply-effect:${string}`;
export type ActionReference = `@create:${string}` | `@do-action:${string}`;
export type OrientationMethod = 'tank-head-direction' | 'mouse-coordinates';

export type AnyRef = VarReference | AssetReference | EffectReference | ActionReference;

/**
 * Các loại component có thể dùng trong skill
 * @todo Bổ sung thêm component trong tương lai
 */
export type SkillComponent = ShapeComponent | RotateDrawableComponent | AcceptanceTargetComponent;

/**
 * Định nghĩa tổng cho manifest, có thể có phase hoặc skill
 * @todo Cần bổ sung thêm `passive` skill
 */
export interface SkillManifest<Phases extends string[] = []> {
	/** Nếu có phase, khai báo các phase */
	phases: Phases extends [] ? undefined : Phases;

	'normal-attack': SkillEntry<Phases>;
	skill_1: SkillEntry<Phases>;
	skill_2: SkillEntry<Phases>;
	skill_3: SkillEntry<Phases>;
}

/** Chuyển kiểu theo có phase hay skill */
type SkillEntry<Phases> = Phases extends [] ? SingleSkill : SingleSkill | MultiPhaseSkill<Phases>;
