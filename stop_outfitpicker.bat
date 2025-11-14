@echo off
echo Stopping OutfitPicker...
docker stop outfitpicker >nul 2>&1

echo Removing container...
docker rm outfitpicker >nul 2>&1

echo Done!
pause
