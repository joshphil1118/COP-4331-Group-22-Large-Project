import "./AppHeader.css"

import ActiveUsername from "./ActiveUsername";
import Logout from "./Logout"


function AppHeader()
{
    return (
        <header id="roulette-header">
            <ActiveUsername />
            <Logout />
        </header>
    )
}

export default AppHeader;