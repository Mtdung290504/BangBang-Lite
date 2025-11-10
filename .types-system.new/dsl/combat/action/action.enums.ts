/**
 * Các action prefix:
 * - `create`: Tạo ra gì đó, ví dụ: đạn, area damage (chém bán nguyệt, vùng ST,...),...
 * - `do`: Các hành vi cơ học như lướt, nhảy, gồng...
 * - `apply`: Gây ST, hồi máu, gây hiệu ứng,... Nói chung là các effect gây ra khi skill trúng đích
 */
export type ActionPrefix = 'create' | 'do' | 'apply';
