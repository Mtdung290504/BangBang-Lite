/**
 * Đại diện cho phe (faction) của một entity trong game.
 * Dùng để xác định quan hệ giữa caster và target trong các hành động (action) hoặc hiệu ứng (effect).
 *
 * Các giá trị:
 * - `ally`: Đồng minh — cùng phe với người thi triển (caster).
 * - `enemy`: Kẻ địch — khác phe với người thi triển.
 * - `self`: Chính bản thân caster.
 * - `tower`: Trụ/nhà.
 */
export type Faction = 'ally' | 'enemy' | 'self' | 'tower';
