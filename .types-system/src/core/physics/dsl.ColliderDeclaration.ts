interface Rectangle {
	type: 'rectangle';
	size: {
		width: number;
		height: number;
	};
}

interface Circle {
	type: 'circle';
	size: { radius: number };
}

export type Collider = Rectangle | Circle;
