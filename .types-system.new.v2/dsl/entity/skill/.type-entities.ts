import { SkillEntry } from './active.type-entities';
import { RecordSameValueType } from '../../.types';
import { PassiveSkillEntry } from './passive.type-entities';
import { SkillSlot } from './.enums';

/**
 * Định nghĩa tổng cho manifest
 */
export interface SkillManifest<E extends string = string, P extends string = string>
	// Active skills
	extends RecordSameValueType<SkillSlot, SkillEntry<E, P>> {
	/**
	 * Passive skills — cùng cấu trúc với active, khác ở engine behavior:
	 * - Auto-trigger khi CD xong
	 * - Immune silent
	 */
	passives?: PassiveSkillEntry<E, P>[];
}
