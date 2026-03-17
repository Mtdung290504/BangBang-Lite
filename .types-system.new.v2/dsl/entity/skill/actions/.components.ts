import { EffectManifestBase } from '../../../combat/effect.manifest';

export type EntityId = string;

// ---------------------------------------------------------------------------
// TYPES-SYSTEM V2: GENERIC ACTION COMPONENTS & CONTEXT
// ---------------------------------------------------------------------------

/** Marker cho mọi Action */
export interface ActionType<T extends string, P extends string = ''> {
	type: P extends '' ? T : `${T}:${P}`;
}

export type UseTargetingStrategy = {
	/**
	 * Chọn mục tiêu để thực thi action.
	 * Nhận vào entity id string (trả từ client) hoặc expression.
	 * VD: Chọn mục tiêu đang bị khóa, hoặc tự target đứa gần nhất.
	 */
	target: string | 'nearest' | 'lowest-hp' | 'random';
};

/**
 * Định nghĩa chiến thuật khi bắt buộc phải có hướng (VD: dash, bắn đạn định hướng)
 */
export type UseDirectionStrategy = {
	/**
	 * Chỉ định hướng (Góc độ từ 0-360) hoặc string expression.
	 * VD: "mouse-direction", "target-direction", "forward"
	 */
	direction: number | 'mouse-pos' | 'target-pos' | 'parent-head';
};
