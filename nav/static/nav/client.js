/*
 * CANVAS
 */

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

	c.fillStyle = 'black'

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

class Player {
	constructor(id, username, l, c) {
		this.id = id
		this.username = username

		this.l = l
		this.c = c

		this.pos = { x : 0, y : 0 }

		this.last_message = ""

		this.color = colors[getRandomInt(5)]
	}

	move(l, c) {
		this.l = l
		this.c = c
	}

	draw_last_message() {
		c.font = "30px Arial";
		c.fillStyle = 'white'
		c.fillText(this.last_message, this.pos.x-30, this.pos.y-60)
	}

	draw_username() {
		c.font = "30px Arial";
		c.fillStyle = 'white'
		c.fillText(this.username, this.pos.x-30, this.pos.y+30)
	}

	draw() {
		this.pos = g.getCenter(this.l, this.c)
		
		c.beginPath()
		c.rect(this.pos.x-15, this.pos.y-50, 30, 60)
		c.fillStyle = this.color
		c.fill()

		this.draw_last_message()
		this.draw_username()
	}
}

let players = []

const addPlayer = (p_obj) => {
	players.push(p_obj)
}

const removePlayer = (p_obj) => {
	players = players.filter(p => (p.id != p_obj.id))
}

const drawPlayers = (players) => {
	players.forEach(p => p.draw())
}

let px = 0, py = 0

document.addEventListener("keydown", (event) => {
	let moved = false;

	if (event.key == "a") {
		px--
		moved = true
	};
	if (event.key == "d") {
		px++
		moved = true
	};
	if (event.key == "w") {
		py--
		moved = true
	};
	if (event.key == "s") {
		py++
		moved = true
	};

	if (moved) move(py, px)
})

const draw = () => {
	c.clearRect(0, 0, canvas.width, canvas.height);

	g.draw(350, 80)
	drawPlayers(players)

	//window.requestAnimationFrame(draw)
}

const move = (x, y) => {
	const message = {
		type: "player-update",
		subtype: "move",
		x: x,
		y: y
	}
	sendMessage(message)
}


// MESSAGE

message_input = document.getElementById("message-input")
message_button = document.getElementById("message-button")

const sendMessage = (message) => {
	console.log("[SENT]")
	console.table(message)
	ws.send(JSON.stringify(message));
}

const talk = () => {
	if (message_input.value != "") {
		const message = {
			type: "player-update",
			subtype: "talk",
			content: message_input.value
		}
		message_input.value = ""

		sendMessage(message)
	}
}

message_button.addEventListener("click", talk)

/*
 * NETWORKING
 */

const ws = new WebSocket("ws://localhost:8082")

// Connection
ws.addEventListener("open", () => {
	console.log("Connected to server")
	
	// Informs server of userinfo
	const message = {
		type:			"join",
		room:			djangoData.room,
		username: djangoData.username,
	}
	sendMessage(message)
})

ws.addEventListener("message", (received) => {

	// Parses and logs received message
	const msg = JSON.parse(received.data);
	console.log("[RECEIVED]")
	console.table(msg)

	// Processes message according to type
	if (msg.type == "server-message") { console.warn("[SERVER]", msg.content); }
	else if (msg.type == "state") {

		// Updates "players" array with state
		players = []
		msg.state.forEach(member => {
			const p = new Player(member.id, member.username, member.x, member.y)
			addPlayer(p)
		})
	} else if (msg.type == "player-update") {

		let player = players.find(p => p.id == msg.id) // Sender

		if (msg.subtype == "move") {
			player.move(msg.x, msg.y)
		} else if (msg.subtype == "talk") {
			player.last_message = msg.content
		}
	}

	draw()
})

// Disconnection
ws.addEventListener("close", () => {
	console.log("Disconnected from server")
})
