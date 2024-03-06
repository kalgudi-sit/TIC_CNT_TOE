const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

app.use(cors()); // cors middleware 

const allUsers = {};

io.on("connection", (socket) => {
  allUsers[socket.id] = {
    socket: socket,
    online: true
  };

//   console.log(allUsers);

  socket.on("request_to_play", (data) => {
    const currentUser = allUsers[socket.id];
    currentUser.playerName = data.playerName;
    console.log(currentUser);
  })

  socket.on("disconnect", () => {
    allUsers[socket.id].online = false;
    console.log(allUsers);
  })

});

httpServer.listen(3000, () => {
  console.log("HTTPServer Listening on port 3000");
});
