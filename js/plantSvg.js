import { getNaturalGrowthStats } from "./plant.js";

function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
}

function getLevel(value) {
    const level = Number(value);
    return Number.isFinite(level) ? Math.max(0, Math.floor(level)) : 0;
}

function createRandom(seed) {
    let value = (Number(seed) >>> 0) || 1;

    return () => {
        value ^= value << 13;
        value ^= value >>> 17;
        value ^= value << 5;
        return (value >>> 0) / 4294967296;
    };
}

export function getPlantVisualStats(plant, upgrades) {
    const level = getLevel(plant.level);
    const rootLevel = getLevel(upgrades.roots);
    const leafLevel = getLevel(upgrades.leaf);
    const vitalityLevel = getLevel(upgrades.vitality);
    const naturalGrowth = getNaturalGrowthStats(level);
    const skillTree = upgrades.skillTree || {};
    const branchLevel = Math.min(5, getLevel(skillTree.branch));
    const barkLevel = Math.min(3, getLevel(skillTree.bark));
    const strongRootLevel = Math.min(3, getLevel(skillTree.strongRoots));
    const heartwoodLevel = Math.min(3, getLevel(skillTree.heartwood));
    const branchMilestones = Array.isArray(skillTree.branchLeafMilestones)
        ? skillTree.branchLeafMilestones
        : [];
    const leafMultiplierForRank = upgradeRank => 2 ** Array.from({ length: branchLevel }, (_, index) => {
        const milestone = Number.isSafeInteger(branchMilestones[index]) ? branchMilestones[index] : leafLevel;
        return milestone < upgradeRank;
    }).filter(Boolean).length;
    let leafUpgradeLeaves = 0;

    if (naturalGrowth.naturalLeafCount > 0) {
        for (let upgradeRank = 1; upgradeRank <= leafLevel; upgradeRank += 1) {
            leafUpgradeLeaves += leafMultiplierForRank(upgradeRank);
        }
    }
    const rootUpgradeBonus = level >= 2 ? Math.min(rootLevel, 7) * 2 : 0;
    const stemWidth = naturalGrowth.stemHeight > 0
        ? clamp(5 + vitalityLevel * 0.8 + barkLevel * 0.9 + Math.max(0, level - 1) * 0.25, 5, 13)
        : 0;

    return {
        level,
        rootLevel,
        leafLevel,
        vitalityLevel,
        branchLevel,
        barkLevel,
        strongRootLevel,
        heartwoodLevel,
        barkThunderstormReduction: barkLevel * 2,
        barkHeavyRainReduction: barkLevel,
        strongRootYieldBonus: strongRootLevel * 2,
        heartwoodGrowthBonus: heartwoodLevel,
        nextLeafUpgradeMultiplier: leafMultiplierForRank(leafLevel + 1),
        branchCount: naturalGrowth.stemHeight > 0 ? branchLevel : 0,
        flowerUnlocked: Boolean(skillTree.flower),
        branchFlowerUnlocked: Boolean(skillTree.branchFlower && skillTree.flower && branchLevel > 0),
        flowerStyle: Math.min(3, getLevel(skillTree.flowerStyle)),
        ...naturalGrowth,
        stemWidth,
        rootCount: naturalGrowth.naturalRootCount + rootUpgradeBonus + strongRootLevel * 2,
        leafUpgradeLeaves,
        leafCount: naturalGrowth.naturalLeafCount + leafUpgradeLeaves
    };
}

export function createPlantSvg(plant, upgrades) {
    const random = createRandom(plant.visualSeed);
    const {
        level, rootLevel, leafLevel, branchLevel, flowerUnlocked, branchFlowerUnlocked,
        flowerStyle, barkLevel, stemHeight, stemWidth, rootCount, naturalLeafCount, leafUpgradeLeaves
    } = getPlantVisualStats(plant, upgrades);
    const top = 211 - stemHeight;
    const hue = Math.round(112 + random() * 34);
    const leafColor = `hsl(${hue} 48% 43%)`;
    const leafHighlight = `hsl(${hue} 54% 58%)`;
    const stemColor = `hsl(${Math.max(85, hue - 20)} 42% 34%)`;
    const stemBend = Math.round((random() - 0.5) * 28);
    const stem = stemHeight > 0
        ? `<path d="M 180 211 C ${174 + stemBend} ${211 - stemHeight * 0.4}, ${188 - stemBend} ${211 - stemHeight * 0.75}, ${180 + stemBend} ${top}" fill="none" stroke="${stemColor}" stroke-width="${stemWidth}" stroke-linecap="round" />`
        : "";
    const barkGrooves = Array.from({ length: stemHeight > 0 ? barkLevel : 0 }, (_, index) => {
        const progress = (index + 1) / (barkLevel + 1);
        const y = Math.round(top + stemHeight * progress);
        const stemX = Math.round(180 + stemBend * (1 - (y - top) / stemHeight));
        const halfWidth = Math.max(1, Math.round(stemWidth * 0.28));
        return `<path d="M ${stemX - halfWidth} ${y} Q ${stemX} ${y + 2} ${stemX + halfWidth} ${y}" />`;
    }).join("");
    const branchPositions = Array.from({ length: stemHeight > 0 ? branchLevel : 0 }, (_, index) => {
        const progress = (index + 1) / (branchLevel + 1);
        const y = Math.round(211 - stemHeight * progress);
        const stemX = Math.round(180 + stemBend * (1 - (y - top) / stemHeight));
        const side = index % 2 === 0 ? -1 : 1;
        const endX = Math.round(stemX + side * (24 + index * 3));
        const endY = Math.round(y - 12);
        return { x: endX, y: endY, stemX, stemY: y, side };
    });
    const branches = branchPositions.map(({ x, y, stemX, stemY, side }) =>
        `<path class="plant-branch" d="M ${stemX} ${stemY} Q ${stemX + side * 12} ${stemY - 5}, ${x} ${y}" />`
    ).join("");
    const roots = Array.from({ length: rootCount }, (_, index) => {
        if (index === 0) {
            return `<path d="M 180 211 C 178 220, 182 228, 180 238" />`;
        }

        const side = index % 2 === 0 ? -1 : 1;
        const rank = Math.ceil(index / 2);
        const endX = 180 + side * (12 + rank * 13 + random() * 8);
        const endY = 218 + rank * 5 + random() * 9;
        const controlX = 180 + side * (rank * 5 + random() * 10);
        return `<path d="M 180 214 C ${controlX} 222, ${endX - side * 4} ${endY - 5}, ${endX} ${endY}" />`;
    }).join("");
    function createLeaf(x, y, side) {
        const size = Math.round(24 + random() * 10 + Math.min(leafLevel, 5));
        const rise = 12 + random() * 10;
        const tipX = Math.round(x + side * size);
        const tipY = Math.round(y - rise);
        const controlX = Math.round(x + side * size * 0.55);
        const controlY = Math.round(y - rise * 0.35);
        return `<g><path d="M ${x} ${y} C ${controlX} ${controlY - 11}, ${tipX + side * 5} ${tipY - 7}, ${tipX} ${tipY} C ${tipX - side * 4} ${tipY + 10}, ${x + side * 5} ${y + 5}, ${x} ${y} Z" /><path class="vein" d="M ${x} ${y} Q ${x + side * size * 0.45} ${y - rise * 0.35}, ${tipX} ${tipY}" /></g>`;
    }
    const naturalLeaves = Array.from({ length: naturalLeafCount }, (_, index) => {
        const progress = (index + 1) / (naturalLeafCount + 1);
        const y = Math.round(top + stemHeight * 0.72 * (1 - progress));
        const stemX = Math.round(180 + stemBend * (1 - (y - top) / stemHeight));
        return createLeaf(stemX, y, index % 2 === 0 ? -1 : 1);
    }).join("");
    const leafLanes = [{ type: "stem" }, ...branchPositions.map(branch => ({ type: "branch", ...branch }))];
    const upgradeLeaves = Array.from({ length: leafUpgradeLeaves }, (_, index) => {
        const laneIndex = index % leafLanes.length;
        const laneRank = Math.floor(index / leafLanes.length);
        const laneCount = Math.ceil((leafUpgradeLeaves - laneIndex) / leafLanes.length);
        const host = leafLanes[laneIndex];
        let x;
        let y;
        let side;

        if (host.type === "branch") {
            const progress = 0.25 + 0.5 * ((laneRank + 1) / (laneCount + 1));
            x = Math.round(host.stemX + (host.x - host.stemX) * progress);
            y = Math.round(host.stemY + (host.y - host.stemY) * progress);
            side = host.side;
        } else {
            const progress = 0.2 + 0.65 * ((laneRank + 1) / (laneCount + 1));
            y = Math.round(top + stemHeight * progress);
            x = Math.round(180 + stemBend * (1 - (y - top) / stemHeight));
            side = laneRank % 2 === 0 ? -1 : 1;
        }

        return createLeaf(x, y, side);
    }).join("");

    function createFlower(x, y, flowerIndex = 0) {
        const petalColors = ["#d77b91", "#bb85db", "#79b9d1", "#f0a650"];
        const petalCount = 5 + flowerStyle * 2;
        const color = petalColors[(flowerStyle + flowerIndex) % petalColors.length];
        const petals = Array.from({ length: petalCount }, (_, index) => {
            const angle = (index / petalCount) * Math.PI * 2;
            const petalX = Math.round(x + Math.cos(angle) * 6);
            const petalY = Math.round(y + Math.sin(angle) * 6);
            return `<ellipse cx="${petalX}" cy="${petalY}" rx="${flowerStyle > 0 ? 4 : 3.5}" ry="7" fill="${color}" transform="rotate(${Math.round(angle * 180 / Math.PI)} ${petalX} ${petalY})" />`;
        }).join("");
        return `<g class="plant-flower">${petals}<circle cx="${x}" cy="${y}" r="2.5" fill="#5c3a49" /></g>`;
    }

    const flowers = flowerUnlocked && stemHeight > 0
        ? createFlower(180 + stemBend, top - 4)
            + (branchFlowerUnlocked ? branchPositions.map(({ x, y }, index) => createFlower(x, y - 2, index + 1)).join("") : "")
        : "";
    const seed = level <= 2
        ? `<ellipse cx="180" cy="205" rx="13" ry="8" fill="#9a7045" /><path d="M 176 203 Q 180 201 184 203" fill="none" stroke="#c49a62" stroke-width="2" stroke-linecap="round" />`
        : "";

    return `<svg class="plant-svg" viewBox="0 0 360 280" role="img" aria-label="${getPlantVisualStats(plant, upgrades).stage} plant">
        <ellipse cx="180" cy="216" rx="98" ry="7" fill="#365b3c" opacity=".65" />
        ${seed}
        <g class="roots" fill="none" stroke="#a8754d" stroke-width="${2 + Math.min(rootLevel * 0.25, 2)}" stroke-linecap="round">${roots}</g>
        ${stem}
        <g fill="none" stroke="#654326" stroke-width="1" opacity=".8" stroke-linecap="round">${barkGrooves}</g>
        <g fill="none" stroke="${stemColor}" stroke-width="${Math.max(2, stemWidth * 0.55)}" stroke-linecap="round">${branches}</g>
        <g fill="${leafColor}" stroke="${leafHighlight}" stroke-width="1.5" stroke-linejoin="round">${naturalLeaves}${upgradeLeaves}</g>
        ${flowers}
    </svg>`;
}
