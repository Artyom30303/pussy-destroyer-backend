import requests

def analyze_symbol(symbol):
    try:
        symbol_pair = symbol.replace("/", "").upper()
        url = f"https://api.binance.com/api/v3/ticker/price?symbol={symbol_pair}"
        response = requests.get(url)
        price_data = response.json()

        # Обработка ошибок Binance API
        if "price" not in price_data:
            return {
                "symbol": symbol,
                "signal": "ERROR",
                "argument": price_data.get("msg", "Недопустимый символ или ошибка API.")
            }

        current_price = float(price_data["price"])

        # Пример простой логики
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
                "entry": round(current_price, 4),
                "stop": round(current_price * 0.98, 4),
                "take": round(current_price * 1.03, 4),
                "argument": argument
            }

    except Exception as e:
        return {
            "symbol": symbol,
            "signal": "ERROR",
            "argument": f"Ошибка анализа: {str(e)}"
        }
