from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from analyzer.core import analyze_symbol

app = FastAPI()

# Добавляем middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешаем все домены (можно указать конкретные)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/analyze")
def analyze(symbol: str = Query(..., example="BTC/USDT")):
    result = analyze_symbol(symbol)
    return result
