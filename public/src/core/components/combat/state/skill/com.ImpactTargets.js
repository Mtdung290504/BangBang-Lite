/**
 * - Lưu các mục tiêu đã bị skill ảnh hưởng.
 * - Chưa cần cơ chế clean vì chỉ tồn tại ngắn
 */
export default class ImpactTargetsComponent {
	/**
	 * Danh sách EID của các mục tiêu bị trúng
	 * @private
	 * @type {number[]}
	 */
	_targetEIDs = [];

	/**
	 * Set EID của các mục tiêu bị trúng
	 * @private
	 * @type {Set<number>}
	 */
	_targetEIDsSet = new Set();

	/**
	 * @param {number} targetEID
	 */
	has(targetEID) {
		return this._targetEIDsSet.has(targetEID);
	}

	/**
	 * @param {number} targetEID
	 */
	add(targetEID) {
		// Đã tồn tại rồi thì return luôn
		if (this._targetEIDsSet.has(targetEID)) return;

		this._targetEIDsSet.add(targetEID);
		this._targetEIDs.push(targetEID);
	}

	/**
	 * @param {number} targetEID
	 */
	delete(targetEID) {
		// Delete mà không có thì return luôn
		if (!this._targetEIDsSet.delete(targetEID)) return;
		this._targetEIDs = this._targetEIDs.filter((eID) => eID !== targetEID);
	}

	get targetEIDs() {
		return this._targetEIDs;
	}

	set targetEIDs(newVal) {
		this._targetEIDs = newVal;
	}

	get targetEIDsSet() {
		return this._targetEIDsSet;
	}
}
