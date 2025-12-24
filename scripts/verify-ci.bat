@echo off
REM FlareBoard CI Verification Script (Windows)
REM Run this before pushing to verify all CI checks will pass

echo.
echo ============================================
echo    FlareBoard CI Verification
echo ============================================
echo.

set FAILED=0

echo [1/4] Running Lint...
call npm run lint
if errorlevel 1 (
    echo [FAILED] Lint check failed
    set FAILED=1
) else (
    echo [PASSED] Lint check passed
)
echo.

echo [2/4] Running Format Check...
call npm run format -- --check
if errorlevel 1 (
    echo [FAILED] Format check failed
    set FAILED=1
) else (
    echo [PASSED] Format check passed
)
echo.

echo [3/4] Running Type Check...
call npm run type-check
if errorlevel 1 (
    echo [FAILED] Type check failed
    set FAILED=1
) else (
    echo [PASSED] Type check passed
)
echo.

echo [4/4] Running Tests...
call npm run test:run
if errorlevel 1 (
    echo [FAILED] Tests failed
    set FAILED=1
) else (
    echo [PASSED] Tests passed
)
echo.

echo ============================================
if %FAILED%==0 (
    echo [SUCCESS] All CI checks passed!
    echo You're ready to push your changes.
    exit /b 0
) else (
    echo [ERROR] Some CI checks failed
    echo Please fix the issues before pushing.
    exit /b 1
)
