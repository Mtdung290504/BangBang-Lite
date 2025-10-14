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
	 * @param {0 | 1} team
	 */
	constructor(selfPosRef, mousePosRef, headAngleRef, team) {
		this.selfPosRef = selfPosRef;
		this.mousePosRef = mousePosRef;
		/**Note: angle in deg */
		this.headAngleRef = headAngleRef;
		this.team = team;

		this.targetEID = -1;
	}
}
