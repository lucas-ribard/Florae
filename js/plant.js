function clamp(value) {
    return Math.min(100, Math.max(0, value));
}

export function updatePlant(plant, weather) {
    plant.nutriments -= 1;

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
        ? 5 + Math.max(0, plant.healthFactor)
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

export function addResource(plant, resource, amount) {
    plant[resource] = clamp(plant[resource] + amount);
}
