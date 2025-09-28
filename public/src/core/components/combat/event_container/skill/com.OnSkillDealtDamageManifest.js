export default class OnSkillDealtDamageManifest {
	/**
	 * @param {import('.types-system/dsl/events/event-manifest').SkillEventHandler['on-dealt-damage']} onDealtDamageManifest
	 */
	constructor(onDealtDamageManifest) {
		this.onDealtDamageManifest = onDealtDamageManifest;
	}
}
