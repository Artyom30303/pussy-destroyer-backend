from fastapi import FastAPI, Query
from analyzer.core import analyze_symbol

app = FastAPI()

@app.get("/analyze")
def analyze(symbol: str = Query(..., example="BTC/USDT")):
    result = analyze_symbol(symbol)
    return result
