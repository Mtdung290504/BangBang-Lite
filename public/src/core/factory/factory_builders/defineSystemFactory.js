import EntityManager from '../../managers/combat/mgr.Entity.js';

/**
 * @template {[...(new (...args: any[]) => any)[]]} const PrimaryComponents
 * @template {(new (...args: any[]) => any) | undefined} [ContextClass=undefined]
 */
class SystemFactoryBuilder {
	/**
	 * @param {PrimaryComponents} components
	 * @param {ContextClass | undefined} CtxClass
	 */
	constructor(components, CtxClass) {
		this.primaryComponents = components;

		/** @type {ContextClass | undefined} */
		this.CtxClass = CtxClass;

		/** @type {Function | null} */
		this._processor = null;

		/** @type {Function | null} */
		this._init = null;

		/** @type {Function | null} */
		this._teardown = null;
	}

	/**
	 * Processor cho system
	 * @param {ContextClass extends undefined
	 * 		? (context: EntityManager, eID: number, components: {[K in keyof PrimaryComponents]: PrimaryComponents[K] extends new (...args: any[]) => infer R ? R : never}) => void
	 * 		: (context: EntityManager, eID: number, components: {[K in keyof PrimaryComponents]: PrimaryComponents[K] extends new (...args: any[]) => infer R ? R : never}, sysContext: InstanceType<NonNullable<ContextClass>>) => void
	 * } fn
	 */
	withProcessor(fn) {
		this._processor = fn;
		return this;
	}

	/**
	 * Hàm init (tùy chọn)
	 * @param {ContextClass extends undefined
	 * 		? () => void
	 * 		: (sysContext: InstanceType<NonNullable<ContextClass>>) => void
	 * } fn
	 */
	withInit(fn) {
		this._init = fn;
		return this;
	}

	/**
	 * Hàm teardown (tùy chọn)
	 * @param {ContextClass extends undefined
	 * 		? () => void
	 * 		: (sysContext: InstanceType<NonNullable<ContextClass>>) => void
	 * } fn
	 */
	withTeardown(fn) {
		this._teardown = fn;
		return this;
	}

	/**
	 * Hoàn thành tạo ra factory
	 */
	build() {
		const primaryComponents = this.primaryComponents;
		const CtxClass = this.CtxClass;
		const processor = this._processor;
		const init = this._init;
		const teardown = this._teardown;

		/**
		 * @param {ContextClass extends undefined ? [context: EntityManager] : [context: EntityManager, ...ConstructorParameters<NonNullable<ContextClass>>]} args
		 */
		function create(...args) {
			const context = args[0];
			args.shift();

			/** @type {any} */
			let sysContext = null;
			if (CtxClass) sysContext = new CtxClass(...args);

			return {
				primaryComponents,

				/**@type {ContextClass extends undefined ? never : InstanceType<ContextClass>} */
				sysContext,

				/**
				 * @param {number} eid
				 * @param {{
				 * 		[K in keyof PrimaryComponents]:
				 * 			PrimaryComponents[K] extends new (...args: any[]) => infer R ? R : never
				 * }} components
				 */
				process(eid, components) {
					if (!processor) return;
					if (sysContext !== null) processor(context, eid, components, sysContext);
					else processor(context, eid, components);
				},

				init() {
					if (!init) return;
					if (sysContext !== null) init(sysContext);
					else init();
				},

				teardown() {
					if (!teardown) return;
					if (sysContext !== null) teardown(sysContext);
					else teardown();
				},
			};
		}

		return { create };
	}
}

/**
 * Factory khởi tạo system builder
 *
 * @template {[...(new (...args: any[]) => any)[]]} const PrimaryComponents
 * @template {(new (...args: any[]) => any) | undefined} [ContextClass=undefined]
 *
 * @param {PrimaryComponents} components
 * @param {ContextClass} [ctxClass]
 */
export default function defineSystemFactory(components, ctxClass) {
	return new SystemFactoryBuilder(components, ctxClass);
}
