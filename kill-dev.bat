@echo off
echo Arrêt de tous les serveurs de développement...
powershell -Command "Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force"
echo Processus Node.js arrêtés.
timeout /t 2 /nobreak > nul
echo Prêt pour redémarrer le serveur sur le port 3000.