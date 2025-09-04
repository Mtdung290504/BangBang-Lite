export type AbstractRenderSystem<T extends Array<new (...args: any) => any> = any[]> = Partial<{
	primaryComponents: T;
	sysContext: any;
	process(
		eid: number,
		components: {
			[K in keyof T]: T[K] extends new (...args: any) => infer R ? R : never;
		}
	): void;
	init(): void;
	teardown(): void;
}>;
