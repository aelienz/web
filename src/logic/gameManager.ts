import { __playerSize__, __playerSpeed__ } from "../lib/constants";
import { socket } from "../lib/socket";
import { Client, State, Transform } from "../lib/types";

interface GameScreens {
	lobby: HTMLElement;
	game: HTMLElement;
}

export default class GameManager {
	private screens: GameScreens;
	private ctx: CanvasRenderingContext2D;
	private alive = false;
	private state: State = {
		clients: []
	};
	private keysDown = new Set<string>();
	private keyboardInterval: NodeJS.Timeout;

	public constructor(screens: GameScreens, ctx: CanvasRenderingContext2D) {
		this.screens = screens;
		this.ctx = ctx;
	}

	public joinClient(
		name = "Anonymous",
		transform = { x: 0, y: 0, rotation: 0 }
	) {
		socket.emit("client-join", {
			socket: { id: socket.id },
			player: { name },
			transform
		} as Client);
	}

	private onKeyDown({ key }: KeyboardEvent) {
		this.keysDown.add(key);
	}

	private onKeyUp({ key }: KeyboardEvent) {
		this.keysDown.delete(key);
	}

	private movePlayer() {
		let vel = { x: 0, y: 0 };

		if (this.keysDown.has("w")) vel.y -= __playerSpeed__;
		if (this.keysDown.has("a")) vel.x -= __playerSpeed__;
		if (this.keysDown.has("s")) vel.y += __playerSpeed__;
		if (this.keysDown.has("d")) vel.x += __playerSpeed__;

		socket.emit("player-move", { socket: { id: socket.id }, vel });
	}

	public awake() {
		this.alive = true;
		socket.on("heartbeat", (state: string) => (this.state = JSON.parse(state)));

		this.keysDown = new Set<string>();
		window.addEventListener("keydown", (e) => this.onKeyDown(e));
		window.addEventListener("keyup", (e) => this.onKeyUp(e));

		this.keyboardInterval = setInterval(() => this.movePlayer(), 20);

		this.screens.game.style.display = "block";
		this.screens.lobby.style.display = "none";
	}

	public start() {
		this.gameLoop();
	}

	public destroy() {
		this.alive = false;
		socket.off("heartbeat");

		clearInterval(this.keyboardInterval);

		window.removeEventListener("keydown", (e) => this.onKeyDown(e));
		window.removeEventListener("keyup", (e) => this.onKeyUp(e));

		this.screens.lobby.style.display = "block";
		this.screens.game.style.display = "none";
	}

	private gameLoop() {
		this.update();

		if (this.alive) window.requestAnimationFrame(() => this.gameLoop());
	}

	private update() {
		this.ctx.fillStyle = "#000000";
		this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

		this.ctx.fillStyle = "#FFFFFF";
		for (const client of this.state.clients) {
			this.renderEntity(client.transform, __playerSize__);
		}
	}

	private renderEntity(transform: Transform, size: number) {
		this.ctx.fillRect(
			window.innerWidth / 2 + transform.x - size / 2,
			window.innerHeight / 2 + transform.y - size / 2,
			size,
			size
		);
	}
}
