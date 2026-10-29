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
            const branchLevel = Math.min(5, Math.max(0, Number.isSafeInteger(state.game.skillTree?.branch) ? state.game.skillTree.branch : 0));
            const leafLevel = Number.isSafeInteger(state.game.upgrades?.leaf) ? Math.max(0, state.game.upgrades.leaf) : 0;
            const savedMilestones = state.game.skillTree?.branchLeafMilestones;
            state.game.skillTree = {
                branch: branchLevel,
                branchLeafMilestones: Array.from({ length: branchLevel }, (_, index) => {
                    const milestone = Array.isArray(savedMilestones) ? savedMilestones[index] : undefined;
                    return Number.isSafeInteger(milestone)
                        ? Math.min(leafLevel, Math.max(0, milestone))
                        : leafLevel;
                }),
                flower: state.game.skillTree?.flower ? 1 : 0,
                branchFlower: state.game.skillTree?.branchFlower ? 1 : 0,
                flowerStyle: Math.min(3, Math.max(0, Number.isSafeInteger(state.game.skillTree?.flowerStyle) ? state.game.skillTree.flowerStyle : 0)),
                bark: Math.min(3, Math.max(0, Number.isSafeInteger(state.game.skillTree?.bark) ? state.game.skillTree.bark : 0)),
                strongRoots: Math.min(3, Math.max(0, Number.isSafeInteger(state.game.skillTree?.strongRoots) ? state.game.skillTree.strongRoots : 0)),
                heartwood: Math.min(3, Math.max(0, Number.isSafeInteger(state.game.skillTree?.heartwood) ? state.game.skillTree.heartwood : 0))
            };
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
        skillTree: { branch: 0, branchLeafMilestones: [], flower: 0, branchFlower: 0, flowerStyle: 0, bark: 0, strongRoots: 0, heartwood: 0 },
        upgrades: { roots: 0, leaf: 0, vitality: 0 }
    });
}
