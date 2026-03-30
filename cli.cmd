@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
bun "%SCRIPT_DIR%dist\cli.js" %*
