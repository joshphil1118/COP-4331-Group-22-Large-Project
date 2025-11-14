import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RouletteWheel from '../components/RouletteWheel1';
import BettingBoard, { type Bet } from '../components/BettingBoard1';
import './Game.css';

interface PlacedBet extends Bet {
  id: number;
}

function Game() {
  const [balance, setBalance] = useState(1000);
  const [bets, setBets] = useState<PlacedBet[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [betIdCounter, setBetIdCounter] = useState(0);

  const currentBetTotal = bets.reduce((sum, bet) => sum + bet.amount, 0);

  const handlePlaceBet = (bet: Bet) => {
    if (bet.amount > balance) {
      setMessage('Insufficient balance!');
      return;
    }

    setBalance(prev => prev - bet.amount);
    setBets(prev => [...prev, { ...bet, id: betIdCounter }]);
    setBetIdCounter(prev => prev + 1);
    setMessage(`Bet placed: $${bet.amount} on ${bet.value}`);
  };

  const handleClearBets = () => {
    setBalance(prev => prev + currentBetTotal);
    setBets([]);
    setMessage('All bets cleared');
  };

  const handleSpin = () => {
    if (bets.length === 0) {
      setMessage('Please place at least one bet!');
      return;
    }

    setSpinning(true);
    setMessage('Spinning...');
    setWinningNumber(null);
  };

  const checkWinningBets = (winNum: number): number => {
    let totalWinnings = 0;

    bets.forEach(bet => {
      let isWinner = false;
      let payout = 0;

      switch (bet.type) {
        case 'straight':
          if (bet.value === winNum) {
            isWinner = true;
            payout = bet.amount * 35; // 35:1 payout
          }
          break;

        case 'color':
          const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
          const isRed = redNumbers.includes(winNum);
          const isBlack = winNum !== 0 && !isRed;
          
          if ((bet.value === 'red' && isRed) || (bet.value === 'black' && isBlack)) {
            isWinner = true;
            payout = bet.amount * 2; // 1:1 payout
          }
          break;

        case 'evenOdd':
          if (winNum === 0) break;
          const isEven = winNum % 2 === 0;
          if ((bet.value === 'even' && isEven) || (bet.value === 'odd' && !isEven)) {
            isWinner = true;
            payout = bet.amount * 2; // 1:1 payout
          }
          break;

        case 'range':
          if (bet.value === '1-18' && winNum >= 1 && winNum <= 18) {
            isWinner = true;
            payout = bet.amount * 2; // 1:1 payout
          } else if (bet.value === '19-36' && winNum >= 19 && winNum <= 36) {
            isWinner = true;
            payout = bet.amount * 2; // 1:1 payout
          }
          break;
      }

      if (isWinner) {
        totalWinnings += payout;
      }
    });

    return totalWinnings;
  };

  const handleSpinComplete = (winNum: number) => {
    setWinningNumber(winNum);
    setSpinning(false);

    const winnings = checkWinningBets(winNum);
    
    if (winnings > 0) {
      setBalance(prev => prev + winnings);
      setMessage(`🎉 You won $${winnings}!`);
    } else {
      setMessage(`You lost $${currentBetTotal}. Try again!`);
    }

    setBets([]);
  };

  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="back-link">← Back to Home</Link>
        <h1>🎰 Roulette Game</h1>
        <p className="subtitle">Place your bets and spin the wheel!</p>
      </header>

      <main className="app-main">
        <RouletteWheel 
          spinning={spinning} 
          onSpinComplete={handleSpinComplete}
        />

        {message && (
          <div className={`message ${message.includes('won') ? 'win' : ''}`}>
            {message}
          </div>
        )}

        <BettingBoard
          balance={balance}
          currentBet={currentBetTotal}
          onPlaceBet={handlePlaceBet}
          onClearBets={handleClearBets}
          disabled={spinning}
        />

        <div className="controls">
          <button
            className="spin-btn"
            onClick={handleSpin}
            disabled={spinning || bets.length === 0}
          >
            {spinning ? 'SPINNING...' : 'SPIN THE WHEEL'}
          </button>
        </div>

        {bets.length > 0 && (
          <div className="active-bets">
            <h3>Active Bets:</h3>
            <ul>
              {bets.map(bet => (
                <li key={bet.id}>
                  ${bet.amount} on {bet.value} ({bet.type})
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}

export default Game;