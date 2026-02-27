# Quick AI Engine Test Script
# Run this to verify AI Engine is working

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "   AI ENGINE QUICK TEST" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

Write-Host "`n1. Testing Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri http://localhost:5001/ -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ AI Engine is running!" -ForegroundColor Green
    Write-Host "   Response: $($health.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ AI Engine is not running!" -ForegroundColor Red
    Write-Host "   Start it with: cd c:\Projects\Techfeasta\ai-engine; npm start" -ForegroundColor Yellow
    exit
}

Write-Host "`n2. Testing Skill Matching..." -ForegroundColor Yellow
$testBody = @{
    student = @{
        skills = @("Python", "Machine Learning", "SQL", "Git")
    }
    project = @{
        requiredSkills = @("Python", "Machine Learning", "TensorFlow", "Docker")
    }
} | ConvertTo-Json -Depth 3

try {
    $skillResponse = Invoke-WebRequest `
        -Uri "http://localhost:5001/match-skills" `
        -Method POST `
        -Body $testBody `
        -ContentType "application/json" `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "✅ Skill Matching works!" -ForegroundColor Green
    Write-Host "`nResult:" -ForegroundColor Cyan
    $result = $skillResponse.Content | ConvertFrom-Json
    Write-Host "  Match Score: $($result.matchScore)%" -ForegroundColor White
    Write-Host "  Matched Skills: $($result.matchedSkills -join ', ')" -ForegroundColor Green
    Write-Host "  Missing Skills: $($result.missingSkills -join ', ')" -ForegroundColor Red
    
} catch {
    Write-Host "❌ Skill Matching failed!" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Yellow
}

Write-Host "`n3. Testing Resume Analysis (if you have a resume)..." -ForegroundColor Yellow
Write-Host "   To test resume analysis, upload a resume to:" -ForegroundColor Gray
Write-Host "   c:\Projects\Techfeasta\opportunex-bcknd\uploads\" -ForegroundColor Gray
Write-Host "   Then run:" -ForegroundColor Gray
Write-Host '   $body = @{ filePath = "c:/path/to/resume.pdf"; role = "ml" } | ConvertTo-Json' -ForegroundColor Gray
Write-Host '   Invoke-WebRequest -Uri "http://localhost:5001/analyze-resume" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing' -ForegroundColor Gray

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "   TEST COMPLETE!" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

Write-Host "`nCurrent Running Services:" -ForegroundColor Yellow
Write-Host "  ✅ Backend:  http://localhost:5000" -ForegroundColor Green
Write-Host "  ✅ Frontend: http://localhost:5173" -ForegroundColor Green
Write-Host "  ✅ AI Engine: http://localhost:5001" -ForegroundColor Green

Write-Host "`nFor more tests, see: AI_ENGINE_TESTING_GUIDE.md" -ForegroundColor Cyan
