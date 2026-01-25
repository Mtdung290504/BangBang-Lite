import { RandomDefinition } from '../.enums';

/**
 * Các action prefix:
 *
 * - `create`: Tạo ra gì đó, ví dụ: đạn, area damage (chém bán nguyệt, vùng ST,...),...
 * - `do`: Các hành vi cơ học như lướt, nhảy,...
 * - `apply`: Gây ST, hồi máu, gây hiệu ứng,... Nói chung là các effect gây ra khi skill trúng đích
 */
export type ActionPrefix = 'create-entity' | 'do-action' | 'apply-effect';

/**
 * Khai báo action skill cần loại thông tin tổng quát gì:
 *
 * - `none`: Không cần thông tin gì
 * - `direction`: Cần biết hướng chuột (ví dụ: bắn đạn, lướt,...)
 * - `position`: Cần biết vị trí chuột (ví dụ: cast area, dịch chuyển,...)
 * - `target`: Cần khóa mục tiêu cụ thể (ví dụ: skill khóa mục tiêu)
 */
export type ActionTargetingRequire = 'none' | 'direction' | 'position' | 'target';

export type LockMethod = 'active-lock' | 'nearest' | 'weakest' | RandomDefinition;
