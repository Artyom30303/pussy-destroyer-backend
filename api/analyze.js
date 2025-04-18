// api/analyze.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const { symbol } = req.query;
    if (!symbol) {
      return res.status(400).json({ error: 'No symbol provided' });
    }

    const binanceSymbol = symbol.replace("/", "");
    const url = `https://api.binance.com/api/v3/klines?symbol=${binanceSymbol}&interval=30m&limit=50`;

    const response = await fetch(url);
    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(500).json({ error: 'Invalid response from Binance' });
    }

    // Берём последнюю свечу
    const lastCandle = data[data.length - 1];
    const close = parseFloat(lastCandle[4]);

    // Пример анализа — просто отдаём фиктивный SHORT при любой цене
    const analysis = {
      symbol,
      signal: 'SHORT',
      entry: close + 10,
      stop: close + 100,
      take: close - 50,
      argument: 'Сопротивление на уровне ' + (close + 100).toFixed(2)
    };

    return res.status(200).json(analysis);
  } catch (err) {
    console.error('Ошибка сервера:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
