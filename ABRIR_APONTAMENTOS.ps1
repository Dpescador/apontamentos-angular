$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$appUrl = "http://localhost:4200"
$cliPath = Join-Path $projectRoot "node_modules\@angular\cli\bin\ng.js"
$buildPackage = Join-Path $projectRoot "node_modules\@angular\build\package.json"
$pidFile = Join-Path $projectRoot ".apontamentos-server.pid"
$logDirectory = Join-Path $projectRoot "logs"
$stdoutLog = Join-Path $logDirectory "atalho-servidor.log"
$stderrLog = Join-Path $logDirectory "atalho-servidor-erros.log"

function Show-Message([string]$message, [string]$title = "Apontamentos") {
    $shell = New-Object -ComObject WScript.Shell
    [void]$shell.Popup($message, 0, $title, 64)
}

function Test-ApontamentosServer {
    try {
        $response = Invoke-WebRequest -Uri $appUrl -UseBasicParsing -TimeoutSec 2
        return ($response.StatusCode -eq 200 -and $response.Content -match "Apontamentos de Atividades")
    }
    catch {
        return $false
    }
}

try {
    if (Test-ApontamentosServer) {
        Start-Process $appUrl
        exit 0
    }

    $nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
    if (-not $nodeCommand) {
        Show-Message "Node.js nao foi encontrado. Instale o Node.js LTS antes de abrir o sistema." "Node.js necessario"
        exit 1
    }

    if (-not (Test-Path $cliPath) -or -not (Test-Path $buildPackage)) {
        $installer = Join-Path $projectRoot "INICIAR_APLICACAO.bat"
        Show-Message "As dependencias ainda nao estao instaladas. O instalador sera aberto agora. Na primeira execucao, aguarde a instalacao terminar." "Primeira execucao"
        Start-Process -FilePath $installer -WorkingDirectory $projectRoot
        exit 0
    }

    New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null

    if (Test-Path $pidFile) {
        $oldPid = (Get-Content $pidFile -ErrorAction SilentlyContinue | Select-Object -First 1)
        if ($oldPid -and (Get-Process -Id $oldPid -ErrorAction SilentlyContinue)) {
            # Existe um processo anterior; aguarda brevemente antes de iniciar outro.
            for ($attempt = 0; $attempt -lt 10; $attempt++) {
                if (Test-ApontamentosServer) {
                    Start-Process $appUrl
                    exit 0
                }
                Start-Sleep -Seconds 1
            }
        }
    }

    $arguments = @(
        $cliPath,
        "serve",
        "--host", "127.0.0.1",
        "--port", "4200"
    )

    $serverProcess = Start-Process `
        -FilePath $nodeCommand.Source `
        -ArgumentList $arguments `
        -WorkingDirectory $projectRoot `
        -WindowStyle Hidden `
        -RedirectStandardOutput $stdoutLog `
        -RedirectStandardError $stderrLog `
        -PassThru

    Set-Content -Path $pidFile -Value $serverProcess.Id -Encoding ASCII

    for ($attempt = 0; $attempt -lt 90; $attempt++) {
        if (Test-ApontamentosServer) {
            Start-Process $appUrl
            exit 0
        }

        if ($serverProcess.HasExited) {
            break
        }

        Start-Sleep -Seconds 1
        $serverProcess.Refresh()
    }

    Show-Message "Nao foi possivel iniciar o sistema. Consulte os arquivos da pasta logs ou execute INICIAR_APLICACAO.bat para ver o erro completo." "Falha ao iniciar"
    exit 1
}
catch {
    Show-Message ("Erro ao abrir o sistema: " + $_.Exception.Message) "Falha ao iniciar"
    exit 1
}
