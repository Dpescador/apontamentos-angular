Option Explicit
Dim shell, fso, basePath, psScript, command
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
basePath = fso.GetParentFolderName(WScript.ScriptFullName)
psScript = fso.BuildPath(basePath, "ABRIR_APONTAMENTOS.ps1")
command = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File """ & psScript & """"
shell.Run command, 0, False
