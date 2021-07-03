export const __prod__ = process.env.NODE_ENV === "production";
export const __serverUrl__ = __prod__
	? "https://aelienz-server.herokuapp.com"
	: "http://localhost:4000";

export const __playerSpeed__ = 5;

export interface ImageData {
	name: string;
	src: string;
}
export const __images__: ImageData[] = [
	{
		name: "player",
		src: "img/assets/player.png"
	}
];
