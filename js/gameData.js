// gameData.js

import { plant, weather, bugs, game } from "./state.js";
import { addResource, countPlantStageChanges, updatePlant as updatePlantState } from "./plant.js";
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
game.skillPoints = Number.isSafeInteger(game.skillPoints) ? Math.max(0, game.skillPoints) : 0;
game.stageChangeRemainder = Number.isSafeInteger(game.stageChangeRemainder)
    ? Math.max(0, game.stageChangeRemainder) % 3
    : 0;

function awardStageChangePoints(previousLevel, currentLevel) {
    game.stageChangeRemainder += countPlantStageChanges(previousLevel, currentLevel);

    while (game.stageChangeRemainder >= 3) {
        game.skillPoints += 1;
        game.stageChangeRemainder -= 3;
    }
}

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
    const previousLevel = plant.level;
    updatePlantState(plant, weather, game.upgrades);
    awardStageChangePoints(previousLevel, plant.level);
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

export function adjustDebugValue(stat, amount) {
    if (!Number.isFinite(amount)) {
        return false;
    }

    switch (stat) {
        case "growthPoints":
            plant.growthPoints = Math.max(0, plant.growthPoints + amount);
            break;
        case "growth": {
            const previousLevel = plant.level;
            plant.growth += amount;
            while (plant.growth >= 100) {
                plant.growth -= 100;
                plant.level += 1;
                plant.growthPoints += 1;
            }
            plant.growth = Math.max(0, plant.growth);
            awardStageChangePoints(previousLevel, plant.level);
            break;
        }
        case "health":
        case "water":
        case "sunlight":
        case "nutriments":
            plant[stat] = Math.min(100, Math.max(0, plant[stat] + amount));
            break;
        default:
            return false;
    }

    saveGameState();
    return true;
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
