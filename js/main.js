// main.js

import { plant, weather, bugs, game, waterPlant, giveSunlight, giveNutriments, resetGameState } from "./gameData.js";
import { startGameClock } from "./gameClock.js";


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


export function updateUI() {

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
