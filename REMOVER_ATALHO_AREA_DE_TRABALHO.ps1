$ErrorActionPreference = "Stop"
$shell = New-Object -ComObject WScript.Shell
$desktop = $shell.SpecialFolders.Item("Desktop")
$shortcutPath = Join-Path $desktop "Apontamentos.lnk"

if (Test-Path $shortcutPath) {
    Remove-Item $shortcutPath -Force
    [void]$shell.Popup("O atalho Apontamentos foi removido da Area de Trabalho.", 0, "Atalho removido", 64)
}
else {
    [void]$shell.Popup("O atalho Apontamentos nao foi encontrado na Area de Trabalho.", 0, "Atalho nao encontrado", 48)
}
