# core.py

def analyze_symbol(symbol):
    try:
        supported_symbols = {
            "BTCUSDT": {
                "signal": "LONG",
                "entry": 84653.01,
                "stop": 82959.95,
                "take": 86346.07,
                "argument": "Обнаружена поддержка"
            },
            "ETHUSDT": {
                "signal": "SHORT",
                "entry": 2893.52,
                "stop": 3020.45,
                "take": 2750.36,
                "argument": "Сопротивление на уровне 3000"
            },
            "BNBUSDT": {
                "signal": "LONG",
                "entry": 582.10,
                "stop": 565.00,
                "take": 605.00,
                "argument": "Формируется восходящий клин"
            },
            "TONUSDT": {
                "signal": "SHORT",
                "entry": 2.98,
                "stop": 3.15,
                "take": 2.65,
                "argument": "Сигнал SHORT на основе технической картины"
            },
            "XRPUSDT": {
                "signal": "NEUTRAL",
                "entry": 0.512,
                "stop": 0.490,
                "take": 0.545,
                "argument": "Цена в боковике, без ярко выраженного тренда"
            }
        }

        normalized_symbol = symbol.replace("/", "").upper()
        if normalized_symbol not in supported_symbols:
            return {
                "signal": "Ошибка",
                "entry": "-",
                "stop": "-",
                "take": "-",
                "argument": "Символ не поддерживается или отсутствует в анализе"
            }

        return {
            "symbol": symbol,
            **supported_symbols[normalized_symbol]
        }

    except Exception as e:
        return {
            "signal": "Ошибка",
            "entry": "-",
            "stop": "-",
            "take": "-",
            "argument": f"Ошибка анализа: {str(e)}"
        }
