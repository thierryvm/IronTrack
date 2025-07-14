@echo off
echo Arrêt du serveur de développement...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    if not "%%a"=="" (
        echo Arrêt du processus %%a sur le port 3000
        taskkill /F /PID %%a 2>nul
    )
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do (
    if not "%%a"=="" (
        echo Arrêt du processus %%a sur le port 3001
        taskkill /F /PID %%a 2>nul
    )
)
echo Serveur de développement arrêté
exit /b 0
