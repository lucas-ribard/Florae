// main.js

import { plant, weather, bugs, game, waterPlant, giveSunlight, giveNutriments, resetGameState, getUpgradeCost, purchaseUpgrade, adjustDebugValue, advanceGameDay } from "./gameData.js";
import { startGameClock } from "./gameClock.js";
import { createPlantSvg, getPlantVisualStats } from "./plantSvg.js";


const plantVisual = document.getElementById("plant");
const waterButton = document.getElementById("waterButton");
const sunButton = document.getElementById("sunButton");
const nutrimentsButton = document.getElementById("nutrimentsButton");

const waterButtonNegative = document.getElementById("waterButtonNegative");
const sunButtonNegative = document.getElementById("sunButtonNegative");
const nutrimentsButtonNegative = document.getElementById("nutrimentsButtonNegative");

const resetButton = document.getElementById("resetButton");
const upgradeButton = document.getElementById("upgradeButton");
const skillTreeButton = document.getElementById("skillTreeButton");
const panelBackdrop = document.getElementById("panelBackdrop");
const sidePanels = document.querySelectorAll(".side-panel");
const closePanelButtons = document.querySelectorAll("[data-close-panel]");
const upgradeBuyButtons = document.querySelectorAll("[data-upgrade]");
const debugValueButtons = document.querySelectorAll("[data-debug-stat]");
const advanceDayButton = document.getElementById("debugAdvanceDay");
const plantStatsToggle = document.getElementById("plantStatsToggle");
const plantStatsPanel = document.getElementById("plantStatsPanel");

const growthPointsValue = document.getElementById("growthPoints");

const waterValue = document.getElementById("waterValue");
const sunValue = document.getElementById("sunValue");
const nutrimentsValue = document.getElementById("nutrimentsValue");

const growthValue = document.getElementById("growthValue");
const stageValue = document.getElementById("stageValue");
const levelValue = document.getElementById("levelValue");
const healthValue = document.getElementById("healthValue");
const healthFactorValue = document.getElementById("HealthFactorValue");

const weatherValue = document.getElementById("weatherValue");
const weatherDurationValue = document.getElementById("weatherDurationValue");
const dayValue = document.getElementById("dayValue");
const seasonValue = document.getElementById("seasonValue");
const bugsTypeValue = document.getElementById("bugsTypeValue");
const bugsValue = document.getElementById("bugsValue");

plantStatsToggle.addEventListener("click", () => {
    const isExpanded = plantStatsToggle.getAttribute("aria-expanded") === "true";
    plantStatsToggle.setAttribute("aria-expanded", String(!isExpanded));
    plantStatsPanel.hidden = isExpanded;
});

waterButton.addEventListener("click", () => {

    waterPlant(20);

    updateUI();

});


sunButton.addEventListener("click", () => {

    giveSunlight(20);

    updateUI();

});

nutrimentsButton.addEventListener("click", () => {

    giveNutriments(20);

    updateUI();
});

resetButton.addEventListener("click", () => {
    if (confirm("Reset all saved game data?")) {
        resetGameState();
        updateUI();
    }
});

waterButtonNegative.addEventListener("click", () => {

    waterPlant(-20);
    updateUI();
});
sunButtonNegative.addEventListener("click", () => {

    giveSunlight(-20);
    updateUI();
});
nutrimentsButtonNegative.addEventListener("click", () => {
    giveNutriments(-20);
    updateUI();
});

function openPanel(panel, button) {
    sidePanels.forEach((otherPanel) => {
        otherPanel.classList.remove("is-open");
        otherPanel.setAttribute("aria-hidden", "true");
    });

    [upgradeButton, skillTreeButton].forEach((otherButton) => {
        otherButton.setAttribute("aria-expanded", "false");
    });

    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    button.setAttribute("aria-expanded", "true");
    panelBackdrop.hidden = false;
}

function closePanels() {
    sidePanels.forEach((panel) => {
        panel.classList.remove("is-open");
        panel.setAttribute("aria-hidden", "true");
    });

    [upgradeButton, skillTreeButton].forEach((button) => {
        button.setAttribute("aria-expanded", "false");
    });

    panelBackdrop.hidden = true;
}

upgradeButton.addEventListener("click", () => {
    openPanel(document.getElementById("upgradePanel"), upgradeButton);
});

skillTreeButton.addEventListener("click", () => {
    openPanel(document.getElementById("skillTreePanel"), skillTreeButton);
});

panelBackdrop.addEventListener("click", closePanels);
closePanelButtons.forEach((button) => button.addEventListener("click", closePanels));
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closePanels();
    }
});

upgradeBuyButtons.forEach((button) => {
    button.addEventListener("click", () => {
        purchaseUpgrade(button.dataset.upgrade);
        updateUI();
    });
});

debugValueButtons.forEach((button) => {
    button.addEventListener("click", () => {
        adjustDebugValue(button.dataset.debugStat, Number(button.dataset.debugAmount));
        updateUI();
    });
});

advanceDayButton.addEventListener("click", () => {
    advanceGameDay();
    updateUI();
});


export function updateUI() {
    plantVisual.innerHTML = createPlantSvg(plant, game.upgrades);
    const visualStats = getPlantVisualStats(plant, game.upgrades);

    document.getElementById("plantStatsLevel").textContent = plant.level;
    document.getElementById("plantStatsLeafUpgrade").textContent = game.upgrades.leaf;
    document.getElementById("plantStatsSunlightYield").textContent = `+${20 + game.upgrades.leaf} per action`;
    document.getElementById("plantStatsLeafAbsorption").textContent = `+${visualStats.naturalLeafCount} per day`;
    document.getElementById("plantStatsRootUpgrade").textContent = game.upgrades.roots;
    document.getElementById("plantStatsWaterYield").textContent = `+${20 + game.upgrades.roots} per action`;
    document.getElementById("plantStatsNutrimentYield").textContent = `+${20 + game.upgrades.roots} per action`;
    document.getElementById("plantStatsVitalityUpgrade").textContent = game.upgrades.vitality;
    document.getElementById("plantStatsHealingBonus").textContent = `+${game.upgrades.vitality} per day`;
    document.getElementById("plantStatsNaturalLeaves").textContent = visualStats.naturalLeafCount;
    document.getElementById("plantStatsLeaves").textContent = visualStats.leafCount;
    document.getElementById("plantStatsRoots").textContent = visualStats.rootCount;

    // states values
    waterValue.textContent = plant.water;
    sunValue.textContent = plant.sunlight;
    nutrimentsValue.textContent = plant.nutriments;

    // growth and health values
    growthValue.textContent = plant.growth;
    stageValue.textContent = plant.stage;
    levelValue.textContent = plant.level;
    healthValue.textContent = plant.health;
    healthFactorValue.textContent = plant.healthFactor;
    growthPointsValue.textContent = plant.growthPoints;

    upgradeBuyButtons.forEach((button) => {
        const upgrade = button.dataset.upgrade;
        button.disabled = plant.growthPoints < getUpgradeCost(upgrade);
    });

    document.querySelectorAll("[data-upgrade-level]").forEach((levelValue) => {
        levelValue.textContent = game.upgrades[levelValue.dataset.upgradeLevel];
    });

    document.querySelectorAll("[data-upgrade-cost]").forEach((costValue) => {
        costValue.textContent = getUpgradeCost(costValue.dataset.upgradeCost);
    });

    weatherValue.textContent = weather.type;
    weatherDurationValue.textContent = weather.daysRemaining;
    dayValue.textContent = game.day;
    seasonValue.textContent = game.season;
    bugsTypeValue.textContent = bugs.type;
    bugsValue.textContent = bugs.passedToday;


    healthBar.style.width = plant.health + "%";

    waterBar.style.width = plant.water + "%";

    sunBar.style.width = plant.sunlight + "%";

    growthBar.style.width = plant.growth + "%";

    nutrimentsBar.style.width = plant.nutriments + "%";


}


startGameClock();

updateUI();
