import { SkillEntry } from './active.type-entities';
import { RecordSameValueType } from '../../.types';
import { PassiveSkillEntry } from './passive.type-entities';
import { SkillSlot } from './.enums';

/**
 * Định nghĩa tổng cho manifest
 */
export interface SkillManifest
	// Active skills
	extends RecordSameValueType<SkillSlot, SkillEntry> {
	/**
	 * Passive skills — cùng cấu trúc với active, khác ở engine behavior:
	 * - Auto-trigger khi CD xong
	 * - Immune silent
	 */
	passive: PassiveSkillEntry[];
}
