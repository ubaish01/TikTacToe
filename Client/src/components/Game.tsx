import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Box from "./Box";
import Swal from 'sweetalert2'


const initialState = [[null, null, null], [null, null, null], [null, null, null]];
const initialWinnerState = [[false, false, false], [false, false, false], [false, false, false]];

const Game = () => {
    const [gameState, setGameState] = useState(initialState);
    const [turn, setTurn] = useState('circle');
    const [winner, setWinner] = useState<any>(null);
    const [winnerState, setWinnerState] = useState(initialWinnerState);
    const [socket, setSocket] = useState<any>(null)
    const [pageState, setPageState] = useState(0); // 0 for start play , 1 for waiting , 2 for game
    const [userName, setUserName] = useState("");
    const [opponent, setOpponent] = useState<any>();

    const checkWinner = () => {

        for (let i = 0; i < gameState.length; i++) {
            // row wise 
            if (gameState[i][0] && gameState[i][0] === gameState[i][1] && gameState[i][1] === gameState[i][2]) {
                winnerState[i][0] = true;
                winnerState[i][1] = true;
                winnerState[i][2] = true;
                setWinnerState([...winnerState]);
                return gameState[i][0];
            }

            // column wise
            if (gameState[0][i] && gameState[0][i] === gameState[1][i] && gameState[1][i] === gameState[2][i]) {
                winnerState[0][i] = true;
                winnerState[1][i] = true;
                winnerState[2][i] = true;
                setWinnerState([...winnerState]);
                return gameState[0][i];
            }
        }
        // left diagonal wise
        if (gameState[0][0] && gameState[0][0] == gameState[1][1] && gameState[1][1] == gameState[2][2]) {

            winnerState[0][0] = true;
            winnerState[1][1] = true;
            winnerState[2][2] = true;
            setWinnerState([...winnerState]);
            return gameState[0][0];
        }
        // right diagonal wise
        if (gameState[0][2] && gameState[0][2] == gameState[1][1] && gameState[1][1] == gameState[2][0]) {
            winnerState[0][2] = true;
            winnerState[1][1] = true;
            winnerState[2][0] = true;
            setWinnerState([...winnerState]);
            return gameState[0][2];
        }
        return null;

    }

    useEffect(() => {
        const gameWinner = checkWinner();
        if (gameWinner) {
            if (gameWinner === 'circle') {
                setWinner('circle');
            } else if (gameWinner === 'cross') {
                setWinner('cross');
            } else {
                setWinner("draw");
            }
        }
    }, [gameState])

    const initiateConnection = (user: any) => {
        const newSocket = io("http://localhost:3000", {
            autoConnect: true,
        });

        newSocket?.emit('request_to_play', {
            playerName: user
        });
        setSocket(newSocket);
    }

    socket?.on("connect", () => {
        setPageState(1);
    });

    socket?.on("OpponentFound", (data: any) => {
        console.log(data);

        setOpponent(data);
        setPageState(2);
    })

    socket?.on("OpponentNotFound", function () {
        setPageState(1);
        setOpponent(null);
    });

    socket?.on("playerMoveFromServer", (data: any) => {
        if (turn === 'cross') setTurn('circle');
        else setTurn('cross');
        setGameState(data.data);
    })

    socket?.on("opponentLeftMatch", () => {
        setWinner("left");
    })

    const startGame = async () => {
        const result = await Swal.fire({
            title: "Enter yout name",
            input: "text",
            inputAttributes: {
                autocapitalize: "off"
            },
            showCancelButton: true,
            confirmButtonText: "Start",
            showLoaderOnConfirm: true,
            inputValidator: (value) => {
                if (!value) {
                  return "You need to write something!";
                }
              },
        })

        if (result.isConfirmed) {
            setPageState(pageState + 1);
            setUserName(result.value);
            initiateConnection(result.value);
        }

    }

    return (
        <div className="w-screen h-screen flex items-center justify-center  bg-purple-950">

            {
                pageState == 0
                    ?
                    <button onClick={startGame} className="h-16 w-[20rem] rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors duration-300 text-white font-bold text-3xl" >Play online</button>
                    :
                    pageState == 1
                        ?
                        <div className="text-3xl text-white font-semibold" >Waiting for opponent...</div>
                        :
                        <div className="w-[36rem] flex items-center gap-4 justify-center flex-col h-fit" >
                            {/* players  */}
                            <div className="flex w-full justify-between items-center">
                                <div className={`w-[8rem] flex items-center justify-center ${turn !== opponent.playingAs ? 'bg-purple-500 text-white font-bold' : 'bg-purple-200 text-black'} px-8 py-2   rounded-tl-[3rem] rounded-br-[3rem]`}>{userName}</div>
                                <div className={`w-[8rem] flex items-center justify-center ${turn === opponent.playingAs ? 'bg-purple-500 text-white font-bold' : 'bg-purple-200 text-black'}  px-8 py-2   rounded-tr-[3rem] rounded-bl-[3rem]`}>{opponent?.opponentName}</div>

                            </div>

                            {winner &&( winner === "draw" ? <div className="text-white text-xl" > Game draw! </div>:winner === "left" ? <div className="text-white text-xl" >Opponent left the game</div>:<div className="text-white text-xl" > <span className="font-bold text-purple-300" >{winner==opponent.playingAs ? opponent?.opponentName:"You"}</span> won the game</div>)}

            <div className="w-full h-fit flex flex-col items-center gap-2 justify-end" >
                {
                    gameState?.map((row, rowIndex) => {
                        return <div key={rowIndex} className="w-full flex justify-center gap-2 items-center" >
                            {
                                row?.map((box, colIndex) => (
                                    <Box
                                        key={colIndex}
                                        box={box}
                                        rowIndex={rowIndex}
                                        colIndex={colIndex}
                                        turn={turn}
                                        setTurn={setTurn}
                                        setGameState={setGameState}
                                        gameState={gameState}
                                        winner={winner}
                                        winnerState={winnerState}
                                        socket={socket}
                                        opponent={opponent}
                                    />
                                ))
                            }

                        </div>
                    })
                }
            </div>

        </div>
            }
        </div >
    )
}

export default Game