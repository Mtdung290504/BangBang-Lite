export default class TargetFilterComponent {
	/**
	 * @param {import('.types-system/dsl/events/event-manifest').SkillEventHandler['on-hit']} onHitManifest
	 */
	constructor(onHitManifest) {
		this.ally = Boolean(onHitManifest.ally);
		this.enemy = Boolean(onHitManifest.enemy);
		this.self = Boolean(onHitManifest.self);
	}
}
