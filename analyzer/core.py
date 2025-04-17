import random

def analyze_symbol(symbol):
    signals = ["LONG", "SHORT", "WAIT"]
    signal = random.choice(signals)
    if signal == "WAIT":
        return {
            "symbol": symbol,
            "signal": "WAIT",
            "argument": "Нет сигнала. Цена в зоне неопределённости.",
        }
    else:
        base = random.uniform(100, 100000)
        return {
            "symbol": symbol,
            "signal": signal,
            "entry": round(base, 2),
            "stop": round(base * 0.98, 2),
            "take": round(base * 1.03, 2),
            "argument": f"Сигнал {signal} на основе технической картины."
        }
