// gameClock.js
import { updateUI } from "./main.js";
import { advanceGameDay, rollWeather, weather, game } from "./gameData.js";


export function startGameClock() {

    if (weather.daysRemaining <= 0) {
        rollWeather();
    }

    setInterval(() => {

        advanceGameDay();
        updateUI();
        console.log("a day has passed. Current day: " + game.day + ", days remaining for current weather: " + weather.daysRemaining + " (" + weather.type + ")");
        
    }, 5000);

}
