from fastapi import FastAPI

app = FastAPI(
    title="backend",
    version="1.0"
)

@app.get("/")
def root():
    return {"message":"backend running"}