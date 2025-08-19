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

interface SkillTargets {
	/** Áp dụng lên toàn bộ đồng minh, kể cả bản thân */
	allies;

	/** Chỉ áp dụng lên kẻ địch */
	enemy;

	/** Chỉ áp dụng lên bản thân */
	self;
}

interface SkillEvents {
	/** Khi skill trúng 1 target nào đó, khai báo những gì áp dụng lên target */
	'on-hit';

	/** Khi gây sát thương thành công, bản thân kích hoạt gì đó, áp dụng lên kẻ địch gì đó */
	'on-dealt-damage';
}

interface SkillEventActors extends SkillEvents {
	'on-hit': SkillTargets;

	'on-dealt-damage': {
		self;
		enemy;
	};
}

export type { TankEventActorsMap, SkillEventActors };
