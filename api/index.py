from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/analyze")
async def analyze(symbol: str):
    # Место для реального анализа — пока просто мок
    return JSONResponse(content={
        "symbol": symbol,
        "signal": "Лонг",
        "entry": 84653.01,
        "stop": 82959.95,
        "take": 86346.07,
        "argument": "Обнаружена поддержка"
    })
