function clamp(value) {
    return Math.min(100, Math.max(0, value));
}

function getPlantLevel(level) {
    const plantLevel = Number(level);
    return Number.isFinite(plantLevel) ? Math.max(1, Math.floor(plantLevel)) : 1;
}

const growthStages = [
    { level: 1, name: "Seed" },
    { level: 2, name: "Germination" },
    { level: 3, name: "Root development" },
    { level: 4, name: "Sprout" },
    { level: 5, name: "Seedling" },
    { level: 7, name: "Young plant" },
    { level: 10, name: "Mature plant" }
];

export function getPlantGrowthStage(level) {
    const plantLevel = getPlantLevel(level);
    return growthStages.reduce((current, stage) => plantLevel >= stage.level ? stage : current, growthStages[0]);
}

export function countPlantStageChanges(fromLevel, toLevel) {
    let changes = 0;
    let previousStage = getPlantGrowthStage(fromLevel).name;

    for (let level = getPlantLevel(fromLevel) + 1; level <= getPlantLevel(toLevel); level += 1) {
        const currentStage = getPlantGrowthStage(level).name;
        if (currentStage !== previousStage) {
            changes += 1;
            previousStage = currentStage;
        }
    }

    return changes;
}

export function getNaturalGrowthStats(level) {
    const plantLevel = getPlantLevel(level);
    const naturalRootCount = plantLevel === 1
        ? 0
        : plantLevel === 2
            ? 1
            : Math.min(3 + plantLevel - 3, 8);
    const stemHeight = plantLevel < 4
        ? 0
        : Math.min(34 + (plantLevel - 4) * 12, 118);
    const naturalLeafCount = plantLevel < 5
        ? 0
        : 1 + Math.min(Math.floor((plantLevel - 5) / 2), 3);

    return {
        stage: getPlantGrowthStage(plantLevel).name,
        naturalRootCount,
        stemHeight,
        naturalLeafCount
    };
}

export function updatePlant(plant, weather, upgrades) {
    plant.nutriments -= 1;
    plant.sunlight += getNaturalGrowthStats(plant.level).naturalLeafCount;

    switch (weather.type) {
        case "ThunderStorm": plant.water += 15; plant.sunlight -= 10; plant.health -= 10; break;
        case "HeavyRain": plant.water += 15; plant.sunlight -= 10; plant.health -= 5; break;
        case "Rainy": plant.water += 5; plant.sunlight -= 5; break;
        case "Cloudy": plant.water += 5; plant.sunlight += 2; break;
        case "Foggy": plant.water += 2; plant.sunlight -= 7; break;
        case "Sunny": plant.water -= 5; plant.sunlight += 10; break;
    }

    plant.water = clamp(plant.water);
    plant.sunlight = clamp(plant.sunlight);
    plant.nutriments = clamp(plant.nutriments);
    plant.healthFactor = 0;

    for (const resource of [plant.water, plant.sunlight, plant.nutriments]) {
        if (resource === 0) {
            plant.healthFactor -= 2;
        } else if (resource < 30) {
            plant.healthFactor -= 1;
        }
    }

    if (plant.healthFactor === 0) {
        for (const resource of [plant.water, plant.sunlight, plant.nutriments]) {
            if (resource > 70) {
                plant.healthFactor += 1;
            }
        }
    }

    const resourcesHealthy = plant.water > 30 && plant.sunlight > 30 && plant.nutriments > 30;
    const healingAmount = resourcesHealthy
        ? 5 + Math.max(0, plant.healthFactor) + upgrades.vitality
        : plant.healthFactor;

    plant.health += healingAmount;

    if (resourcesHealthy && plant.health > 30) {
        plant.growth += 10 + Math.max(0, plant.healthFactor) * 2;
    }

    plant.health = clamp(plant.health);
    plant.growth = clamp(plant.growth);

    if (plant.growth === 100) {
        plant.level += 1;
        plant.growthPoints += 1;
        plant.growth = 0;
    }
}

export function addResource(plant, resource, amount, upgrades) {
    if (amount > 0 && (resource === "water" || resource === "nutriments")) {
        amount += upgrades.roots;
    }

    if (amount > 0 && resource === "sunlight") {
        amount += upgrades.leaf;
    }

    plant[resource] = clamp(plant[resource] + amount);
}
