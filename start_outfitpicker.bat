@echo off
echo Stopping old container...
docker stop outfitpicker >nul 2>&1

echo Removing old container...
docker rm outfitpicker >nul 2>&1

echo Pulling latest OutfitPicker image...
docker pull bjarkebek/outfitpicker:latest

echo Starting OutfitPicker...
docker run -d --name outfitpicker -p 3000:3000 --env-file .env.local bjarkebek/outfitpicker:latest

echo Opening browser...
start http://localhost:3000

echo Done!
pause
