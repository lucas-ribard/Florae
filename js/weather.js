const daysPerSeason = 10;

const seasonalWeather = {
    Spring: { Sunny: 10, Foggy: 1, Cloudy: 3, Rainy: 4, HeavyRain: 1, ThunderStorm: 1 },
    Summer: { Sunny: 13, Foggy: 1, Cloudy: 2, Rainy: 2, HeavyRain: 1, ThunderStorm: 1 },
    Autumn: { Sunny: 8, Foggy: 3, Cloudy: 3, Rainy: 4, HeavyRain: 1, ThunderStorm: 1 },
    Winter: { Sunny: 3, Foggy: 6, Cloudy: 4, Rainy: 3, HeavyRain: 2, ThunderStorm: 2 }
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

export function updateSeason(game) {
    game.season = getSeason(game.day);
}

export function rollWeather(weather, game) {
    const duration = Math.floor(Math.random() * 10) + 1;
    const type = rollWeatherType(seasonalWeather[game.season]);

    weather.type = type;
    weather.duration = duration;
    weather.daysRemaining = duration;
}
