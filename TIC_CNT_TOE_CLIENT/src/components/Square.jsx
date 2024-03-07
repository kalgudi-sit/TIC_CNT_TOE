import { useState } from "react";
import { FaRegCircle } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";

const Square = (props) => {
  const {
    id,
    currentElement,
    currentPlayer,
    socket,
    playingAs,
    setCurrentPlayer,
    finishedState,
    setFinishedState,
    gameState,
    setGameState,
    finishedArrayState,
    setFinishedArrayState,
  } = props;
  const [icon, setIcon] = useState(null);

  const makeMove = () => {
    if(playingAs !== currentPlayer) {
      return;
    }

    if (finishedState) {
      return;
    }

    const currentPlayerState = currentPlayer;

    socket.emit("playerMoveFromClient", {
      state: {
        id: id,
        sign: currentPlayerState,
      },
    });

    if (!icon) {
      if (currentPlayer === "CIRCLE") {
        setIcon(<FaRegCircle size={50} />);
        setCurrentPlayer("CROSS");
      } else {
        setIcon(<RxCross1 size={60} />);
        setCurrentPlayer("CIRCLE");
      }
    }

    setGameState((prevGameState) => {
      let newGameState = [...prevGameState];
      const rowId = Math.floor(id / 3);
      const colId = id % 3;
      newGameState[rowId][colId] = currentPlayerState;
      return newGameState;
    });
  };

  return (
    <div
      onClick={makeMove}
      // className="w-[100px] h-[100px] bg-emerald-300 hover:bg-teal-200 rounded-lg flex justify-center items-center hover:cursor-pointer"
      className={`${
        finishedArrayState.includes(id)
          ? " bg-rose-500 "
          : " bg-emerald-300 hover:bg-teal-200 "
      } w-[100px] h-[100px] rounded-lg flex justify-center items-center hover:cursor-pointer`}
    >
      {currentElement === "CIRCLE" ? (
        <FaRegCircle size={50} />
      ) : currentElement === "CROSS" ? (
        <RxCross1 size={60} />
      ) : (
        icon
      )}
    </div>
  );
};

export default Square;
