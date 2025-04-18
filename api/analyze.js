// backend/api/analyze.js

import axios from "axios";

export default async function handler(req, res) {
    const { symbol } = req.query;

    if (!symbol) {
        return res.status(400).json({ error: "Missing symbol parameter" });
    }

    try {
        const response = await axios.get("https://api.binance.com/api/v3/klines", {
            params: {
                symbol: symbol.toUpperCase(),
                interval: "30m",
                limit: 100,
            },
        });

        const data = response.data;
        const closes = data.map((candle) => parseFloat(candle[4]));
        const highs = data.map((candle) => parseFloat(candle[2]));

        const lastClose = closes[closes.length - 1];
        const maxHigh = Math.max(...highs);

        let signal = "Нейтрально";
        let entry = lastClose;
        let stop = null;
        let take = null;
        let argument = "Недостаточно данных для чёткого сигнала";

        if (lastClose < maxHigh * 0.85) {
            signal = "Лонг";
            stop = (lastClose * 0.97).toFixed(2);
            take = (lastClose * 1.03).toFixed(2);
            argument = "Цена у поддержки, возможен отскок";
        } else if (lastClose > maxHigh * 0.95) {
            signal = "Шорт";
            stop = (lastClose * 1.03).toFixed(2);
            take = (lastClose * 0.97).toFixed(2);
            argument = "Сопротивление на уровне, возможен откат";
        }

        res.status(200).json({
            symbol,
            signal,
            entry: parseFloat(entry).toFixed(2),
            stop,
            take,
            argument,
        });
    } catch (error) {
        console.error("Analysis error:", error.message);
        res.status(500).json({ error: "Failed to analyze market data" });
    }
}
