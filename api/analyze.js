// /api/analyze.js

import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: 'symbol required' });
  }

  try {
    const cleanSymbol = symbol.replace("/", "").toUpperCase();
    const url = `https://api.binance.com/api/v3/klines?symbol=${cleanSymbol}&interval=30m&limit=100`;

    const response = await fetch(url);
    const data = await response.json();

    if (!Array.isArray(data) || data.length < 30) {
      return res.status(500).json({ error: 'Invalid or insufficient data from Binance' });
    }

    const closes = data.map(c => parseFloat(c[4]));
    const volumes = data.map(c => parseFloat(c[5]));
    const lastClose = closes[closes.length - 1];
    const recentVolume = volumes.slice(-5).reduce((a, b) => a + b, 0);
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;

    const maxClose = Math.max(...closes);
    const minClose = Math.min(...closes);

    let signal = "WAIT";
    let argument = "Рынок не определён. Лучше подождать.";
    
    if (lastClose >= maxClose * 0.985) {
      signal = "SHORT";
      argument = `Цена у верхней границы диапазона (${maxClose.toFixed(2)}). Возможен отскок вниз.`;
    } else if (lastClose <= minClose * 1.015) {
      signal = "LONG";
      argument = `Цена у поддержки (${minClose.toFixed(2)}). Возможен отскок вверх.`;
    } else if (recentVolume > avgVolume * 1.5) {
      signal = "PULSE";
      argument = "Резкий всплеск объема — возможно начало импульсного движения.";
    }

    const entry = lastClose.toFixed(2);
    const stop = (signal === "SHORT")
      ? (lastClose * 1.025).toFixed(2)
      : (lastClose * 0.975).toFixed(2);
    const take = (signal === "SHORT")
      ? (lastClose * 0.95).toFixed(2)
      : (lastClose * 1.05).toFixed(2);

    return res.status(200).json({
      symbol: cleanSymbol,
      signal,
      entry: parseFloat(entry),
      stop: parseFloat(stop),
      take: parseFloat(take),
      argument
    });

  } catch (error) {
    console.error('Ошибка анализа:', error);
    res.status(500).json({ error: 'Ошибка при анализе данных.' });
  }
}
