const elements = {
	xo: document.getElementById("xo"),
	start: document.getElementById("start"),
	clear: document.getElementById("clear"),
	vs: document.getElementById("vs"),
	side: document.getElementById("side"),
	moves: document.getElementById("moves"),
	winner: document.getElementById("winner"),
	player: document.getElementById("player")
}

elements.cols = elements.xo.querySelectorAll("div > div > div");

export default elements;