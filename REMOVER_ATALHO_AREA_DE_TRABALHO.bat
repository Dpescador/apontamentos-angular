@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0REMOVER_ATALHO_AREA_DE_TRABALHO.ps1"
