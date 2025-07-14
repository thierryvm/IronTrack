@echo off
echo Arrêt du serveur de développement sur le port 3000...

:: Trouve et tue le processus utilisant le port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Arrêt du processus %%a...
    taskkill /F /PID %%a 2>nul
)

:: Sauvegarde : tue les processus next.exe spécifiquement
taskkill /F /IM "next.exe" 2>nul

echo Serveur de développement arrêté.
timeout /t 2 /nobreak > nul
echo Prêt pour redémarrer le serveur sur le port 3000.