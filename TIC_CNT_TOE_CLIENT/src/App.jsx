import { useEffect, useState } from "react";
import "./App.css";
import Square from "./components/Square";
import { io } from "socket.io-client";
import Swal from "sweetalert2";

const matrix = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

function App() {
  const [gameState, setGameState] = useState(matrix);
  const [currentPlayer, setCurrentPlayer] = useState("CIRCLE");
  const [finishedState, setFinishedState] = useState(null);
  const [finishedArrayState, setFinishedArrayState] = useState([]);
  const [playOnline, setPlayOnline] = useState(false);
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [opponentName, setOpponentName] = useState(null);

  useEffect(() => {
    const winner = checkWinner();
    if (winner === "CIRCLE" || winner === "CROSS") {
      setFinishedState(winner);
      console.log(winner);
    } else if (winner === "DRAW") {
      setFinishedState(winner);
      console.log(winner);
    }
  }, [gameState]);

  const takePlayerName = async () => {
    const result = await Swal.fire({
      title: "Enter your name",
      input: "text",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      },
    });
    return result;
  };

  const checkWinner = () => {
    // for rows
    for (let row = 0; row < gameState.length; row++) {
      if (
        gameState[row][0] === gameState[row][1] &&
        gameState[row][1] === gameState[row][2]
      ) {
        setFinishedArrayState((prevState) => {
          const newState = [...prevState];
          newState.push(row * 3 + 0);
          newState.push(row * 3 + 1);
          newState.push(row * 3 + 2);
          return newState;
        });
        return gameState[row][0];
      }
    }

    // for cols
    for (let col = 0; col < gameState[0].length; col++) {
      if (
        gameState[0][col] === gameState[1][col] &&
        gameState[1][col] === gameState[2][col]
      ) {
        setFinishedArrayState((prevState) => {
          const newState = [...prevState];
          newState.push(0 * 3 + col);
          newState.push(1 * 3 + col);
          newState.push(2 * 3 + col);
          return newState;
        });
        return gameState[0][col];
      }
    }

    // primary diagonal
    if (
      gameState[0][0] === gameState[1][1] &&
      gameState[1][1] === gameState[2][2]
    ) {
      setFinishedArrayState((prevState) => {
        const newState = [...prevState];
        newState.push(0);
        newState.push(4);
        newState.push(8);
        return newState;
      });
      return gameState[0][0];
    }

    // secondary diagonal
    if (
      gameState[0][2] === gameState[1][1] &&
      gameState[1][1] === gameState[2][0]
    ) {
      setFinishedArrayState((prevState) => {
        const newState = [...prevState];
        newState.push(2);
        newState.push(4);
        newState.push(6);
        return newState;
      });
      return gameState[0][2];
    }

    // check for draw
    const isDrawMatch = gameState.flat().every((ele) => {
      if (ele === "CIRCLE" || ele === "CROSS") {
        return true;
      }
    });
    if (isDrawMatch) {
      return "DRAW";
    }
  };

  socket?.on("connect", function () {
    setPlayOnline(true);
  });

  const playOnlineHandler = async () => {
    const result = await takePlayerName();
    console.log(result);

    if (!result.isConfirmed) {
      return;
    }
    const username = result.value;
    setPlayerName(username);

    const newSocket = io("http://localhost:3000", {
      // newSocket is the Socket.io's => client socket instance
      autoConnect: true,
    });

    newSocket?.emit("request_to_play", {
      playerName: username,
    });

    setSocket(newSocket);
  };

  if (!playOnline) {
    return (
      <div className="min-h-screen bg-white text-black">
        <div className="grid grid-cols-2 min-h-screen">
          <div className="bg-black min-h-screen text-white flex justify-center items-center">
            <h1 className=" text-5xl"> TIC CNT TOE</h1>
          </div>
          <div className=" bg-white flex justify-center items-center flex-col ">
            {/* <h2 className=" my-0">Connect With Friends</h2> */}
            <button
              onClick={playOnlineHandler}
              className=" bg-black text-white hover:bg-blue-600 p-6 text-3xl rounded-lg"
            >
              Play Online
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (playOnline && !opponentName) {
    return (
      <div className="min-h-screen bg-white text-black">
        <div className="grid grid-cols-2 min-h-screen">
          <div className="bg-black min-h-screen text-white flex justify-center items-center">
            <h1 className=" text-5xl"> TIC CNT TOE</h1>
          </div>
          <div className=" bg-white flex justify-center items-center flex-col ">
            <h1 className=" text-5xl"> Waiting for opponent ...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="flex justify-center items-center mt-5vh flex-col">
        <div className="flex justify-center flex-col items-center">
          <h1 className="text-4xl my-5 text-blue-600 hover:text-black hover:cursor-pointer">
            TIC CNT TOE
          </h1>
          <div className="flex justify-between items-center w-[400px] my-10">
            <div className="bg-black py-2 px-4 text-white rounded-lg">
              Kalgudi
            </div>
            ---- v/s ----
            <div className="bg-black py-2 px-4 text-white rounded-lg ">
              Bhoopa
            </div>
          </div>
          <div className=" my-10">
            <div className="grid grid-cols-3 gap-x-5 gap-y-5 flex justify-center">
              {gameState.map((boxes, rowIndex) => {
                return boxes.map((box, colIndex) => {
                  return (
                    <Square
                      key={rowIndex * 3 + colIndex}
                      id={rowIndex * 3 + colIndex}
                      finishedState={finishedState}
                      setFinishedState={setFinishedState}
                      currentPlayer={currentPlayer}
                      setCurrentPlayer={setCurrentPlayer}
                      gameState={gameState}
                      setGameState={setGameState}
                      finishedArrayState={finishedArrayState}
                      setFinishedArrayState={setFinishedArrayState}
                    />
                  );
                });
              })}
            </div>
          </div>
          <div className=" text-blue-600 text-xl ">
            {finishedState === "CIRCLE" || finishedState === "CROSS" ? (
              <h1>{finishedState} won the game</h1>
            ) : (
              <h1></h1>
            )}
            {finishedState === "DRAW" ? <h1>It's a DRAW</h1> : <h1></h1>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
