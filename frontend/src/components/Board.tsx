import React, {useState} from "react";

import "./Board.css"

export interface Bet {
    type: string;
    value: number | string;
    amount: number;
}

interface BoardProps {
    balance: number;
    currentBet: number;
    onPlaceBet: (bet: Bet) => void;
    onClearBets: () => void;
    disabled: boolean;
}


const Board: React.FC<BoardProps> = ({balance, currentBet, onPlaceBet, onClearBets, disabled}) => {
    const [chipValue, setChipValue] = useState(10);

    const numbers = Array.from({length: 36}, (_, i) => i + 1);

    const getNumberColor = (num : number): string => 
    {
        const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
        return redNumbers.includes(num) ? 'red' : 'black'
    }

    const handleNumberClick = (num: number) => 
    {
        if (disabled || chipValue > balance) return;
        onPlaceBet({ type: 'straight', value: num, amount: chipValue });
    };

    return (
        <div id="board">
            <div id="board-info">
                <div id="balance">Balance: ¤{balance}</div>
                <div id="current-bet">Current Bet: ¤{currentBet}</div>
            </div>

            <div className="chips">
            
            </div>

            

            <div id="betting-area">
                <div id="main-number-buttons">
                    <button
                        key="0"
                        id="zero-button"
                        className="number-button"
                        onClick={() => handleNumberClick(0)}
                        disabled={disabled}
                    >
                        0
                    </button>

                    {numbers.map(num => (
                        <button
                            key={num}
                            className={`number-button ${getNumberColor(num)}-button`}
                            onClick={() => handleNumberClick(num)}
                            disabled={disabled}
                        >
                            {num}
                        </button>
                    ))}                    
                </div>
            </div>



        </div>
    )
}

export default Board;