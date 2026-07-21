@echo off
setlocal
cd /d "%~dp0"

echo ==============================================
echo  Criar atalho do Dashboard de Apontamentos
echo ==============================================
echo.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0CRIAR_ATALHO_AREA_DE_TRABALHO.ps1"

if errorlevel 1 (
  echo.
  echo ERRO: Nao foi possivel criar o atalho.
  pause
  exit /b 1
)

echo.
echo Atalho criado com sucesso na Area de Trabalho.
echo Agora voce pode fechar esta janela.
pause
