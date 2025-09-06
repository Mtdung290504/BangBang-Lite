export default class VelocityHistoryComponent {
	/**
	 * Component lưu lại thay đổi vị trí kể từ lần sync cuối cùng
	 */
	constructor() {
		this.dxFromLastSync = 0;
		this.dyFromLastSync = 0;
	}

	reset() {
		this.dxFromLastSync = 0;
		this.dyFromLastSync = 0;
	}
}
