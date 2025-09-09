/**
 * Component chỉ định hiệu ứng đổ bóng của entity.
 */
export default class ShadowComponent {
	/**
	 * @param {Object} [shadowConfig]
	 * @param {number} [shadowConfig.alpha]
	 * @param {number} [shadowConfig.blur]
	 * @param {number} [shadowConfig.offsetRatioX]
	 * @param {number} [shadowConfig.offsetRatioY]
	 */
	constructor(shadowConfig) {
		/** Độ tối của bóng, mặc định 0.45 */
		this.alpha = shadowConfig?.alpha ?? 0.4;

		/** Độ nhòe của bóng, mặc định 2 */
		this.blur = shadowConfig?.blur ?? 2;

		/** Tỉ lệ độ lệch X của bóng tính theo chiều rộng vật thể, mặc định 0.04 */
		this.offsetRatioX = shadowConfig?.offsetRatioX ?? 0.04;

		/** Tỉ lệ độ lệch Y của bóng tính theo chiều cao vật thể, mặc định 0.08 */
		this.offsetRatioY = shadowConfig?.offsetRatioY ?? 0.08;
	}
}
