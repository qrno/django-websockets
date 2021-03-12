// LOUNGE

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

const canvas = document.getElementById("lounge-canvas")
const c = canvas.getContext("2d")

canvas.height = 700
canvas.width  = 1000

const colors = [
	'#BAF2BB',
	'#BAF2D8',
	'#BAD7F2',
	'#F2BAC9',
	'#F2E2BA',
]

const drawThingy = (x, y, h1, h2, v1, v2, color) => {
	c.beginPath()
	c.moveTo(x, y)
	c.lineTo(x+h2, y+v1)
	c.lineTo(x+h2-h1, y+v1+v2)
	c.lineTo(x-h1, y+v2)
	c.lineTo(x, y)

	c.fillStyle = colors[getRandomInt(5)]

	c.lineWidth = 4
	c.strokeStyle = '#ffffff'
	c.stroke()
	c.fill()
}

class Grid {
	constructor(l, c, h1, h2, v1, v2) {
		this.l = l
		this.c = c

		this.h1 = h1
		this.h2 = h2
		this.v1 = v1
		this.v2 = v2

		this.x = 0
		this.y = 0
	}

	draw(x, y) {
		this.x = x
		this.y = y

		for (var i = 0; i < this.l; i++) {
			for (var j = 0; j < this.c; j++) {
				var tx = x - this.h1 * i + this.h2 * j
				var ty = y + this.v2 * i + this.v1 * j

				drawThingy(tx, ty, this.h1, this.h2, this.v1, this.v2, '#0b3954')
			}
		}
	}

	getCenter(l, c) {
		var tx = this.x - this.h1 * l + this.h2 * c
		var ty = this.y + this.v2 * l + this.v1 * c

		let center = { x:0, y:0 }
		
		center.x = (tx + (this.h2-this.h1)/2)
		center.y = (ty + (this.v1+this.v2)/2)

		return center
	}
}

const g = new Grid(8, 8, 40, 70, 15, 40)
g.draw(350, 150)

const drawPlayer = (x, y) => {
	c.beginPath()
	c.rect(x-10, y-10, 20, 20)
	c.fillStyle = 'white'
	c.fill()
}

let px = 0, py = 0
let cpos = g.getCenter(0, 0)
drawPlayer(cpos.x, cpos.y)

document.addEventListener("keydown", (event) => {
	if (event.key == "a") { py-- };
	if (event.key == "d") { py++ };
	if (event.key == "w") { px-- };
	if (event.key == "s") { px++ };

	c.clearRect(0, 0, canvas.width, canvas.height);

	let cpos = g.getCenter(px, py);
	g.draw(350, 150)
	drawPlayer(cpos.x, cpos.y)
})

// NETWORKING

const ws = new WebSocket("ws://localhost:8082")

ws.addEventListener("open", () => {
	console.log("Connected to server")
})

ws.addEventListener("message", (received) => {
	console.log("Received", received)
	const msg = JSON.parse(received.data);

	if (msg.type == "server-message") {
		console.log("SERVER MESSAGE:", msg.content);
	}
})
