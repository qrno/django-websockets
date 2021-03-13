const WebSocket = require("ws")
const wss = new WebSocket.Server({ port: 8082 })

let rooms = new Map()

wss.getUniqueID = function () {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
  }                                  
  return s4() + s4() + '-' + s4()
}

// Adds player to room
const addToRoom = (ws) => {

	// Creates rooms if it doesn't exist
	if (!rooms.has(ws.room)) {
		let emptyRoom = []
		rooms.set(ws.room, emptyRoom)
	}

	let room = rooms.get(ws.room)
	room.push(ws)
	rooms.set(ws.room, room)

	sendStateToRoom(ws.room)
	console.log("Adding", ws.username, "to", ws.room)
}

// Removes player from room
const removeFromRoom = (ws) => {

	let room = rooms.get(ws.room)

	room = room.filter(member => member.id != ws.id)
	rooms.set(ws.room, room)

	sendStateToRoom(ws.room)
	console.log("Removing", ws.username, "from", ws.room)
}

// Gets only player information from a room
const getRoomState = (room_name) => {
	let room = rooms.get(room_name)
	let players = []

	room.forEach((ws) => {
		let player = {}
		player.id = ws.id
		player.username = ws.username
		player.x = ws.x
		player.y = ws.y 
		players.push(player)
	})

	console.log(room_name, players)
	return players
}

// Sends a message obj to room
const sendToRoom = (room_name, msg) => {
	rooms.get(room_name).forEach(
		client => client.send(JSON.stringify(msg))
	)
}

// Sends RoomState to all room members
const sendStateToRoom = (room_name) => {
	const stateMessage = {
		type: "state",
		state: getRoomState(room_name)
	}
	sendToRoom(room_name, stateMessage)
}

// WEBSOCKETS :)
wss.on("connection", ws => {

	// Create ID and inform client
	ws.id = wss.getUniqueID()
	ws.send(JSON.stringify({
		type:"server-message",
		content:`Your id is ${ws.id}`}))

	// Disconnection
	ws.on("close", () => {
		removeFromRoom(ws)
	})

	// Received Mesage
	ws.on("message", data => {

		// parses and logs message
		const msg = JSON.parse(data)
		//console.log(ws.id, "has sent", msg)

		// sets username and room of client
		if (msg.type == "join") {
			ws.username = msg.username
			ws.room			= msg.room
			ws.x = ws.y = 0
		} 
		// adds userinfo to message
		else {
			msg.id			 = ws.id
			msg.username = ws.username
		}

		//Processes message according to type
		if (msg.type == "join") { addToRoom(ws) }
		else if (msg.type == "player-update") {

			if (msg.subtype == "talk") {

				console.log(ws.username, "said", msg.content, "in", ws.room)

			} else if (msg.subtype = "move") {

				ws.x = msg.x
				ws.y = msg.y
				console.log(ws.username, "moved to", ws.x, ws.y, "in", ws.room)

			}

			sendToRoom(ws.room, msg)
		}
	})
})
