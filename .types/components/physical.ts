interface RectangleShapeComponent {
	name: 'shape';
	'init-value': {
		type: 'rectangle';
		size: {
			width: number;
			height: number;
		};
	};
}

interface CircleShapeComponent {
	name: 'shape';
	'init-value': {
		type: 'circle';
		size: {
			radius: number;
		};
	};
}

export type ShapeComponent = RectangleShapeComponent | CircleShapeComponent;
