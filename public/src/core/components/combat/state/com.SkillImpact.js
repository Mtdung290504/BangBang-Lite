export default class SkillImpactComponent {
	/**
	 * Danh sách EID của các skill bị trúng
	 * @type {Set<number>}
	 */
	skillImpactEIDs = new Set();

	/**
	 * @type {{ eID: number, role: keyof import('.types-system/dsl/events/event-manifest').SkillEventHandler['on-hit'] }[]}
	 */
	impactors = [];

	/**
	 * @param {number} eID
	 * @param {keyof import('.types-system/dsl/events/event-manifest').SkillEventHandler['on-hit']} role
	 */
	addImpact(eID, role) {
		if (this.skillImpactEIDs.has(eID)) return;
		this.skillImpactEIDs.add(eID);
		this.impactors.push({ eID, role });
	}

	clearImpacts() {
		this.skillImpactEIDs.clear();
		this.impactors.length = 0;
	}
}
