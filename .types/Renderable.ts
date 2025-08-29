export default interface Renderable {
	layer: number;
	render: () => void;
}
