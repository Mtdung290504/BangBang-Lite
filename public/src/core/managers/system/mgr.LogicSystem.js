// Use type only
import EntityManager from '../combat/mgr.Entity.js';

/**
 * @template {Array<new (...args: any) => any>} [T=any]
 * @typedef {import('.types-system/src/core/systems.js').AbstractSystem<T>} AbstractSystem
 */

/**
 * Quản lý toàn bộ logic systems trong ECS.
 */
export default class LogicSystemsManager {
	/**
	 * @param {EntityManager} context
	 */
	constructor(context) {
		this.context = context;

		/**
		 * Danh sách systems đã đăng ký theo thứ tự.
		 *
		 * @type {Array<{system: AbstractSystem, name: string, primaryComponents?: any[], componentsKey: string}>}
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

		/**
		 * Pre-computed consecutive system groups để tránh tính toán mỗi frame.
		 * Được tính khi finalize() hoặc lần đầu updateAll().
		 *
		 * @type {Array<{systems: Array<{system: any, index: number, name: string}>, primaryComponents?: any[], startIndex: number, componentsKey: string}> | null}
		 * @private
		 */
		this._precomputedGroups = null;

		/**
		 * Flag đánh dấu đã finalize chưa.
		 *
		 * @type {boolean}
		 * @private
		 */
		this._isFinalized = false;
	}

	/**
	 * Đăng ký một system.
	 *
	 * @template {(new (...args: any) => any)[]} T
	 * @param {AbstractSystem<T>} system - Kết quả từ factory.create()
	 */
	register(system, name = '') {
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
			name,
			primaryComponents: system.primaryComponents,
			componentsKey,
		});

		// Invalidate precomputed groups khi có system mới
		this._precomputedGroups = null;
		this._isFinalized = false;
	}

	/**
	 * Finalize tất cả systems và pre-compute consecutive groups.
	 * Nên gọi sau khi đăng ký hết tất cả systems.
	 */
	finalize() {
		this._precomputedGroups = this._groupConsecutiveSystems();
		this._isFinalized = true;
	}

	/**
	 * Chạy tất cả systems trong frame hiện tại.
	 */
	updateAll() {
		// Clear cache của frame trước
		this._frameCache.clear();

		// Ensure groups được tính toán (lazy initialization)
		if (!this._precomputedGroups) this._precomputedGroups = this._groupConsecutiveSystems();
		for (const group of this._precomputedGroups) this._processSystemGroup(group);
	}

	/**
	 * Nhóm các systems liền kề có cùng primaryComponents.
	 * CHỈ được gọi khi cần tính toán lại groups.
	 * @private
	 */
	_groupConsecutiveSystems() {
		const groups = [];
		let currentGroup = null;

		for (let i = 0; i < this._systems.length; i++) {
			const systemData = this._systems[i];
			const { system, componentsKey, name } = systemData;

			if (!currentGroup || currentGroup.componentsKey !== componentsKey) {
				// Tạo group mới
				currentGroup = {
					systems: [{ system, index: i, name }],
					primaryComponents: systemData.primaryComponents,
					startIndex: i,
					componentsKey,
				};
				groups.push(currentGroup);
			} else {
				// Thêm vào group hiện tại
				currentGroup.systems.push({ system, index: i, name });
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
		return components.map((comp) => comp.toString()).join(',');
	}

	/**
	 * Xử lý một nhóm systems.
	 *
	 * @param {{systems: Array<{system: any, index: number, name: string }>, primaryComponents?: any[], startIndex: number, componentsKey: string}} group
	 * @private
	 */
	_processSystemGroup(group) {
		const { systems, primaryComponents, componentsKey } = group;

		// Systems không có primaryComponents - chỉ gọi process trực tiếp
		if (!primaryComponents || primaryComponents.length === 0) {
			for (const { system, index } of systems) {
				console.log(index);
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

		for (const { system, index, name } of systems) {
			for (const [eID, components] of entitiesWithComponents) {
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
		this._precomputedGroups = null;
		this._isFinalized = false;
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
		// Ensure groups được tính toán
		if (!this._precomputedGroups) {
			this._precomputedGroups = this._groupConsecutiveSystems();
		}

		return this._precomputedGroups.map((group) => ({
			...group,
			count: group.systems.length,
		}));
	}

	/**
	 * Kiểm tra xem đã finalize chưa.
	 * @returns {boolean}
	 */
	isFinalized() {
		return this._isFinalized;
	}
}
