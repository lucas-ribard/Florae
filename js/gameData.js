// gameData.js

export const plant = {
    health: 100,
    water: 50,
    sunlight: 50,
    nutriments: 50,
    growth: 0,
    stage: 'seed',
    level: 1,
    growthPoints: 1
};

export const weather = {
    type: "Sunny",
    daysRemaining: 0,
    duration: 0
};

export const bugs = {
    type: "None",
    passedToday: 0
};

export const game = {
    day: 1,
    season: "Spring"
};

const saveKey = "floraeGameState";
const daysPerSeason = 10;

const bugTypes = {
    Worm: { weight: 5, nutriments: 3 },
    Locust: { weight: 3, nutriments: 1 },
    Beetle: { weight: 2, nutriments: 2 },
    Ladybug: { weight: 1, nutriments: 2 }
};

const seasonalWeather = {
    Spring: {
        Sunny: 10,
        Foggy: 1,
        Cloudy: 3,
        Rainy: 4,
        HeavyRain: 1,
        ThunderStorm: 1
    },
    Summer: {
        Sunny: 13,
        Foggy: 1,
        Cloudy: 2,
        Rainy: 2,
        HeavyRain: 1,
        ThunderStorm: 1
    },
    Autumn: {
        Sunny: 8,
        Foggy: 3,
        Cloudy: 3,
        Rainy: 4,
        HeavyRain: 1,
        ThunderStorm: 1
    },
    Winter: {
        Sunny: 3,
        Foggy: 6,
        Cloudy: 4,
        Rainy: 3,
        HeavyRain: 2,
        ThunderStorm: 2
    }
};

function getSeason(day) {
    const seasons = Object.keys(seasonalWeather);
    const seasonIndex = Math.floor((day - 1) / daysPerSeason) % seasons.length;

    return seasons[seasonIndex];
}

function rollWeatherType(weights) {
    const totalWeight = Object.values(weights).reduce((total, weight) => total + weight, 0);
    let roll = Math.floor(Math.random() * totalWeight) + 1;

    for (const [type, weight] of Object.entries(weights)) {
        roll -= weight;

        if (roll <= 0) {
            return type;
        }
    }
}

function loadGameState() {
    const savedState = localStorage.getItem(saveKey);

    if (!savedState) {
        return;
    }

    try {
        const parsedState = JSON.parse(savedState);

        if (parsedState.plant && parsedState.weather && parsedState.game) {
            Object.assign(plant, parsedState.plant);
            Object.assign(weather, parsedState.weather);
            Object.assign(bugs, parsedState.bugs);
            Object.assign(game, parsedState.game);
        }
    } catch {
        localStorage.removeItem(saveKey);
    }
}

export function saveGameState() {
    localStorage.setItem(saveKey, JSON.stringify({ plant, weather, bugs, game }));
}

export function resetGameState() {
    localStorage.removeItem(saveKey);

    Object.assign(plant, {
        health: 100,
        water: 50,
        sunlight: 50,
        nutriments: 50,
        growth: 0,
        stage: 'seed',
        level: 1,
        growthPoints: 1
    });

    Object.assign(weather, { type: "Sunny", daysRemaining: 0, duration: 0 });
    Object.assign(bugs, { type: "None", passedToday: 0 });
    Object.assign(game, { day: 1, season: "Spring" });
}

loadGameState();

export function rollWeather() {
    const duration = Math.floor(Math.random() * 10) + 1;
    const type = rollWeatherType(seasonalWeather[game.season]);

    weather.type = type;
    weather.duration = duration;
    weather.daysRemaining = duration;
    saveGameState();
}

export function rollBugs() {
    const bugChance = Math.floor(Math.random() * 100) + 1;
    bugs.type = "None";
    bugs.passedToday = 0;

    if (bugChance <= 10) {
        bugs.passedToday = Math.floor(Math.random() * 3) + 1;
        const totalWeight = Object.values(bugTypes).reduce((total, bug) => total + bug.weight, 0);
        let typeRoll = Math.floor(Math.random() * totalWeight) + 1;

        for (const [type, bug] of Object.entries(bugTypes)) {
            typeRoll -= bug.weight;

            if (typeRoll <= 0) {
                bugs.type = type;
                plant.nutriments += bugs.passedToday * bug.nutriments;
                break;
            }
        }
    }
}

export function advanceGameDay() {
    game.day += 1;
    game.season = getSeason(game.day);

    if (weather.daysRemaining <= 0) {
        rollWeather();
    }

    weather.daysRemaining -= 1;
    rollBugs();
    updatePlant();
    saveGameState();
}



export function waterPlant(amount) {

    plant.water += amount;

    if (plant.water > 100) {
        plant.water = 100;
    }

    saveGameState();
}


export function giveSunlight(amount) {

    plant.sunlight += amount;

    if (plant.sunlight > 100) {
        plant.sunlight = 100;
    }

    saveGameState();
}

export function giveNutriments(amount) {

    plant.nutriments += amount;

    if (plant.nutriments > 100) {
        plant.nutriments = 100;
    }

    saveGameState();
}   



export function updatePlant() {

    // ressources decrease over time
    //plant.water -= 1;
    //plant.sunlight -= 1;
    plant.nutriments -= 1;

    // weather effects on resources
    
    switch (weather.type) {
        case "ThunderStorm": plant.water += 15, plant.sunlight -= 10, plant.health -= 10; break;
        case "HeavyRain": plant.water += 15, plant.sunlight -= 10, plant.health -= 5; break;
        case "Rainy": plant.water += 5, plant.sunlight -= 5; break;
        case "Cloudy": plant.water += 5, plant.sunlight += 2 ; break;
        case "Foggy": plant.water += 2, plant.sunlight -= 7; break;
        case "Sunny": plant.water -= 5, plant.sunlight += 10; break;
    }
        
        
        

    // Keep values between 0 and 100

    plant.water = Math.min(100, Math.max(0, plant.water));
    plant.sunlight = Math.min(100, Math.max(0, plant.sunlight));
    plant.nutriments = Math.min(100, Math.max(0, plant.nutriments));

    // If the plant has enough resources,
    // it grows.

    if (plant.water > 30 && plant.sunlight > 30 && plant.nutriments > 30 && plant.health > 30) {

        plant.growth += 10;
        

    }

    // If conditions are bad, health decreases

    if (plant.water === 0 || plant.sunlight === 0 || plant.nutriments === 0) {

        plant.health -= 2;

    }

    // If conditions are good, health increases

    if (plant.water > 30 && plant.sunlight > 30 && plant.nutriments > 30 && plant.health < 100) {

        plant.health += 5;
    }


    // Don't go below zero

    plant.health = Math.max(0, plant.health);

    // Don't grow past 100

    plant.growth = Math.min(100, plant.growth);

    if (plant.growth === 100) {

        plant.level += 1;
        plant.growthPoints += 1;
        plant.growth = 0;
        //resizePlantImage(plant.stage);
    }

}

