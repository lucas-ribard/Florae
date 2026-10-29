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

export function createPlantSvg(plant, upgrades) {
    const random = createRandom(plant.visualSeed);
    const level = getLevel(plant.level);
    const rootLevel = getLevel(upgrades.roots);
    const leafLevel = getLevel(upgrades.leaf);
    const vitalityLevel = getLevel(upgrades.vitality);
    const top = clamp(112 - Math.max(0, level - 1) * 7, 48, 112);
    const stemWidth = clamp(5 + vitalityLevel * 0.8 + Math.max(0, level - 1) * 0.25, 5, 13);
    const hue = Math.round(112 + random() * 34);
    const leafColor = `hsl(${hue} 48% 43%)`;
    const leafHighlight = `hsl(${hue} 54% 58%)`;
    const stemColor = `hsl(${Math.max(85, hue - 20)} 42% 34%)`;
    const stemBend = Math.round((random() - 0.5) * 28);
    const rootCount = 3 + Math.min(rootLevel, 7) * 2;
    const leafPairCount = 1 + Math.min(leafLevel, 6) + Math.min(Math.floor(Math.max(0, level - 1) / 2), 3);
    const stem = `M 180 211 C ${174 + stemBend} 174, ${188 - stemBend} 137, ${180 + stemBend} ${top}`;
    const roots = Array.from({ length: rootCount }, (_, index) => {
        const side = index % 2 === 0 ? -1 : 1;
        const rank = Math.floor(index / 2) + 1;
        const endX = 180 + side * (13 + rank * 12 + random() * 8);
        const endY = 218 + rank * 5 + random() * 9;
        const controlX = 180 + side * (rank * 5 + random() * 10);
        return `<path d="M 180 207 C ${controlX} 222, ${endX - side * 4} ${endY - 5}, ${endX} ${endY}" />`;
    }).join("");
    const leaves = Array.from({ length: leafPairCount }, (_, index) => {
        const progress = (index + 0.8) / (leafPairCount + 0.3);
        const y = Math.round(196 - progress * (196 - top));
        const stemX = Math.round(180 + stemBend * (1 - (y - top) / (211 - top)));
        const side = index % 2 === 0 ? -1 : 1;
        const size = Math.round(24 + random() * 10 + Math.min(leafLevel, 5));
        const rise = 12 + random() * 10;
        const tipX = Math.round(stemX + side * size);
        const tipY = Math.round(y - rise);
        const controlX = Math.round(stemX + side * size * 0.55);
        const controlY = Math.round(y - rise * 0.35);

        return `<g><path d="M ${stemX} ${y} C ${controlX} ${controlY - 11}, ${tipX + side * 5} ${tipY - 7}, ${tipX} ${tipY} C ${tipX - side * 4} ${tipY + 10}, ${stemX + side * 5} ${y + 5}, ${stemX} ${y} Z" /><path class="vein" d="M ${stemX} ${y} Q ${stemX + side * size * 0.45} ${y - rise * 0.35}, ${tipX} ${tipY}" /></g>`;
    }).join("");
    const flowerPetalCount = 4 + Math.min(vitalityLevel, 4) * 2;
    const flower = vitalityLevel > 0
        ? Array.from({ length: flowerPetalCount }, (_, index) => {
            const angle = (index / flowerPetalCount) * Math.PI * 2;
            const x = Math.round(180 + stemBend + Math.cos(angle) * 9);
            const y = Math.round(top - 3 + Math.sin(angle) * 9);
            return `<ellipse cx="${x}" cy="${y}" rx="5" ry="9" fill="hsl(${Math.round(20 + random() * 35)} 82% 68%)" transform="rotate(${Math.round(angle * 180 / Math.PI)} ${x} ${y})" />`;
        }).join("") + `<circle cx="${180 + stemBend}" cy="${top - 3}" r="5" fill="#f3c969" />`
        : "";

    return `<svg class="plant-svg" viewBox="0 0 360 280" role="img" aria-label="Your growing plant">
        <ellipse cx="180" cy="216" rx="98" ry="7" fill="#365b3c" opacity=".65" />
        <g class="roots" fill="none" stroke="#a8754d" stroke-width="${2 + Math.min(rootLevel * 0.25, 2)}" stroke-linecap="round">${roots}</g>
        <path d="${stem}" fill="none" stroke="${stemColor}" stroke-width="${stemWidth}" stroke-linecap="round" />
        <g fill="${leafColor}" stroke="${leafHighlight}" stroke-width="1.5" stroke-linejoin="round">${leaves}</g>
        <g>${flower}</g>
    </svg>`;
}
