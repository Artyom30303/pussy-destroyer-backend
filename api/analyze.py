from fastapi import FastAPI
from analyzer.core import analyze_symbol

app = FastAPI()

@app.get("/analyze")
def analyze(symbol: str = "BTC/USDT"):
    result = analyze_symbol(symbol=symbol)
    return result
