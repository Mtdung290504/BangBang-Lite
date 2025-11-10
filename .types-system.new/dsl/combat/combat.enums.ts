/** Thuộc tính tank - Vật lý hay năng lượng */
export type TankDamageType = 'physical' | 'energy';

/** Loại sát thương tạo ra - Vật lý, năng lượng hoặc chuẩn */
export type DamageType = 'true' | TankDamageType;

/**
 * Đại diện cho phe (faction) của một entity trong game.
 * Dùng để xác định quan hệ giữa caster và target trong các hành động (action) hoặc hiệu ứng (effect).
 *
 * Các giá trị:
 * - `ally`: Đồng minh — cùng phe với người thi triển (caster).
 * - `enemy`: Kẻ địch — khác phe với người thi triển.
 * - `self`: Chính bản thân caster.
 * - `neutral`: Trung lập — không thuộc phe nào, thường dùng cho môi trường hoặc vật thể (ví dụ: bẫy, creep, trụ).
 */
export type Faction = 'ally' | 'enemy' | 'self' | 'neutral';
