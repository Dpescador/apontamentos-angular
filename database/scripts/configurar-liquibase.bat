@echo off
setlocal
cd /d "%~dp0\..\.."

if exist "database\liquibase.properties" (
  echo O arquivo database\liquibase.properties ja existe.
  echo Nenhuma alteracao foi realizada.
  pause
  exit /b 0
)

copy /Y "database\liquibase.properties.template" "database\liquibase.properties" >nul
if errorlevel 1 (
  echo ERRO: nao foi possivel criar database\liquibase.properties.
  pause
  exit /b 1
)

echo Arquivo database\liquibase.properties criado.
echo Abra o arquivo e informe host, usuario e senha do PostgreSQL do Supabase.
pause
