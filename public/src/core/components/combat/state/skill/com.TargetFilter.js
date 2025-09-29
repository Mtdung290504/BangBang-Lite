export default class TargetFilterComponent {
	/**
	 * @param {Set<keyof import('.types-system/dsl/events/event-manifest').SkillEventHandler['on-hit']>} targetsManifest
	 */
	constructor(targetsManifest) {
		this.ally = targetsManifest.has('ally');
		this.enemy = targetsManifest.has('enemy');
		this.self = targetsManifest.has('self');
	}
}
