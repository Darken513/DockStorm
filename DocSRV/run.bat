@echo off
echo #-------------------------------------------------------#
echo.
rem Compile the TypeScript project and store the command's output in a variable
for /f "delims=" %%a in ('tsc -p .') do set result=%%a
rem Check if the TypeScript compilation failed
if errorlevel 1 (
    echo TypeScript compilation failed
    exit /b 1
)
echo Waiting for the compilation to finish
timeout /t 5
rem Copy a file in a directory
xcopy configuration dist\configuration\ /y /e
rem Running project
echo Starting DOCSRV
echo.
echo #-------------------------------------------------------#
node dist\index.js
