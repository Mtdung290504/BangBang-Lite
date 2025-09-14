import { SkillCastAction } from '../skills/actions/skill-actions';

type TankEventActors = {
	[K in [
		// Khi dùng skill thì kích hoạt thêm gì đó
		'on-activate-skill',

		// Trigger các event ví dụ fatal damage, HP < 30%,...
		'on-hit-taken',

		// Chưa lường trước được nhưng có thể sẽ dùng
		'on-hit-dealt',

		// Hit only (Trúng skill/đánh thường kích hoạt gì đó hoặc skill/đánh thường trúng đích kích hoạt gì đó)
		'on-skill-taken',
		'on-skill-dealt',
		'on-normal-attack-taken',
		'on-normal-attack-dealt',

		// Hit and dealt damage (Như trên nhưng phải có chịu damage mới kích hoạt)
		'on-skill-taken-damage',
		'on-skill-dealt-damage',
		'on-normal-attack-taken-damage',
		'on-normal-attack-dealt-damage',

		// Khi tử vong hoặc khi kill
		'on-destroy',
		'on-destroyed'
	][number]]: ('self' | 'source' | 'target')[];
};

interface TankEventActorsMap extends TankEventActors {
	'on-activate-skill': ['self'];
	'on-hit-taken': ['source', 'self'];
	'on-hit-dealt': ['target', 'self'];
	'on-skill-taken': ['source', 'self'];
	'on-skill-dealt': ['target', 'self'];
	'on-normal-attack-taken': ['source', 'self'];
	'on-normal-attack-dealt': ['target', 'self'];
	'on-skill-taken-damage': ['source', 'self'];
	'on-skill-dealt-damage': ['target', 'self'];
	'on-normal-attack-taken-damage': ['source', 'self'];
	'on-normal-attack-dealt-damage': ['target', 'self'];
	'on-destroy': ['target', 'self'];
	'on-destroyed': ['source', 'self'];
}

interface SkillEventHandler {
	/** Khi skill trúng 1 target nào đó, khai báo những gì áp dụng lên target */
	'on-hit': { [K in ['ally', 'enemy', 'self'][number]]?: SkillCastAction[] };

	/** Khi gây sát thương thành công, bản thân kích hoạt gì đó, áp dụng lên kẻ địch gì đó */
	'on-dealt-damage'?: { [K in ['enemy', 'self'][number]]?: SkillCastAction[] };
}

// Usage in future:
// type T = { [K in SkillEventActorsMap['on-hit'][number]]: any };

export type { TankEventActorsMap, SkillEventHandler };
