interface ActionDeclaration {
	action: `@${'create' | 'do' | 'apply'}:${string}`;
}

export type { ActionDeclaration };
