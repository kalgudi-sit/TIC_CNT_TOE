const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { log } = require("console");

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

app.use(cors()); // cors middleware

const allUsers = {};
const allRooms = [];

io.on("connection", (socket) => {
  allUsers[socket.id] = {
    socket: socket,
    online: true,
  };

  socket.on("request_to_play", (data) => {
    const currentUser = allUsers[socket.id];
    currentUser.playerName = data.playerName;

    let opponentPlayer;

    for (const key in allUsers) {
      const user = allUsers[key];
      if (user.online && !user.playing && socket.id !== key) {
        opponentPlayer = user;
        break;
      }
    }

    if (opponentPlayer) {
      allRooms.push({
        player1: opponentPlayer,
        player2: currentUser,
      });

      currentUser.socket.emit("opponentFound", {
        opponentName: opponentPlayer.playerName,
        playingAs: "CROSS",
      });

      opponentPlayer.socket.emit("opponentFound", {
        opponentName: currentUser.playerName,
        playingAs: "CIRCLE",
      });
      
      currentUser.socket.on("playerMoveFromClient", (data) => {
        opponentPlayer.socket.emit("playerMoveFromServer", {
          ...data,
        })
      });

      opponentPlayer.socket.on("playerMoveFromClient", (data) => {
        currentUser.socket.emit("playerMoveFromServer", {
          ...data,
        })
      });

    } else {
      currentUser.socket.emit("opponentNotFound", {});
    }
  });

  

  socket.on("disconnect", () => {
    allUsers[socket.id].online = false;
    for(let i=0;i<allRooms.length;i++) {
      const { player1, player2 } = allRooms[i];

      if(player1.socket.id === socket.id) {
        player2.socket.emit("opponentLeftMatch");
        break;
      }

      if(player2.socket.id === socket.id) {
        player1.socket.emit("opponentLeftMatch");
        break;
      }
    }
  });
});

httpServer.listen(3000, () => {
  console.log("HTTPServer Listening on port 3000");
});
