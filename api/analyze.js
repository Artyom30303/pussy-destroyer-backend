// api/analyze.js

import fetch from 'node-fetch';

export default async function handler(req, res) {
    const { symbol } = req.query;

    if (!symbol) {
        return res.status(400).json({ error: "symbol is required" });
    }

    try {
        const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=30m&limit=100`);
        const data = await response.json();

        const closes = data.map(d => parseFloat(d[4]));

        const currentPrice = closes[closes.length - 1];
        const previous = closes[closes.length - 2];

        let signal, argument;
        let entry = currentPrice;
        let stop, take;

        if (currentPrice > previous) {
            signal = "Лонг";
            stop = +(entry * 0.98).toFixed(2);
            take = +(entry * 1.02).toFixed(2);
            argument = "Восходящий импульс";
        } else {
            signal = "Шорт";
            stop = +(entry * 1.02).toFixed(2);
            take = +(entry * 0.98).toFixed(2);
            argument = "Нисходящее давление";
        }

        res.status(200).json({
            symbol,
            signal,
            entry,
            stop,
            take,
            argument
        });
    } catch (e) {
        res.status(500).json({ error: "Ошибка при анализе", details: e.message });
    }
}
