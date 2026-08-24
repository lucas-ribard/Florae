const saveKey = "floraeGameState";

export function loadGameState(state) {
    const savedState = localStorage.getItem(saveKey);

    if (!savedState) {
        return;
    }

    try {
        const parsedState = JSON.parse(savedState);

        if (parsedState.plant && parsedState.weather && parsedState.game) {
            Object.assign(state.plant, parsedState.plant);
            Object.assign(state.weather, parsedState.weather);
            Object.assign(state.bugs, parsedState.bugs);
            Object.assign(state.game, parsedState.game);
        }
    } catch {
        localStorage.removeItem(saveKey);
    }
}

export function saveGameState(state) {
    localStorage.setItem(saveKey, JSON.stringify(state));
}

export function resetGameState(state) {
    localStorage.removeItem(saveKey);

    Object.assign(state.plant, {
        health: 100,
        healthFactor: 0,
        water: 50,
        sunlight: 50,
        nutriments: 50,
        growth: 0,
        stage: 'seed',
        level: 1,
        growthPoints: 1
    });

    Object.assign(state.weather, { type: "Sunny", daysRemaining: 0, duration: 0 });
    Object.assign(state.bugs, { type: "None", passedToday: 0 });
    Object.assign(state.game, { day: 1, season: "Spring" });
}
