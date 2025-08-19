import type { SkillEntry } from './active-skill-manifest';
import type { PassiveSkillEntry } from './passive-skill-manifest';

/**
 * Định nghĩa tổng cho manifest, có thể có phase hoặc skill
 * @todo Cần bổ sung thêm `passive` skill
 */
interface SkillManifest<Phases extends number[] = []> {
	/** Nếu có phase, khai báo các phase */
	phases: Phases extends [] ? never : Phases;

	// Passive skills
	passive: PassiveSkillEntry<Phases>[];

	// Active skills
	'normal-attack': SkillEntry<Phases>;
	s1: SkillEntry<Phases>;
	s2: SkillEntry<Phases>;
	ultimate: SkillEntry<Phases>;
}

export type { SkillManifest };
