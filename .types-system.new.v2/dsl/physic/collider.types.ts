export type PierceableTarget = 'architecture' | 'self' | 'enemy' | 'ally' | 'non-tank';

export type ColliderShape =
	| { type: 'circle'; radius: number }
	| { type: 'rect'; width: number; height: number; rotate?: number }
	| { type: 'sector'; radius: number; angle: number; rotate?: number };

/**
 * Bản đồ tương tác tĩnh (dùng cho kiến trúc / map objects)
 */
export interface StaticCollider {
	shape: ColliderShape;
}
