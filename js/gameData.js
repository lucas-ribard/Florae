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
const branchLevel = Math.min(5, Math.max(0, Number.isSafeInteger(game.skillTree?.branch) ? game.skillTree.branch : 0));
const leafUpgradeLevel = Math.max(0, Number.isSafeInteger(game.upgrades.leaf) ? game.upgrades.leaf : 0);
const savedBranchMilestones = game.skillTree?.branchLeafMilestones;
game.skillTree = {
    branch: branchLevel,
    branchLeafMilestones: Array.from({ length: branchLevel }, (_, index) => {
        const milestone = Array.isArray(savedBranchMilestones) ? savedBranchMilestones[index] : undefined;
        return Number.isSafeInteger(milestone)
            ? Math.min(leafUpgradeLevel, Math.max(0, milestone))
            : leafUpgradeLevel;
    }),
    flower: game.skillTree?.flower ? 1 : 0,
    branchFlower: game.skillTree?.branchFlower ? 1 : 0,
    flowerStyle: Math.min(3, Math.max(0, Number.isSafeInteger(game.skillTree?.flowerStyle) ? game.skillTree.flowerStyle : 0)),
    bark: Math.min(3, Math.max(0, Number.isSafeInteger(game.skillTree?.bark) ? game.skillTree.bark : 0)),
    strongRoots: Math.min(3, Math.max(0, Number.isSafeInteger(game.skillTree?.strongRoots) ? game.skillTree.strongRoots : 0)),
    heartwood: Math.min(3, Math.max(0, Number.isSafeInteger(game.skillTree?.heartwood) ? game.skillTree.heartwood : 0))
};

function getGameplayUpgrades() {
    return {
        ...game.upgrades,
        roots: game.upgrades.roots + game.skillTree.strongRoots * 2,
        skillTree: game.skillTree
    };
}

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
    rollBugsState(bugs, plant, getGameplayUpgrades());
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
    updatePlantState(plant, weather, getGameplayUpgrades());
    awardStageChangePoints(previousLevel, plant.level);
    saveGameState();
}

export function waterPlant(amount) {
    addResource(plant, "water", amount, getGameplayUpgrades());
    saveGameState();
}

export function giveSunlight(amount) {
    addResource(plant, "sunlight", amount, getGameplayUpgrades());
    saveGameState();
}

export function giveNutriments(amount) {
    addResource(plant, "nutriments", amount, getGameplayUpgrades());
    saveGameState();
}

export function updatePlant() {
    updatePlantState(plant, weather, getGameplayUpgrades());
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

export function purchaseSkill(skill, rank = 1) {
    const skillTree = game.skillTree;
    const skillRequirements = {
        branch: skillTree.branch < 5 && rank === skillTree.branch + 1,
        flower: skillTree.flower === 0 && rank === 1,
        branchFlower: skillTree.branch > 0 && skillTree.flower > 0 && skillTree.branchFlower === 0 && rank === 1,
        flowerStyle: skillTree.flower > 0 && skillTree.flowerStyle < 3 && rank === skillTree.flowerStyle + 1,
        bark: skillTree.bark < 3 && rank === skillTree.bark + 1,
        strongRoots: skillTree.strongRoots < 3 && rank === skillTree.strongRoots + 1,
        heartwood: skillTree.heartwood < 3 && rank === skillTree.heartwood + 1
    };

    if (!Object.hasOwn(skillRequirements, skill) || !skillRequirements[skill] || game.skillPoints < 1) {
        return false;
    }

    if (skill === "branch") {
        skillTree.branchLeafMilestones.push(game.upgrades.leaf);
    }

    skillTree[skill] = rank;
    game.skillPoints -= 1;
    saveGameState();
    return true;
}
