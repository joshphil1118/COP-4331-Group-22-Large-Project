import React from "react";

import {type PlacedBet} from "../pages/Roulette"

import "./ActiveBets.css"

interface ActiveBetsProps {
    bets: PlacedBet[];
}

const ActiveBets: React.FC<ActiveBetsProps> = ({ bets }) => {

    return (
        <div id="active-bets">
            <ul>
            {bets.map(bet => (
                <li key={bet.id}>
                ${bet.amount} on {bet.value} ({bet.type})
                </li>
            ))}
            </ul>
        </div>
    )

};

export default ActiveBets