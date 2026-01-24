import { SkillEntry } from './active.type-entities';
import { PassiveSkillEntry } from './passive.type-entities';

/**
 * Định nghĩa tổng cho manifest, có thể có phase hoặc skill
 * @todo Cần bổ sung thêm `passive` skill
 */
export interface SkillManifest<Phases extends number[] = []> {
	// Passive skills
	passive: PassiveSkillEntry<Phases>[];

	// Active skills
	'normal-attack': SkillEntry<Phases>;
	s1: SkillEntry<Phases>;
	s2: SkillEntry<Phases>;
	ultimate: SkillEntry<Phases>;
}
