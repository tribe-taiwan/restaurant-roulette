@echo off
echo 恢復 API 金鑰佔位符
echo.

if exist utils\locationUtils.js.backup (
    copy utils\locationUtils.js.backup utils\locationUtils.js >nul
    del utils\locationUtils.js.backup >nul
    echo ✅ 已恢復 API 金鑰佔位符
    echo 現在 utils/locationUtils.js 可以安全提交到 Git
) else (
    REM 手動恢復佔位符
    powershell -Command "(Get-Content utils/locationUtils.js) -replace 'API_KEY: ''[^'']*''', 'API_KEY: ''%%%%GOOGLE_PLACES_API_KEY%%%%''' | Set-Content utils/locationUtils.js"
    echo ✅ 已恢復 API 金鑰佔位符 (手動模式)
)

echo.
pause