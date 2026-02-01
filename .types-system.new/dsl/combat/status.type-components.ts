import { ImpactAction } from '../entity/skill/actions/.types';
import { Impactable, LimitedDuration } from './state.type-components';
import { Renderable, VisualManifest } from './visual.type-components';

export interface EffectManifest extends Renderable, LimitedDuration {
	/** Name để nhận diện effect dùng cho stack và hiển thị */
	name?: string;

	/** Mô tả hiển thị */
	description?: string;

	/**
	 * Icon hiển thị
	 * @override
	 */
	visual?: VisualManifest;

	/** Số stack tối đa */
	'max-stack'?: number;

	/**
	 * Thời gian tồn tại.\
	 * Mặc định: Bồi thêm stack -> Reset thời gian về ban đầu
	 * @override
	 */
	duration: number;

	/**
	 * Impact diễn ra nhiều lần theo interval, đơn vị: giây
	 * - Nếu khai báo, skill impact nhiều lần theo interval đó
	 * - Nếu không khai báo thì chỉ impact 1 lần
	 */
	interval?: number;

	/**
	 * Định nghĩa hành vi cho từng stack.
	 *
	 * - Ví dụ [stack1, stack2, stack...]
	 * - action: Khai báo hành động đốt, hoặc áp effect như làm chậm
	 * - interval: tần suất kích hoạt action
	 * - on-enter: khi đạt đến stack này sẽ kích hoạt action gì đó
	 * - visual: hiệu ứng effect, ví dụ lửa tầng 1 khác tầng 2, 3, 4
	 */
	impacts: (Impactable['impact'] & { 'on-enter'?: (ImpactAction | 'clear')[] })[];
}
