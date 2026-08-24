const bugTypes = {
    Worm: { weight: 5, nutriments: 3 },
    Locust: { weight: 3, nutriments: 1 },
    Beetle: { weight: 2, nutriments: 2 },
    Ladybug: { weight: 1, nutriments: 2 }
};

export function rollBugs(bugs, plant) {
    const bugChance = Math.floor(Math.random() * 100) + 1;
    bugs.type = "None";
    bugs.passedToday = 0;

    if (bugChance >= 50) {
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
