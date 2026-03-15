@echo off
echo Killing all node processes...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul
echo Starting Backend...
start cmd /k "cd C:\Projects\CampusHive\Techfeasta\opportunex-bcknd && npm run dev"
timeout /t 3 /nobreak >nul
echo Starting Frontend...
start cmd /k "cd C:\Projects\CampusHive\Techfeasta\opportunex_frntd\opportune-x && npm run dev"
timeout /t 2 /nobreak >nul
echo Starting AI Engine...
start cmd /k "cd C:\Projects\CampusHive\Techfeasta\ai-engine && npm run dev"
echo All services started!
```