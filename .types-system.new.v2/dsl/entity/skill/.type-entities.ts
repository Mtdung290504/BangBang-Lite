import { SkillEntry } from './active.type-entities';
import { RecordSameValueType } from '../../.types';
import { PassiveSkillEntry } from './passive.type-entities';
import { SkillSlot } from './.enums';

/**
 * Định nghĩa tổng cho manifest
 */
export interface SkillManifest<T extends string = string>
	// Active skills
	extends RecordSameValueType<SkillSlot, SkillEntry<T>> {
	/**
	 * Passive skills — cùng cấu trúc với active, khác ở engine behavior:
	 * - Auto-trigger khi CD xong
	 * - Immune silent
	 */
	passives?: PassiveSkillEntry<T>[];
}
