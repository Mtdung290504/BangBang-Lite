/**
 * @template {(new (...args: any) => any)[]} [T=any]
 * @typedef {Partial<{
 * 		primaryComponents: T;
 *      sysContext: any;
 * 		process(eid: number, components: {
 * 			[K in keyof T]: T[K] extends new (...args: any) => infer R ? R : never
 * 		}): void;
 * 		init(): void;
 * 		teardown(): void;
 * }>} AbstractRenderSystem
 */

/**
 * @typedef {import('.types/Renderable').Renderable} Renderable
 */

/**
 * Quản lý toàn bộ render systems trong ECS.
 * Khác với LogicSystemsManager, systems được gom tối đa theo primaryComponents
 * và render callbacks được sort theo layer trước khi thực thi.
 */
export default class RenderSystemsManager {
	/**
	 * @param {import('../combat/mgr.Entity.js').default} context
	 */
	constructor(context) {
		this.context = context;

		/**
		 * Danh sách systems đã đăng ký theo thứ tự.
		 *
		 * @type {Array<{system: AbstractRenderSystem, primaryComponents?: any[], componentsKey: string}>}
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
		 * Tất cả render callbacks được thu thập trong frame hiện tại.
		 *
		 * @type {Array<Renderable>}
		 * @private
		 */
		this._renderCallbacks = [];

		/**
		 * Pre-computed system groups để tránh tính toán mỗi frame.
		 * Được tính khi finalize() hoặc lần đầu renderAll().
		 *
		 * @type {Array<{systems: Array<{system: any, index: number}>, primaryComponents?: any[], componentsKey: string}> | null}
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
	 * Đăng ký một render system.
	 *
	 * @template {(new (...args: any) => any)[]} T
	 * @param {AbstractRenderSystem<T>} system - Kết quả từ factory.create()
	 */
	register(system) {
		// Validation
		if (!system || typeof system !== 'object') {
			throw new Error('Render system must be a valid object');
		}

		if (typeof system.process !== 'function') {
			throw new Error('Render system must have a process() method');
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

		// Cache component key ngay khi register
		const componentsKey = this._getComponentsKey(system.primaryComponents);

		this._systems.push({
			system,
			primaryComponents: system.primaryComponents,
			componentsKey,
		});

		// Invalidate precomputed groups khi có system mới
		this._precomputedGroups = null;
		this._isFinalized = false;
	}

	/**
	 * Finalize tất cả systems và pre-compute groups.
	 * Nên gọi sau khi đăng ký hết tất cả systems.
	 */
	finalize() {
		this._precomputedGroups = this._groupSystemsByComponents();
		this._isFinalized = true;
	}

	/**
	 * Render tất cả systems trong frame hiện tại.
	 */
	renderAll() {
		// Clear cache và callbacks của frame trước
		this._frameCache.clear();
		this._renderCallbacks.length = 0;

		// Ensure groups được tính toán (lazy initialization)
		if (!this._precomputedGroups) {
			this._precomputedGroups = this._groupSystemsByComponents();
		}

		// Chạy tất cả system groups để thu thập render callbacks
		for (const group of this._precomputedGroups) {
			try {
				this._processSystemGroup(group);
			} catch (error) {
				throw error;
			}
		}

		// Sort render callbacks theo layer và thực thi
		this._executeRenderCallbacks();
	}

	/**
	 * Nhóm systems theo primaryComponents (tối đa hóa).
	 * CHỈ được gọi khi cần tính toán lại groups.
	 * @private
	 */
	_groupSystemsByComponents() {
		/**
		 * @type {Map<string, Array<{system: any, index: number}>>}
		 */
		const groupsMap = new Map();

		// Gom tất cả systems có cùng primaryComponents
		for (let i = 0; i < this._systems.length; i++) {
			const systemData = this._systems[i];
			const { system, componentsKey } = systemData;

			if (!groupsMap.has(componentsKey)) {
				groupsMap.set(componentsKey, []);
			}

			groupsMap.get(componentsKey)?.push({ system, index: i });
		}

		// Chuyển map thành array và giữ primaryComponents info
		const groups = [];
		for (const [componentsKey, systems] of groupsMap) {
			const firstSystemData = this._systems[systems[0].index];
			groups.push({
				systems,
				primaryComponents: firstSystemData.primaryComponents,
				componentsKey,
			});
		}

		return groups;
	}

	/**
	 * Tạo key để so sánh primaryComponents.
	 * Chỉ được gọi 1 lần khi register, không phải mỗi frame.
	 *
	 * @param {any[] | undefined} components
	 * @returns {string}
	 * @private
	 */
	_getComponentsKey(components) {
		if (!components || components.length === 0) {
			return '__no_components__';
		}

		// Tính toán key - chỉ chạy 1 lần khi register
		return components.map((comp) => comp.name).join(',');
	}

	/**
	 * Xử lý một nhóm systems.
	 *
	 * @param {{systems: Array<{system: any, index: number}>, primaryComponents?: any[], componentsKey: string}} group
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
					console.error(`Error in Render System at index:[${index}]:`, error);
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
					console.error(`Error in Render System at index:[${index}] processing Entity:[${eID}]:`, error);
					throw error;
				}
			}
		}
	}

	/**
	 * Thực thi tất cả render callbacks đã thu thập, được sort theo layer.
	 * @private
	 */
	_executeRenderCallbacks() {
		// Đọc callbacks từ tất cả systems
		for (const { system } of this._systems) {
			if (system.sysContext && typeof system.sysContext.flushRenderCallbacks === 'function') {
				const callbacks = system.sysContext.flushRenderCallbacks();
				this._renderCallbacks.push(...callbacks);
			}
		}

		// Sort theo layer (từ thấp đến cao)
		this._renderCallbacks.sort((a, b) => a.layer - b.layer);

		// Thực thi tất cả render callbacks
		for (const renderable of this._renderCallbacks) {
			try {
				renderable.render();
			} catch (error) {
				console.error('Error executing render callback:', error);
				throw error;
			}
		}

		// Clear callbacks sau khi render
		this._renderCallbacks.length = 0;
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
				console.error(`Error in teardown of render system at index ${i}:`, error);
				throw error;
			}
		}

		this._systems.length = 0;
		this._frameCache.clear();
		this._renderCallbacks.length = 0;
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
				console.error(`Error in init of render system at index ${i}:`, error);
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
	 * @returns {Array<{count: number, componentsKey: string, systemIndices: number[]}>}
	 */
	getSystemGroups() {
		// Ensure groups được tính toán
		if (!this._precomputedGroups) {
			this._precomputedGroups = this._groupSystemsByComponents();
		}

		return this._precomputedGroups.map((group) => ({
			count: group.systems.length,
			componentsKey: group.componentsKey,
			systemIndices: group.systems.map((s) => s.index),
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
