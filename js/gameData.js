// gameData.js

import { plant, weather, bugs, game } from "./state.js";
import { addResource, updatePlant as updatePlantState } from "./plant.js";
import { rollBugs as rollBugsState } from "./bugs.js";
import { rollWeather as rollWeatherState, updateSeason } from "./weather.js";
import { loadGameState, resetGameState as resetSavedGame, saveGameState as saveState } from "./persistence.js";

export { plant, weather, bugs, game };

const state = { plant, weather, bugs, game };

loadGameState(state);

export function saveGameState() {
    saveState(state);
}

export function resetGameState() {
    resetSavedGame(state);
}

export function rollWeather() {
    rollWeatherState(weather, game);
    saveGameState();
}

export function rollBugs() {
    rollBugsState(bugs, plant);
}

export function advanceGameDay() {
    game.day += 1;
    updateSeason(game);

    if (weather.daysRemaining <= 0) {
        rollWeather();
    }

    weather.daysRemaining -= 1;
    rollBugs();
    updatePlantState(plant, weather);
    saveGameState();
}

export function waterPlant(amount) {
    addResource(plant, "water", amount);
    saveGameState();
}

export function giveSunlight(amount) {
    addResource(plant, "sunlight", amount);
    saveGameState();
}

export function giveNutriments(amount) {
    addResource(plant, "nutriments", amount);
    saveGameState();
}

export function updatePlant() {
    updatePlantState(plant, weather);
}

