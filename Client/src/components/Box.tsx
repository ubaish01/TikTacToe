
import circle from '../assets/circle.svg'
import cross from '../assets/cross.svg'

interface props {
    box: any,
    rowIndex: number,
    colIndex: number,
    turn: any,
    setTurn: any,
    setGameState: any,
    gameState: any,
    winner: any,
    winnerState: any,
    socket: any,
    opponent: any
};

const Box: React.FC<props> = ({ opponent, box, rowIndex, colIndex, turn, setTurn, setGameState, gameState, winner, winnerState, socket }) => {

    const handleClick = () => {
        if (box || winner || turn == opponent.playingAs) return;
        gameState[rowIndex][colIndex] = (opponent.playingAs === 'cross') ? 'circle' : 'cross';
        setGameState([...gameState]);

        if (turn === 'cross') setTurn('circle')
        else setTurn('cross');

        socket?.emit("playerMoveFromClient", {
            data: [...gameState]
        })
    }

    return (
        <div onClick={handleClick} className={`w-[10rem] h-[10rem] flex items-center justify-center ${winner && winnerState[rowIndex][colIndex] ? opponent.playingAs === winner ? "bg-blue-400" : 'bg-purple-500' : 'bg-purple-700 '}  ${(winner || turn === opponent.playingAs) ? "cursor-not-allowed" : "cursor-pointer hover:bg-purple-600"}  transition-all duration-200 rounded-md`}>
            {box && <img src={box === 'circle' ? circle : cross} alt="" />}
        </div>
    )
}

export default Box