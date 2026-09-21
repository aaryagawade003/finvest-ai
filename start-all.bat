@echo off
echo ========================================================
echo        FinVest AI - Portfolio Intelligence Platform
echo ========================================================
echo.
echo Starting Python AI & Analytics Engine on http://localhost:8000 ...
start "FinVest AI Engine" cmd /k "cd backend-ai-service && python -m uvicorn app.main:app --reload --port 8000"

echo.
echo Starting React TypeScript Frontend on http://localhost:3000 ...
start "FinVest Web Dashboard" cmd /k "cd frontend && npm run dev"

echo.
echo All services launched!
echo Open your browser at: http://localhost:3000
echo API documentation at: http://localhost:8000/docs
echo.
pause
