# PowerShell Production Readiness Test Script
Write-Host "🧪 Testing Slack Connect Production Readiness..." -ForegroundColor Cyan

$testsPassed = 0
$testsFailed = 0

function Test-Condition {
    param(
        [string]$TestName,
        [bool]$Condition,
        [string]$SuccessMessage = "✅ PASS",
        [string]$FailureMessage = "❌ FAIL"
    )
    
    Write-Host "Testing $TestName... " -NoNewline
    
    if ($Condition) {
        Write-Host $SuccessMessage -ForegroundColor Green
        $script:testsPassed++
    } else {
        Write-Host $FailureMessage -ForegroundColor Red
        $script:testsFailed++
    }
}

Write-Host "🔍 Running pre-deployment tests..." -ForegroundColor Yellow

# Test Node.js version
try {
    $nodeVersion = node -v
    $nodeVersionNumber = [version]($nodeVersion -replace 'v', '')
    Test-Condition "Node.js version (>=18)" ($nodeVersionNumber.Major -ge 18)
} catch {
    Test-Condition "Node.js version (>=18)" $false
}

# Test npm version
try {
    $npmVersion = npm -v
    $npmVersionNumber = [version]$npmVersion
    Test-Condition "npm version (>=8)" ($npmVersionNumber.Major -ge 8)
} catch {
    Test-Condition "npm version (>=8)" $false
}

# Test backend dependencies
try {
    Set-Location backend
    $null = npm list --depth=0 2>$null
    Test-Condition "Backend dependencies" ($LASTEXITCODE -eq 0)
    Set-Location ..
} catch {
    Test-Condition "Backend dependencies" $false
    Set-Location ..
}

# Test frontend dependencies
try {
    Set-Location frontend
    $null = npm list --depth=0 2>$null
    Test-Condition "Frontend dependencies" ($LASTEXITCODE -eq 0)
    Set-Location ..
} catch {
    Test-Condition "Frontend dependencies" $false
    Set-Location ..
}

# Test backend build
try {
    Set-Location backend
    $null = npm run build 2>$null
    Test-Condition "Backend TypeScript build" ($LASTEXITCODE -eq 0)
    Set-Location ..
} catch {
    Test-Condition "Backend TypeScript build" $false
    Set-Location ..
}

# Test frontend build
try {
    Set-Location frontend
    $null = npm run build 2>$null
    Test-Condition "Frontend build" ($LASTEXITCODE -eq 0)
    Set-Location ..
} catch {
    Test-Condition "Frontend build" $false
    Set-Location ..
}

# Test configuration files
Test-Condition "Backend .env.example exists" (Test-Path "backend\.env.example")
Test-Condition "Frontend .env.example exists" (Test-Path "frontend\.env.example")
Test-Condition "Render config exists" (Test-Path "render.yaml")
Test-Condition "README.md exists" (Test-Path "README.md")
Test-Condition "DEPLOYMENT.md exists" (Test-Path "DEPLOYMENT.md")

# Test build outputs
Test-Condition "Backend dist folder exists" (Test-Path "backend\dist")
Test-Condition "Frontend dist folder exists" (Test-Path "frontend\dist")

# Test package.json scripts
Test-Condition "Root package.json exists" (Test-Path "package.json")

Write-Host ""
Write-Host "📊 Test Results:" -ForegroundColor Cyan
Write-Host "✅ Passed: $testsPassed" -ForegroundColor Green
Write-Host "❌ Failed: $testsFailed" -ForegroundColor Red

if ($testsFailed -eq 0) {
    Write-Host ""
    Write-Host "🎉 All tests passed! Your application is ready for production deployment." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Commit and push your changes to GitHub"
    Write-Host "2. Follow the DEPLOYMENT.md guide"
    Write-Host "3. Deploy to Render"
} else {
    Write-Host ""
    Write-Host "❌ Some tests failed. Please fix the issues before deploying." -ForegroundColor Red
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "- Run 'npm install' in backend and frontend directories"
    Write-Host "- Check Node.js and npm versions"
    Write-Host "- Verify all environment files exist"
}

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = Read-Host
