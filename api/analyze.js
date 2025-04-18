// /api/analyze.js

import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: 'symbol required' });
  }

  try {
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=30m&limit=100`;
    const response = await fetch(url);
    const data = await response.json();

    if (!Array.isArray(data)) {
      return res.status(500).json({ error: 'Invalid data from Binance' });
    }

    const closes = data.map(c => parseFloat(c[4]));

    const maxClose = Math.max(...closes);
    const minClose = Math.min(...closes);
    const lastClose = closes[closes.length - 1];

    let signal = "Нейтрально";
    let argument = "Цена в боковике";
    if (lastClose >= maxClose * 0.98) {
      signal = "SHORT";
      argument = `Сопротивление на уровне ${maxClose.toFixed(2)}`;
    } else if (lastClose <= minClose * 1.02) {
      signal = "LONG";
      argument = `Поддержка на уровне ${minClose.toFixed(2)}`;
    }

    const entry = lastClose.toFixed(2);
    const stop = (signal === "SHORT")
      ? (lastClose * 1.03).toFixed(2)
      : (lastClose * 0.97).toFixed(2);
    const take = (signal === "SHORT")
      ? (lastClose * 0.95).toFixed(2)
      : (lastClose * 1.05).toFixed(2);

    res.status(200).json({
      symbol,
      signal,
      entry: parseFloat(entry),
      stop: parseFloat(stop),
      take: parseFloat(take),
      argument
    });
  } catch (error) {
    console.error('Ошибка анализа:', error);
    res.status(500).json({ error: 'Ошибка при анализе' });
  }
}
