const WebSocket = require("ws")
const wss = new WebSocket.Server({ port: 8082 })

wss.getUniqueID = function () {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
  }                                  
  return s4() + s4() + '-' + s4()
}

players = []

wss.on("connection", ws => {

	////////
	
	ws.id = wss.getUniqueID()
	const welcome = {
		type: "server-message",
		content: `Your id is ${ws.id}`
	}
	ws.send(JSON.stringify(welcome))
	console.log(ws.id, "has connected")

	////////

	ws.on("close", () => {
		console.log(ws.id, "has disconnected")
		players = players.filter(p => (p.uid != ws.id))
	})

	ws.on("message", data => {
		console.log(ws.id, data)
		wss.clients.forEach(client => {
			client.send(data)
		})
	})
})
