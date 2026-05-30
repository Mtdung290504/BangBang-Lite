import type { StatModifier, StateEntry, EffectAction } from './apply-effect.type-entities';
import type { LimitedDuration } from '../../../combat/state.type-components';
import type { Renderable, VisualManifest } from '../../../combat/visual.type-components';
import type { TankEvent } from '../context/.types';
import { ValueResolver } from '../../../runtime.types';

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
	 * Mặc định: 0s (VD gây damage bình thường, không có thêm gì)
	 */
	duration?: number;

	/**
	 * Cơ chế thời gian khi nhận thêm stack.
	 * - `reset-duration`: Refresh lại thời gian tồn tại từ đầu (VD: Độc).
	 * - `keep-duration`: Giữ nguyên thời gian của stack đầu tiên.
	 * Mặc định: `reset-duration`
	 */
	// 'stack-timeline-policy'?: 'reset-duration' | 'keep-duration';

	/**
	 * Impact diễn ra nhiều lần theo interval, đơn vị: giây
	 * - Nếu khai báo, on-interval trigger nhiều lần theo interval đó
	 * - Nếu không khai báo thì không trigger on-interval
	 */
	interval?: number;

	/**
	 * Giá trị khiên chắn bind với effect, nếu effect có khiên và value khiên về 0, effect sẽ bị xóa
	 */
	shield?: ValueResolver;

	/**
	 * Ghi đè/cưỡng chế chuyển động của thực thể mang Effect.
	 *
	 * TODO: Khi thực thể đang chuyển động bị cản trở (ví dụ: tông vào tường, vật cản),
	 * Engine cần phải lập tức hủy bỏ/xóa Effect này để tránh lệch pha giữa trạng thái
	 * logic (như untargetable, root) và trạng thái vật lý thực tế.
	 *
	 * Lý do triển khai: Bản cũ dùng impactor lôi, vậy lỡ nó đang biến mất thì sao mà lôi? (Ví dụ Space Black Panther)
	 * Chỉ có cách để cả 2 vào 1, vừa lôi vừa áp biến mất.
	 */
	'carry-movement'?: CarryMovementDeclaration;

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
 * - `modify-stats` — buff/debuff liên tục theo duration
 * - `states` — trạng thái on/off theo duration (CC, immune,...)
 * - `on-start/on-interval/on-end` — hành động tức thì
 * - `on-event` — lắng nghe game event (thay thế EventTriggeredPassive)
 */
interface EffectImpactManifest<Action = EffectAction> extends Renderable {
	/**
	 * ① Continuous stat modifiers — tồn tại suốt effect duration.\
	 * Engine apply khi effect active, remove khi effect hết.\
	 * Cho phép khai báo đơn nếu chỉ có 1 modifier.
	 */
	'modify-stats'?: StatModifier | StatModifier[];

	/**
	 * ② States — trạng thái đặc biệt tồn tại suốt effect duration.\
	 * Engine toggle on khi effect active, toggle off khi hết.\
	 * Cho phép khai báo đơn nếu chỉ có 1 state.
	 *
	 * ***LƯU Ý***: Nếu states có shield, shield mà vỡ thì effect mặc định bị xóa luôn\
	 * Muốn cách ly thì phải tạo nhiều effect
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
	 * ④ Game event hooks — effect lắng nghe event từ TankEvent.\
	 * Thay thế toàn bộ khái niệm EventTriggeredPassive.\
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

export type CarryMovementDeclaration =
	/**
	 * Case A: Đẩy lui (Knockback)
	 * Di chuyển thẳng theo hướng ngược lại với nguồn tác động (attacker-pos / impact-pos)
	 */
	| {
			type: 'knockback';
			speed: ValueResolver;
			/** Quãng đường đẩy lui tối đa (ví dụ đẩy lui 80px) */
			'limit-distance'?: ValueResolver;
	  }
	/**
	 * Case B: Lôi theo đạn (Drag-along)
	 * Khóa chặt chuyển động của mục tiêu đi theo tọa độ của viên đạn (Impactor) sinh ra Effect này.
	 * Khi viên đạn biến mất, Effect tự động bị xóa theo.
	 */
	| {
			type: 'drag-along';
	  }
	/**
	 * Case C & D: Chuyển động hướng tâm (Radial)
	 * Điểm neo là vị trí của viên đạn (Impactor) sinh ra Effect.
	 * - Tốc độ âm (-): Hút vào tâm (Case D - Pull)
	 * - Tốc độ dương (+): Đẩy ra xa tâm (Case C - Push)
	 */
	| {
			type: 'radial';
			speed: ValueResolver;
			/**
			 * Khoảng cách giới hạn so với tâm đạn:
			 * - Khi Hút (speed âm): Là khoảng cách tối thiểu cách tâm để dừng hút (Mặc định: 0px - hút sát vào tâm).
			 * - Khi Đẩy (speed dương): Là khoảng cách tối đa cách tâm để dừng đẩy.
			 */
			'limit-distance'?: ValueResolver;
	  };
