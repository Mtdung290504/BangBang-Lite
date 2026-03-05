import { SkillEntry } from './active.type-entities';
import { RecordSameValueType } from '../../.types';
import { PassiveSkillEntry } from './passive.type-entities';
import { SkillSlot } from './.enums';

/**
 * Định nghĩa tổng cho manifest, có thể có phase hoặc skill
 * @todo Cần bổ sung thêm `passive` skill
 */
export interface SkillManifest
	// Active skills
	extends RecordSameValueType<SkillSlot, SkillEntry> {
	// Passive skills
	passive: PassiveSkillEntry<[]>[];
}
