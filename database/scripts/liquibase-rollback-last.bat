@echo off
setlocal
cd /d "%~dp0\..\.."

echo ================================================================
echo  ROLLBACK AUTOMATICO DESABILITADO
echo ================================================================
echo.
echo O changelog consolidado reconcilia bancos novos e existentes e pode
echo preservar dados criados manualmente. Por seguranca, ele e forward-only.
echo.
echo Antes de desfazer uma alteracao estrutural, crie um backup no Supabase
echo e escreva um changeset corretivo em vez de remover tabelas ou perfis.
echo.
pause
exit /b 1
