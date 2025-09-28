export default class OnSkillHitManifest {
	/**
	 * @param {import('.types-system/dsl/events/event-manifest').SkillEventHandler['on-hit']} onHitManifest
	 */
	constructor(onHitManifest) {
		this.onHitManifest = onHitManifest;
	}
}
