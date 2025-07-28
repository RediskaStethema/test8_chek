const fs = require("fs/promises");
const path = require("path");
const DATA_PATH = require("./constants").DATA_PATH;
let cachedStats = null;
let lastRead = 0;


function mean(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

async function readData() {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
}

async function writeData(data) {
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}


fs.watch(DATA_PATH, (eventType, filename) => {
    if (filename && eventType === 'change') {
        console.log(`[fs.watch] Файл ${filename} изменён — очищаем кеш статистики`);
        cachedStats = null;
        lastRead = 0;
    }
})

async function getStats() {
    const now = Date.now();

    if (cachedStats && (now - lastRead < 10_000)) {
        console.log(`[getStats] Возвращаем кешированные данные (возраст кеша: ${(now - lastRead) / 1000}s)`);
        return cachedStats;
    }

    console.log('[getStats] Читаем данные заново и пересчитываем статистику');
    const items = await readData();
    cachedStats = {
        total: items.length,
        averagePrice: mean(items.map(i => i.price)),
    };
    lastRead = now;

    return cachedStats;
}


module.exports = {mean, readData, writeData, getStats};