export default class SkillImpactComponent {
	/**
	 * Danh sách EID của các skill bị trúng
	 * @private
	 * @type {Set<number>}
	 */
	_skillImpactEIDs = new Set();

	/**
	 * @type {{ eID: number, role: keyof import('.types-system/dsl/events/event-manifest').SkillEventHandler['on-hit'] }[]}
	 */
	impactors = [];

	/**
	 * @param {number} eID
	 * @param {keyof import('.types-system/dsl/events/event-manifest').SkillEventHandler['on-hit']} role
	 */
	addImpact(eID, role) {
		if (this._skillImpactEIDs.has(eID)) return;
		this.impactors.push({ eID, role });
	}

	clearImpacts() {
		this._skillImpactEIDs.clear();
		this.impactors.length = 0;
	}
}
