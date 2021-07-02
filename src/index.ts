import GameManager from "./logic/gameManager";

const lobby = document.getElementById("lobby");
const joinForm = <HTMLFormElement>document.getElementById("join-form");
const nameInput = <HTMLInputElement>document.getElementById("name-input");

const game = document.getElementById("game");
const canvas = <HTMLCanvasElement>document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
});

const manager = new GameManager({ lobby, game }, ctx);

manager.destroy();

joinForm.onsubmit = (e) => {
	e.preventDefault();

	manager.joinClient(nameInput.value);

	manager.awake();
	manager.start();
};
