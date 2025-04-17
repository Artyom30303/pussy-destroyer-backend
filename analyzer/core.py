import ccxt
import pandas as pd
import numpy as np

def analyze_symbol(symbol="BTC/USDT", timeframe="1h", limit=300):
    exchange = ccxt.binance()
    ohlcv = exchange.fetch_ohlcv(symbol, timeframe, limit=limit)

    df = pd.DataFrame(ohlcv, columns=['timestamp','open','high','low','close','volume'])
    df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
    df.set_index('timestamp', inplace=True)

    def detect_choc(df):
        last = df.iloc[-2:]
        if last['high'].iloc[0] < last['high'].iloc[1] and last['low'].iloc[0] < last['low'].iloc[1]:
            return "CHoCH вверх"
        elif last['high'].iloc[0] > last['high'].iloc[1] and last['low'].iloc[0] > last['low'].iloc[1]:
            return "CHoCH вниз"
        return ""

    def detect_bos(df):
        highs = df['high'].rolling(window=5).max()
        lows = df['low'].rolling(window=5).min()
        bos_up = df['close'].iloc[-1] > highs.iloc[-5]
        bos_down = df['close'].iloc[-1] < lows.iloc[-5]
        return "BOS вверх" if bos_up else "BOS вниз" if bos_down else ""

    def detect_sweep(df):
        lookback = 30
        prev_lows = df['low'].iloc[-lookback:-2]
        prev_highs = df['high'].iloc[-lookback:-2]
        last_low = df['low'].iloc[-1]
        last_high = df['high'].iloc[-1]

        if last_low < prev_lows.min():
            return "Снятие ликвидности внизу"
        elif last_high > prev_highs.max():
            return "Снятие ликвидности наверху"
        return ""

    arguments = []
    signal = None

    bos = detect_bos(df)
    if bos: arguments.append(bos)

    choc = detect_choc(df)
    if choc: arguments.append(choc)

    sweep = detect_sweep(df)
    if sweep: arguments.append(sweep)

    if "BOS вверх" in arguments or "CHoCH вверх" in arguments:
        signal = "Лонг"
    elif "BOS вниз" in arguments or "CHoCH вниз" in arguments:
        signal = "Шорт"
    else:
        signal = "Ожидание"

    return {
        "symbol": symbol,
        "timeframe": timeframe,
        "signal": signal,
        "arguments": arguments,
        "confidence": 0.85,
        "status": "ожидается ТВХ" if signal != "Ожидание" else "наблюдение"
    }
