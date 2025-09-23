/**
 * @typedef {{
 * 	Point: { x: number, y: number }
 * }} Types
 */

export default class SkillContextComponent {
	/**
	 *
	 * @param {Types['Point']} selfPosRef
	 * @param {Types['Point']} mousePosRef
	 * @param {{ angle: number }} headAngleRef - Note: angle in deg
	 */
	constructor(selfPosRef, mousePosRef, headAngleRef) {
		this.selfPosRef = selfPosRef;
		this.mousePosRef = mousePosRef;
		this.headAngleRef = headAngleRef;

		this.targetEID = -1;
	}
}
