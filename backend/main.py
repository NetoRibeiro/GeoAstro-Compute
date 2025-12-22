
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI(title="GeoAstro Compute API", version="1.1.012")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AstroInput(BaseModel):
    city: str
    state: str
    country: str
    date: str
    time: str
    temperature: Optional[str] = None
    useHistoricalTemperature: bool = False



@app.post("/analyze")
def analyze_astro(data: AstroInput):
    try:
        from backend.astro_service import calculate_astronomy
        result = calculate_astronomy(data.city, data.country, data.date, data.time, data.state)
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"ERROR processing analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class SolarReturnInput(BaseModel):
    birth_date: str
    birth_time: str
    target_year: int
    city: str
    country: str
    state: Optional[str] = None

@app.post("/solar-return")
def solar_return(data: SolarReturnInput):
    from backend.astro_service import calculate_solar_return
    try:
        result = calculate_solar_return(data.birth_date, data.birth_time, data.target_year, data.city, data.country, data.state)
        return {"solar_return": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class PerfectAlignmentInput(BaseModel):
    birth_date: str
    birth_time: str
    birth_city: str
    birth_country: str
    birth_state: Optional[str] = None
    solar_return: str

@app.post("/perfect-alignment")
def perfect_alignment(data: PerfectAlignmentInput):
    from backend.astro_service import calculate_perfect_alignment
    try:
        result = calculate_perfect_alignment(
            data.birth_date,
            data.birth_time,
            data.birth_city,
            data.birth_country,
            data.birth_state,
            data.solar_return
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ArroyoInput(BaseModel):
    birth_date: str
    birth_time: str
    city: str
    country: str
    state: Optional[str] = None

@app.post("/arroyo-analysis")
def arroyo_analysis(data: ArroyoInput):
    from backend.astro_service import calculate_arroyo_analysis
    try:
        result = calculate_arroyo_analysis(data.birth_date, data.birth_time, data.city, data.country, data.state)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
def health_check():
    return {"message": "GeoAstro Compute API is running"}

@app.get("/")
def read_root():
    if os.path.exists("dist/index.html"):
        return FileResponse("dist/index.html")
    return {"message": "GeoAstro Compute API is running (Frontend not built)"}

# Mount static assets
if os.path.exists("dist/assets"):
    app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")

@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    if full_path.startswith("api"):
        raise HTTPException(status_code=404, detail="Not Found")
    
    file_path = os.path.join("dist", full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    if os.path.exists("dist/index.html"):
        return FileResponse("dist/index.html")
    return HTTPException(status_code=404, detail="Not Found")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
