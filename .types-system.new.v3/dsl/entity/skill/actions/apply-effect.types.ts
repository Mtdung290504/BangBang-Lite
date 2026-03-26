import type { StatModifier, StateEntry, EffectAction } from './apply-effect.type-entities';
import type { LimitedDuration } from '../../../combat/state.type-components';
import type { Renderable, VisualManifest } from '../../../combat/visual.type-components';
import type { TankEvent } from '../context/.types';

export interface EffectManifest<Action = EffectAction>
	extends Renderable, LimitedDuration {
	/** Có thể kháng xóa bởi các skill hóa giải hay không */
	unremovable?: true;

	/** Name để nhận diện effect dùng cho stack và hiển thị */
	name?: string;

	/** Mô tả hiển thị */
	description?: string;

	/**
	 * @override
	 * Icon hiển thị
	 */
	visual?: VisualManifest;

	/**
	 * @override
	 * Thời gian tồn tại.\
	 * Mặc định: 0s (VD gây damage bình thường, không có thêm gì)
	 */
	duration?: number;

	/**
	 * Cơ chế thời gian khi nhận thêm stack.
	 * - `reset-duration`: Refresh lại thời gian tồn tại từ đầu (VD: Độc).
	 * - `keep-duration`: Giữ nguyên thời gian của stack đầu tiên.
	 * Mặc định: `reset-duration`
	 */
	'stack-timeline-policy'?: 'reset-duration' | 'keep-duration';

	/**
	 * Impact diễn ra nhiều lần theo interval, đơn vị: giây
	 * - Nếu khai báo, on-interval trigger nhiều lần theo interval đó
	 * - Nếu không khai báo thì không trigger on-interval
	 */
	interval?: number;

	/**
	 * Định nghĩa hành vi cho từng stack. Quy định luôn số stack tối đa\
	 * Note:
	 * - Vì effect đã có ngữ cảnh từ impactor nên chỉ cần khai báo effect lên target và action của bản thân trong này
	 * - Cho phép khai báo đơn lẻ 1 cái khi chỉ có 1 impact, parser sẽ tự bọc trong []
	 */
	impacts: EffectImpactManifest<Action> | EffectImpactManifest<Action>[];
}

/**
 * 1 stack effect — 4 tầng:
 * ① `modify-stats` — buff/debuff liên tục theo duration
 * ② `states` — trạng thái on/off theo duration (CC, immune,...)
 * ③ `on-start/on-interval/on-end` — hành động tức thì
 * ④ `on-event` — lắng nghe game event (thay thế EventTriggeredPassive)
 */
interface EffectImpactManifest<Action = EffectAction> extends Renderable {
	/**
	 * ① Continuous stat modifiers — tồn tại suốt effect duration.
	 * Engine apply khi effect active, remove khi effect hết.
	 * Cho phép khai báo đơn nếu chỉ có 1 modifier.
	 */
	'modify-stats'?: StatModifier | StatModifier[];

	/**
	 * ② States — trạng thái đặc biệt tồn tại suốt effect duration.
	 * Engine toggle on khi effect active, toggle off khi hết.
	 * Cho phép khai báo đơn nếu chỉ có 1 state.
	 */
	'modify-states'?: StateEntry | StateEntry[];

	/**
	 * ③ Khi effect bắt đầu thì gây ra gì đó.\
	 * Cho phép khai báo đơn nếu chỉ có 1 action.
	 */
	'on-start'?: Action | Action[];

	/**
	 * ③ Khi đến interval thì làm gì đó.\
	 * Cho phép khai báo đơn nếu chỉ có 1 action.
	 */
	'on-interval'?: Action | Action[];

	/**
	 * ③ Khi effect kết thúc thì gây ra gì đó.\
	 * Cho phép khai báo đơn nếu chỉ có 1 action.
	 */
	'on-end'?: Action | Action[];

	/**
	 * ④ Game event hooks — effect lắng nghe event từ TankEvent.
	 * Thay thế toàn bộ khái niệm EventTriggeredPassive.
	 * Cho phép khai báo đơn nếu chỉ có 1 action cho event đó.
	 *
	 * @example
	 * // Khi trúng đòn → hồi máu
	 * 'on-event': { 'on-hit-taken': { action: '@apply:modifier', attribute: 'current-HP', value: '10%' } }
	 * // Khi giết địch → buff tốc
	 * 'on-event': { 'on-destroy': { action: '@apply:effect', manifest: { duration: 5, ... } } }
	 */
	'on-event'?: Partial<Record<TankEvent, Action | Action[]>>;

	/**
	 * @override
	 * Hiệu ứng visual của stack này
	 */
	visual?: VisualManifest;
}
