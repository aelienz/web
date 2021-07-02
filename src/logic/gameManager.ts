import { Entity, GameState, PlayerEntity } from "aelienz-types";
import { __images__, __playerSpeed__ } from "../lib/constants";
import { socket } from "../lib/socket";

interface GameScreens {
	lobby: HTMLElement;
	game: HTMLElement;
}

export default class GameManager {
	public static readonly KEYBOARD_PING = 10;
	private screens: GameScreens;
	private ctx: CanvasRenderingContext2D;
	private alive = false;
	private state: GameState = {
		entities: []
	};
	private keysDown = new Set<string>();
	private keyboardInterval: any;

	public constructor(screens: GameScreens, ctx: CanvasRenderingContext2D) {
		this.screens = screens;
		this.ctx = ctx;
	}

	public joinClient(
		name = "Anonymous",
		transform = {
			x: window.innerWidth / 2,
			y: window.innerHeight / 2,
			rotation: 0
		}
	) {
		socket.emit("player-join", {
			player: { name },
			transform,
			image: __images__.player
		});
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

		socket.emit("player-move", vel);
	}

	private onBlur() {
		this.keysDown = new Set<string>();
	}

	public awake() {
		this.alive = true;
		socket.on("heartbeat", (state: string) => (this.state = JSON.parse(state)));

		this.keysDown = new Set<string>();
		window.addEventListener("keydown", (e) => this.onKeyDown(e));
		window.addEventListener("keyup", (e) => this.onKeyUp(e));

		window.addEventListener("blur", () => this.onBlur());

		this.keyboardInterval = setInterval(
			() => this.movePlayer(),
			GameManager.KEYBOARD_PING
		);

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

		window.removeEventListener("blur", () => this.onBlur());

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

		for (const entity of this.state.entities) {
			this.renderEntity(entity);
		}
	}

	private renderEntity(entity: Entity | PlayerEntity) {
		const entityImage = new Image();
		entityImage.src = entity.image;

		this.ctx.drawImage(entityImage, entity.transform.x, entity.transform.y);

		const playerEntity = <PlayerEntity>entity;
		if (playerEntity.player) {
			this.ctx.fillStyle = "#FFFFFF";
			this.ctx.font = "30px Arial";

			this.ctx.fillText(
				playerEntity.player.name,
				entity.transform.x +
					entityImage.width / 2 -
					this.ctx.measureText(playerEntity.player.name).width / 2,
				entity.transform.y - 10
			);
		}
	}
}
