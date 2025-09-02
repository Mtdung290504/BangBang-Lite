/**
 * @template {(new (...args: any) => any)[]} [T=any]
 * @typedef {Partial<{
 * 		primaryComponents: T;
 * 		process(eid: number, components: {
 * 			[K in keyof T]: T[K] extends new (...args: any) => infer R ? R : never
 * 		}): void;
 * 		init(): void;
 * 		teardown(): void;
 * }>} AbstractSystem
 */

/**
 * Quản lý toàn bộ systems trong ECS.
 */
export default class LogicSystemsManager {
	/**
	 * @param {import('../combat/mgr.Entity.js').default} context
	 */
	constructor(context) {
		this.context = context;

		/**
		 * Danh sách systems đã đăng ký theo thứ tự.
		 *
		 * @type {Array<{system: AbstractSystem, primaryComponents?: any[], componentsKey: string}>}
		 * @private
		 */
		this._systems = [];

		/**
		 * Cache kết quả `context.getEntitiesWithComponents` trong frame hiện tại.
		 * Key là componentsKey đã được cache.
		 *
		 * @type {Map<string, Map<number, any[]>>}
		 * @private
		 */
		this._frameCache = new Map();
	}

	/**
	 * Đăng ký một system.
	 *
	 * @template {(new (...args: any) => any)[]} T
	 * @param {AbstractSystem<T>} system - Kết quả từ factory.create()
	 */
	registry(system) {
		// Validation
		if (!system || typeof system !== 'object') {
			throw new Error('System must be a valid object');
		}

		if (typeof system.process !== 'function') {
			throw new Error('System must have a process() method');
		}

		// Validate primaryComponents nếu có
		if (system.primaryComponents !== undefined) {
			if (!Array.isArray(system.primaryComponents)) {
				throw new Error('primaryComponents must be an array or undefined');
			}

			// Kiểm tra từng component có phải constructor function không
			for (let i = 0; i < system.primaryComponents.length; i++) {
				const comp = system.primaryComponents[i];
				if (typeof comp !== 'function' || !comp.name) {
					throw new Error(`primaryComponents[${i}] must be a constructor function with a name`);
				}
			}
		}

		// Cache component key ngay khi registry
		const componentsKey = this._getComponentsKey(system.primaryComponents);

		this._systems.push({
			system,
			primaryComponents: system.primaryComponents,
			componentsKey,
		});
	}

	/**
	 * Chạy tất cả systems trong frame hiện tại.
	 */
	updateAll() {
		// Clear cache của frame trước
		this._frameCache.clear();

		// Nhóm các systems liền kề có cùng primaryComponents
		const systemGroups = this._groupConsecutiveSystems();

		for (const group of systemGroups) {
			try {
				this._processSystemGroup(group);
			} catch (error) {
				throw error;
			}
		}
	}

	/**
	 * Nhóm các systems liền kề có cùng primaryComponents.
	 * @private
	 */
	_groupConsecutiveSystems() {
		const groups = [];
		let currentGroup = null;

		for (let i = 0; i < this._systems.length; i++) {
			const systemData = this._systems[i];
			const { system, componentsKey } = systemData;

			if (!currentGroup || currentGroup.componentsKey !== componentsKey) {
				// Tạo group mới
				currentGroup = {
					systems: [{ system, index: i }],
					primaryComponents: systemData.primaryComponents,
					startIndex: i,
					componentsKey,
				};
				groups.push(currentGroup);
			} else {
				// Thêm vào group hiện tại
				currentGroup.systems.push({ system, index: i });
			}
		}

		return groups;
	}

	/**
	 * Tạo key để so sánh primaryComponents.
	 * Chỉ được gọi 1 lần khi registry, không phải mỗi frame.
	 *
	 * @param {any[] | undefined} components
	 * @returns {string}
	 * @private
	 */
	_getComponentsKey(components) {
		if (!components || components.length === 0) {
			return '__no_components__';
		}

		// Tính toán key - chỉ chạy 1 lần khi registry
		return components.map((comp) => comp.name).join(',');
	}

	/**
	 * Xử lý một nhóm systems.
	 *
	 * @param {{systems: Array<{system: any, index: number}>, primaryComponents?: any[], startIndex: number, componentsKey: string}} group
	 * @private
	 */
	_processSystemGroup(group) {
		const { systems, primaryComponents, componentsKey } = group;

		// Systems không có primaryComponents - chỉ gọi process trực tiếp
		if (!primaryComponents || primaryComponents.length === 0) {
			for (const { system, index } of systems) {
				try {
					system.process();
				} catch (error) {
					console.error(`Error in System at index:[${index}]:`, error);
					throw error;
				}
			}
			return;
		}

		// Lấy entities từ cache hoặc tính toán mới
		let entitiesWithComponents = this._frameCache.get(componentsKey);
		if (!entitiesWithComponents) {
			entitiesWithComponents = this.context.getEntitiesWithComponents(primaryComponents);
			this._frameCache.set(componentsKey, entitiesWithComponents);
		}

		// Chạy tất cả systems trong group với cùng entities
		for (const [eID, components] of entitiesWithComponents) {
			for (const { system, index } of systems) {
				try {
					system.process(eID, components);
				} catch (error) {
					console.error(`Error in System at index:[${index}] processing Entity:[${eID}]:`, error);
					throw error;
				}
			}
		}
	}

	/**
	 * Xóa tất cả systems đã đăng ký.
	 */
	clear() {
		// Gọi teardown cho tất cả systems nếu có
		for (let i = 0; i < this._systems.length; i++) {
			const { system } = this._systems[i];
			try {
				system.teardown?.();
			} catch (error) {
				console.error(`Error in teardown of system at index ${i}:`, error);
				throw error;
			}
		}

		this._systems.length = 0;
		this._frameCache.clear();
	}

	/**
	 * Khởi tạo tất cả systems.
	 */
	initAll() {
		for (let i = 0; i < this._systems.length; i++) {
			const { system } = this._systems[i];
			try {
				system.init?.();
			} catch (error) {
				console.error(`Error in init of system at index ${i}:`, error);
				throw error;
			}
		}
	}

	/**
	 * Lấy số lượng systems đã đăng ký.
	 * @returns {number}
	 */
	getSystemCount() {
		return this._systems.length;
	}

	/**
	 * Lấy thông tin các nhóm systems (để debug/optimize).
	 * @returns {Array<{startIndex: number, count: number, componentsKey: string}>}
	 */
	getSystemGroups() {
		const groups = this._groupConsecutiveSystems();
		return groups.map((group) => ({
			startIndex: group.startIndex,
			count: group.systems.length,
			componentsKey: group.componentsKey,
		}));
	}
}
