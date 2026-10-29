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
    const rootUpgradeBonus = level >= 2 ? Math.min(rootLevel, 7) * 2 : 0;
    const stemWidth = naturalGrowth.stemHeight > 0
        ? clamp(5 + vitalityLevel * 0.8 + Math.max(0, level - 1) * 0.25, 5, 13)
        : 0;

    return {
        level,
        rootLevel,
        leafLevel,
        vitalityLevel,
        ...naturalGrowth,
        stemWidth,
        rootCount: naturalGrowth.naturalRootCount + rootUpgradeBonus,
        leafCount: naturalGrowth.naturalLeafCount + (naturalGrowth.naturalLeafCount > 0 ? Math.min(leafLevel, 6) : 0)
    };
}

export function createPlantSvg(plant, upgrades) {
    const random = createRandom(plant.visualSeed);
    const { level, rootLevel, leafLevel, vitalityLevel, stemHeight, stemWidth, rootCount, leafCount } = getPlantVisualStats(plant, upgrades);
    const top = 211 - stemHeight;
    const hue = Math.round(112 + random() * 34);
    const leafColor = `hsl(${hue} 48% 43%)`;
    const leafHighlight = `hsl(${hue} 54% 58%)`;
    const stemColor = `hsl(${Math.max(85, hue - 20)} 42% 34%)`;
    const stemBend = Math.round((random() - 0.5) * 28);
    const stem = stemHeight > 0
        ? `<path d="M 180 211 C ${174 + stemBend} ${211 - stemHeight * 0.4}, ${188 - stemBend} ${211 - stemHeight * 0.75}, ${180 + stemBend} ${top}" fill="none" stroke="${stemColor}" stroke-width="${stemWidth}" stroke-linecap="round" />`
        : "";
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
    const leaves = Array.from({ length: leafCount }, (_, index) => {
        const progress = (index + 1) / (leafCount + 1);
        const y = Math.round(top + stemHeight * 0.72 * (1 - progress));
        const stemX = Math.round(180 + stemBend * (1 - (y - top) / stemHeight));
        const side = index % 2 === 0 ? -1 : 1;
        const size = Math.round(24 + random() * 10 + Math.min(leafLevel, 5));
        const rise = 12 + random() * 10;
        const tipX = Math.round(stemX + side * size);
        const tipY = Math.round(y - rise);
        const controlX = Math.round(stemX + side * size * 0.55);
        const controlY = Math.round(y - rise * 0.35);

        return `<g><path d="M ${stemX} ${y} C ${controlX} ${controlY - 11}, ${tipX + side * 5} ${tipY - 7}, ${tipX} ${tipY} C ${tipX - side * 4} ${tipY + 10}, ${stemX + side * 5} ${y + 5}, ${stemX} ${y} Z" /><path class="vein" d="M ${stemX} ${y} Q ${stemX + side * size * 0.45} ${y - rise * 0.35}, ${tipX} ${tipY}" /></g>`;
    }).join("");
    const seed = level <= 4
        ? `<ellipse cx="180" cy="205" rx="13" ry="8" fill="#9a7045" /><path d="M 176 203 Q 180 201 184 203" fill="none" stroke="#c49a62" stroke-width="2" stroke-linecap="round" />`
        : "";

    return `<svg class="plant-svg" viewBox="0 0 360 280" role="img" aria-label="${getPlantVisualStats(plant, upgrades).stage} plant">
        <ellipse cx="180" cy="216" rx="98" ry="7" fill="#365b3c" opacity=".65" />
        ${seed}
        <g class="roots" fill="none" stroke="#a8754d" stroke-width="${2 + Math.min(rootLevel * 0.25, 2)}" stroke-linecap="round">${roots}</g>
        ${stem}
        <g fill="${leafColor}" stroke="${leafHighlight}" stroke-width="1.5" stroke-linejoin="round">${leaves}</g>
    </svg>`;
}
