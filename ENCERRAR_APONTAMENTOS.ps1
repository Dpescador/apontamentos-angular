$ErrorActionPreference = "SilentlyContinue"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path $projectRoot ".apontamentos-server.pid"
$shell = New-Object -ComObject WScript.Shell

if (-not (Test-Path $pidFile)) {
    [void]$shell.Popup("Nenhum servidor iniciado pelo atalho foi encontrado.", 0, "Apontamentos", 48)
    exit 0
}

$serverPid = Get-Content $pidFile | Select-Object -First 1
$process = Get-Process -Id $serverPid -ErrorAction SilentlyContinue
if ($process) {
    Stop-Process -Id $serverPid -Force
    Start-Sleep -Milliseconds 500
}
Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
[void]$shell.Popup("O servidor do sistema de apontamentos foi encerrado.", 0, "Apontamentos", 64)
