export type SkillTypeDef<Type extends string, Definition extends Record<string, any> = {}> = {
	type: Type;
	definitions: Definition;
};
