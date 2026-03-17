import { AnyActionEntry } from './actions';

/**
 * ---------------------------------------------------------------------------
 * TYPES-SYSTEM V2: SKILL MANIFEST
 * ---------------------------------------------------------------------------
 */

export interface SkillManifest {
	/** ID định danh skill dùng trong tool/database */
	id: string;

	/** Tên skill */
	name: string;

	/** Nhãn nhóm cooldown (Mặc định: trùng với `id` của chiêu) */
	'cooldown-group'?: string;

	/** Thời gian hồi chiêu cơ bản (giây) */
	'base-cooldown'?: number;

	/** Năng lượng cơ bản tiêu hao */
	'base-energy-cost'?: number;

	/** 
	 * Giai đoạn thực thi.
	 * Có thể thêm bất kỳ phase string nào: 'on-cast', 'on-charge-end', 'on-impact'...
	 * Bất kỳ phase nào cũng chứa một Array các Event/Actions nối tiếp nhau (hoặc WaitAction).
	 */
	phases: Record<string, AnyActionEntry[]>;
}
