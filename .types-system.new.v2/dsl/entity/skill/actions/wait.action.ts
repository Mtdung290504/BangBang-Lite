import { ActionType } from './.components';

/**
 * 4. WAIT ACTION (TẠM DỪNG CHUỖI THỰC THI)
 * Thay thế cho `RequireDelay` và `RequireCharge` cũ.
 * Rất đơn giản: "Đợi ở đây X giây, rồi mới chạy các thẻ tiếp theo dọc xuống".
 */
export interface WaitAction extends ActionType<'wait'> {
	/** Thời gian chờ (giây) */
	duration: number;

	/**
	 * (Optional) Quyết định khi nào được phép Break Wait (Hủy chờ - Tái kích hoạt / Trúng kỹ năng xóa)
	 * - `cancelable`: Có thể bị nút Cancel / di chuyển hủy bỏ.
	 * - `interruptible`: Có thể bị CC (Choáng, Hất tung) ngắt quãng.
	 * - Không khai báo: Đợi chết cứng, không gì can thiệp được (Ví dụ: hồi chiêu cứng).
	 */
	'break-policy'?: ('cancelable' | 'interruptible')[];
}
