const saveKey = "floraeGameState";

function hashString(value) {
    let hash = 2166136261;

    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
}

export function loadGameState(state) {
    const savedState = localStorage.getItem(saveKey);

    if (!savedState) {
        return;
    }

    try {
        const parsedState = JSON.parse(savedState);

        if (parsedState.plant && parsedState.weather && parsedState.game) {
            Object.assign(state.plant, parsedState.plant);
            if (!Number.isSafeInteger(state.plant.visualSeed)) {
                state.plant.visualSeed = hashString(savedState);
            }
            Object.assign(state.weather, parsedState.weather);
            Object.assign(state.bugs, parsedState.bugs);
            Object.assign(state.game, parsedState.game);
            state.game.skillPoints = Number.isSafeInteger(state.game.skillPoints)
                ? Math.max(0, state.game.skillPoints)
                : 0;
            state.game.stageChangeRemainder = Number.isSafeInteger(state.game.stageChangeRemainder)
                ? Math.max(0, state.game.stageChangeRemainder) % 3
                : 0;
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
        growthPoints: 1,
        visualSeed: Math.floor(Math.random() * 0xFFFFFFFF)
    });

    Object.assign(state.weather, { type: "Sunny", daysRemaining: 0, duration: 0 });
    Object.assign(state.bugs, { type: "None", passedToday: 0 });
    Object.assign(state.game, {
        day: 1,
        season: "Spring",
        skillPoints: 0,
        stageChangeRemainder: 0,
        upgrades: { roots: 0, leaf: 0, vitality: 0 }
    });
}
