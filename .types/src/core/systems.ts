export type AbstractSystem<T extends Array<new (...args: any) => any> = any[]> = Partial<{
	primaryComponents: T;
	process(
		eid: number,
		components: {
			[K in keyof T]: T[K] extends new (...args: any) => infer R ? R : never;
		}
	): void;
	init(): void;
	teardown(): void;
}>;
