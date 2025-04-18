import requests

def analyze_symbol(symbol):
    try:
        symbol_pair = symbol.replace("/", "").upper()
        url = f"https://api.binance.com/api/v3/ticker/price?symbol={symbol_pair}"
        response = requests.get(url)
        price_data = response.json()

        if "price" not in price_data:
            return {
                "symbol": symbol,
                "signal": "WAIT",
                "argument": "Нет данных по монете."
            }

        current_price = float(price_data["price"])

        # Простая логика анализа
        if current_price > 80000:
            signal = "SHORT"
            argument = "Цена на пике — возможна коррекция."
        elif current_price < 30000:
            signal = "LONG"
            argument = "Цена низкая — возможен отскок вверх."
        else:
            signal = "WAIT"
            argument = "Цена в середине диапазона — лучше подождать."

        if signal == "WAIT":
            return {
                "symbol": symbol,
                "signal": signal,
                "argument": argument
            }
        else:
            return {
                "symbol": symbol,
                "signal": signal,
                "entry": round(current_price, 2),
                "stop": round(current_price * 0.98, 2),
                "take": round(current_price * 1.03, 2),
                "argument": argument
            }

    except Exception as e:
        return {
            "symbol": symbol,
            "signal": "ERROR",
            "argument": f"Ошибка анализа: {str(e)}"
        }
