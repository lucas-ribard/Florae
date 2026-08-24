// gameData.js

import { plant, weather, bugs, game } from "./state.js";
import { addResource, updatePlant as updatePlantState } from "./plant.js";
import { rollBugs as rollBugsState } from "./bugs.js";
import { rollWeather as rollWeatherState, updateSeason } from "./weather.js";
import { loadGameState, resetGameState as resetSavedGame, saveGameState as saveState } from "./persistence.js";

export { plant, weather, bugs, game };

const state = { plant, weather, bugs, game };

loadGameState(state);
game.upgrades = {
    roots: game.upgrades?.roots ?? 0,
    leaf: game.upgrades?.leaf ?? 0,
    vitality: game.upgrades?.vitality ?? 0
};

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
    rollBugsState(bugs, plant, game.upgrades);
}

export function advanceGameDay() {
    game.day += 1;
    updateSeason(game);

    if (weather.daysRemaining <= 0) {
        rollWeather();
    }

    weather.daysRemaining -= 1;
    rollBugs();
    updatePlantState(plant, weather, game.upgrades);
    saveGameState();
}

export function waterPlant(amount) {
    addResource(plant, "water", amount, game.upgrades);
    saveGameState();
}

export function giveSunlight(amount) {
    addResource(plant, "sunlight", amount, game.upgrades);
    saveGameState();
}

export function giveNutriments(amount) {
    addResource(plant, "nutriments", amount, game.upgrades);
    saveGameState();
}

export function updatePlant() {
    updatePlantState(plant, weather, game.upgrades);
}

export function getUpgradeCost(upgrade) {
    return 1 + game.upgrades[upgrade] * 2;
}

export function purchaseUpgrade(upgrade) {
    const cost = getUpgradeCost(upgrade);

    if (!(upgrade in game.upgrades) || plant.growthPoints < cost) {
        return false;
    }

    plant.growthPoints -= cost;
    game.upgrades[upgrade] += 1;
    saveGameState();
    return true;
}

