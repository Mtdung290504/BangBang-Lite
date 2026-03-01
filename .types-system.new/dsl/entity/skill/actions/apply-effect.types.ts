import { StatValue } from '../../../combat/effect.type-components';
import { LimitedDuration } from '../../../combat/state.type-components';
import { Renderable, VisualManifest } from '../../../combat/visual.type-components';

export interface EffectManifest<EffectAction> extends Renderable, LimitedDuration {
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
	 * - Nếu khai báo, skill impact nhiều lần theo interval đó
	 * - Nếu không khai báo thì chỉ impact 1 lần
	 */
	interval?: number;

	/**
	 * Định nghĩa hành vi cho từng stack. Quy định luôn số stack tối đa\
	 * Note:
	 * - Vì effect đã có ngữ cảnh từ impactor nên chỉ cần khai báo effect lên target và action của bản thân trong này
	 * - Cho phép khai báo đơn lẻ 1 cái khi chỉ có 1 impact, parser sẽ tự bọc trong []
	 */
	impacts: EffectImpactManifest<EffectAction> | EffectImpactManifest<EffectAction>[];
}

interface EffectImpactManifest<EffectAction> extends Renderable {
	/**
	 * Khai báo các trạng thái như tăng/giảm tốc/các chỉ số khác... của effect\
	 * Note: Cho phép khai báo đơn nếu chỉ có 1 action
	 */
	'modify-stats'?: StatValue | StatValue[];

	/**
	 * Khi effect bắt đầu thì gây ra gì đó\
	 * Note:
	 * - Trong ngữ cảnh này, nếu là skill cast action thì do mình tung ra
	 * - Cho phép khai báo đơn nếu chỉ có 1 action
	 */
	'on-start'?: EffectAction | 'clear' | (EffectAction | 'clear')[];

	/**
	 * Khi đến interval thì làm gì đó.\
	 * Note:
	 * - Trong ngữ cảnh này, nếu là skill cast action thì do mình tung ra
	 * - Cho phép khai báo đơn nếu chỉ có 1 action
	 */
	'on-interval'?: EffectAction | EffectAction[];

	/**
	 * Khi effect kết thúc thì gây ra gì đó\
	 * Note:
	 * - Trong ngữ cảnh này, nếu là skill cast action thì do mình tung ra
	 * - Cho phép khai báo đơn nếu chỉ có 1 action
	 */
	'on-end'?: EffectAction | EffectAction[];

	/**
	 * @override
	 * Hiệu ứng của effect, ví dụ hiệu ứng đốt hay độc
	 */
	visual?: VisualManifest;
}
