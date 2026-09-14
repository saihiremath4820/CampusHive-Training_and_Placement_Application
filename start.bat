@echo off
echo ========================================
echo       Starting CampusHive
echo ========================================

echo Killing all node processes...
taskkill /F /IM node.exe /T 2>nul

timeout /t 2 /nobreak >nul

echo.
echo Starting Backend...
start "CampusHive Backend" cmd /k "cd /d D:\CampusHive-Training_and_Placement_Application\opportunex-bcknd && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend...
start "CampusHive Frontend" cmd /k "cd /d D:\CampusHive-Training_and_Placement_Application\opportunex_frntd\opportune-x && npm run dev"

timeout /t 2 /nobreak >nul

echo.
echo Starting AI Engine...
start "CampusHive AI Engine" cmd /k "cd /d D:\CampusHive-Training_and_Placement_Application\ai-engine && npm run dev"

echo.
echo ========================================
echo       All services started!
echo ========================================
pause