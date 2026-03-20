import type { StatModifier, StateEntry, EffectAction } from './apply-effect.type-entities';
import type { LimitedDuration } from '../../../combat/state.type-components';
import type { Renderable, VisualManifest } from '../../../combat/visual.type-components';

export interface EffectManifest<Action = EffectAction> extends Renderable, LimitedDuration {
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
	 * Cơ chế: Bồi thêm stack -> Reset thời gian về ban đầu\
	 * Mặc định: 0s (VD gây damage bình thường, không có thêm gì)
	 */
	duration?: number;

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
 * 1 stack effect — 3 tầng tách biệt:
 * ① `modify-stats` — buff/debuff liên tục theo duration
 * ② `states` — trạng thái on/off theo duration (CC, immune,...)
 * ③ `on-start/on-interval/on-end` — hành động tức thì
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
	states?: StateEntry | StateEntry[];

	/**
	 * ③ Khi effect bắt đầu thì gây ra gì đó.\
	 * Cho phép khai báo đơn nếu chỉ có 1 action.
	 */
	'on-start'?: Action | 'clear' | (Action | 'clear')[];

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
	 * @override
	 * Hiệu ứng visual của stack này
	 */
	visual?: VisualManifest;
}
