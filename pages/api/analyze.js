import fetch from 'node-fetch';

export default async function handler(req, res) {
  // 💥 разрешаем запросы с любых доменов
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { symbol = "BTCUSDT" } = req.query;

  try {
    const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=100`);
    const raw = await response.json();

    if (!Array.isArray(raw) || raw.length === 0) {
      return res.status(400).json({ error: "Empty or invalid data from Binance" });
    }

    const candles = raw.map(c => ({
      openTime: c[0],
      open: parseFloat(c[1]),
      high: parseFloat(c[2]),
      low: parseFloat(c[3]),
      close: parseFloat(c[4]),
      volume: parseFloat(c[5])
    }));

    const closes = candles.map(c => c.close);
    const lastClose = closes[closes.length - 1];
    const prevClose = closes[closes.length - 2];

    // RSI (период 14)
    const rsi = calculateRSI(closes, 14);
    const lastRSI = rsi[rsi.length - 1];

    // EMA (период 21)
    const ema21 = calculateEMA(closes, 21);
    const lastEMA = ema21[ema21.length - 1];

    // BOS/CHoCH: Пробой хая/лоя последних свечей
    const bos = lastClose > Math.max(...closes.slice(-6, -1));
    const choch = lastClose < Math.min(...closes.slice(-6, -1));

    let direction = "NONE";
    let argument = [];

    if (lastClose > lastEMA) {
      argument.push("Цена выше EMA — бычий контекст");
    } else {
      argument.push("Цена ниже EMA — медвежий контекст");
    }

    if (lastRSI < 30) {
      argument.push("RSI в зоне перепроданности");
    } else if (lastRSI > 70) {
      argument.push("RSI в зоне перекупленности");
    } else {
      argument.push(`RSI нейтральный: ${lastRSI.toFixed(2)}`);
    }

    if (bos) {
      direction = "LONG";
      argument.push("Break of Structure вверх");
    } else if (choch) {
      direction = "SHORT";
      argument.push("Change of Character вниз");
    }

    if (direction === "NONE") {
      return res.status(200).json({
        symbol,
        direction,
        confidence: 0,
        reason: ["Нет чёткого сигнала — боковик"],
      });
    }

    const entry = lastClose;
    const sl = direction === "LONG"
      ? +(entry * 0.985).toFixed(2)
      : +(entry * 1.015).toFixed(2);
    const tp1 = direction === "LONG"
      ? +(entry * 1.015).toFixed(2)
      : +(entry * 0.985).toFixed(2);
    const tp2 = direction === "LONG"
      ? +(entry * 1.03).toFixed(2)
      : +(entry * 0.97).toFixed(2);

    const confidence =
      (direction === "LONG" && lastRSI < 40 && lastClose > lastEMA) ||
      (direction === "SHORT" && lastRSI > 60 && lastClose < lastEMA)
        ? 85
        : 65;

    res.status(200).json({
      symbol,
      direction,
      confidence,
      entry,
      sl,
      tp1,
      tp2,
      reason: argument,
    });
  } catch (err) {
    res.status(500).json({ error: "Ошибка анализа", details: err.message });
  }
}

// RSI функция
function calculateRSI(closes, period = 14) {
  let gains = [], losses = [];

  for (let i = 1; i <= period; i++) {
    let diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains.push(diff);
    else losses.push(Math.abs(diff));
  }

  let avgGain = gains.reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.reduce((a, b) => a + b, 0) / period;

  let rsis = [];
  for (let i = period; i < closes.length; i++) {
    let change = closes[i] - closes[i - 1];
    let gain = change > 0 ? change : 0;
    let loss = change < 0 ? -change : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    let rs = avgGain / (avgLoss || 1);
    rsis.push(100 - 100 / (1 + rs));
  }

  return rsis;
}

// EMA функция
function calculateEMA(closes, period = 21) {
  const k = 2 / (period + 1);
  let emaArray = [closes.slice(0, period).reduce((a, b) => a + b, 0) / period];

  for (let i = period; i < closes.length; i++) {
    const price = closes[i];
    const prevEma = emaArray[emaArray.length - 1];
    const ema = price * k + prevEma * (1 - k);
    emaArray.push(ema);
  }

  return emaArray;
}
