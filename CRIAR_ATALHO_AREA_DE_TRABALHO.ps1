$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$launcher = Join-Path $projectRoot "ABRIR_APONTAMENTOS.vbs"
$icon = Join-Path $projectRoot "apontamentos.ico"

if (-not (Test-Path $launcher)) {
    throw "O arquivo ABRIR_APONTAMENTOS.vbs nao foi encontrado."
}

$shell = New-Object -ComObject WScript.Shell
$desktop = $shell.SpecialFolders.Item("Desktop")
$shortcutPath = Join-Path $desktop "Apontamentos.lnk"
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = Join-Path $env:WINDIR "System32\wscript.exe"
$shortcut.Arguments = '"' + $launcher + '"'
$shortcut.WorkingDirectory = $projectRoot
$shortcut.Description = "Abrir o Dashboard de Apontamentos"
if (Test-Path $icon) {
    $shortcut.IconLocation = $icon + ",0"
}
$shortcut.Save()

[void]$shell.Popup("Atalho criado com sucesso na Area de Trabalho.\n\nUse o icone Apontamentos para abrir o sistema.", 0, "Atalho criado", 64)
