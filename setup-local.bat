@echo off
echo 本地開發環境設置
echo.

if "%1"=="" (
    echo 請提供你的 Google Places API 金鑰作為參數
    echo 使用方法: setup-local.bat YOUR_API_KEY_HERE
    echo.
    pause
    exit /b 1
)

set API_KEY=%1

echo 正在設置本地開發環境...
echo API 金鑰: %API_KEY:~0,8%********

REM 備份原始文件
copy utils\locationUtils.js utils\locationUtils.js.backup >nul 2>&1

REM 替換 API 金鑰
powershell -Command "(Get-Content utils/locationUtils.js) -replace '%%%%GOOGLE_PLACES_API_KEY%%%%', '%API_KEY%' | Set-Content utils/locationUtils.js"

if %ERRORLEVEL%==0 (
    echo ✅ 本地開發環境設置完成！
    echo.
    echo 現在可以在瀏覽器中打開 index.html 進行開發
    echo.
    echo 重要提醒:
    echo - 修改後的 utils/locationUtils.js 不要提交到 Git
    echo - 完成開發後可以運行 restore-placeholder.bat 恢復佔位符
) else (
    echo ❌ 設置失敗，請檢查 PowerShell 是否可用
)

echo.
pause