import EntityManager from '../../managers/combat/mgr.Entity.js';

/**
 * @template {[...(new (...args: any[]) => any)[]]} const PrimaryComponents
 * @template {[...(new (...args: any[]) => any)[]] | []} [const Dependencies=[]]
 */
class SystemFactoryBuilder {
	/**
	 * @typedef {{ [K in keyof Dependencies]: Dependencies[K] extends new (...args: any[]) => infer R ? R : never }} DependencyInstances
	 * @typedef {{ [K in keyof PrimaryComponents]: PrimaryComponents[K] extends new (...args: any[]) => infer R ? R : never }} ComponentInstances
	 * @typedef {{
	 * 	dependencies: DependencyInstances,
	 * 	seq: number,
	 * 	debugMode: boolean,
	 * 	throttleRate: number,
	 * 	systemName?: string
	 * }} SystemContext
	 */

	/**
	 * @param {PrimaryComponents} primaryComponents
	 * @param {Dependencies} [dependencies]
	 */
	constructor(primaryComponents, dependencies = /** @type {Dependencies} */ ([])) {
		this.primaryComponents = primaryComponents;

		/** @type {Dependencies} */
		this.dependencies = dependencies;

		/** @type {Function | null} */
		this.processor = null;

		/** @type {Function | null} */
		this.init = null;

		/** @type {Function | null} */
		this.teardown = null;

		this.config = {
			debugMode: false,
			systemName: 'Unnamed_System',

			/**
			 * Tần suất xử lý, mặc định: 1 (kích hoạt processor mỗi n lần)
			 * @type {number}
			 */
			throttleRate: 1,
		};
	}

	/**
	 * Cấu hình thêm cho system
	 *
	 * @param {Object} config - Cấu hình debug
	 * @param {boolean} [config.debug] - Bật hay tắt debug
	 * @param {number} [config.throttleRate] - Tần suất xử lý, mặc định: 1 (kích hoạt processor mỗi n lần)
	 * @param {string} [config.systemName] - Tên system
	 * @throws {Error} - Khi config.throttleRate được truyền nhưng < 1
	 */
	withConfig(config) {
		this.config = { ...this.config, ...config };
		if (this.config.throttleRate < 1) throw new Error('Invalid rate value, [config.throttleRate] must be > 1');
		return this;
	}

	/**
	 * Processor cho system
	 * @param {(context: EntityManager, eID: number, components: ComponentInstances, systemContext: SystemContext) => void} fn
	 */
	withProcessor(fn) {
		this.processor = fn;
		return this;
	}

	/**
	 * Hàm init (tùy chọn)
	 * @param {(systemContext: SystemContext) => void} fn
	 */
	withInit(fn) {
		this.init = fn;
		return this;
	}

	/**
	 * Hàm teardown (tùy chọn)
	 * @param {(systemContext: SystemContext) => void} fn
	 */
	withTeardown(fn) {
		this.teardown = fn;
		return this;
	}

	/**
	 * Hoàn thành tạo ra factory
	 */
	build() {
		const { primaryComponents, processor, dependencies, init, teardown, config } = this;

		/**
		 * @param {Dependencies extends []
		 * 	? [context: EntityManager]
		 * 	: [context: EntityManager, dependencyInstances: DependencyInstances]
		 * } args
		 */
		const create = (...args) => {
			const context = args[0];
			const hasDeps = dependencies.length > 0;

			// Validation
			if (hasDeps && !args[1])
				throw new Error(`System requires ${dependencies.length} dependencies but got none`);

			/** @type {SystemContext} */
			const systemContext = {
				dependencies: hasDeps
					? /** @type {DependencyInstances} */ (args[1])
					: /** @type {DependencyInstances} */ ([]),
				seq: 0,
				debugMode: config.debugMode,
				throttleRate: config.throttleRate,
				systemName: config.systemName,
			};

			return {
				primaryComponents,
				systemContext,

				/**
				 * @param {number} eid
				 * @param {ComponentInstances} components
				 */
				process(eid, components) {
					if (!processor) return;

					if (systemContext.seq % systemContext.throttleRate === 0) {
						if (systemContext.debugMode) console.group(`${systemContext.systemName} #${systemContext.seq}`);
						try {
							processor(context, eid, components, systemContext);
						} finally {
							if (systemContext.debugMode) console.groupEnd();
						}
					}

					systemContext.seq++;
				},

				init() {
					if (init) init(systemContext);
				},

				teardown() {
					if (teardown) teardown(systemContext);
				},
			};
		};

		return { create };
	}
}

/**
 * Factory khởi tạo system builder
 *
 * @template {[...(new (...args: any[]) => any)[]]} const PrimaryComponents
 * @template {(new (...args: any[]) => any)[] | []} [const Dependencies=[]]
 *
 * @param {PrimaryComponents} primaryComponents
 * @param {Dependencies} [dependencies]
 */
export default function defineSystemFactory(primaryComponents, dependencies = /** @type {Dependencies} */ ([])) {
	return new SystemFactoryBuilder(primaryComponents, dependencies);
}
