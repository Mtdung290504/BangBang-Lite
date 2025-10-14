/**
 * @typedef {import('.types-system/dsl/skills/actions/move/super-move.js').Teleport} TeleportAction
 */

/**
 * @param {TeleportAction} manifest
 */
export default function parseDoTeleportManifest(manifest) {
	const { action, range } = manifest;
	return { action, range };
}
