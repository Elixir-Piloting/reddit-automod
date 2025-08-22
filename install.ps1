# AutoModerator VSCode Extension Installation Script
Write-Host "Setting up AutoModerator VSCode Extension..." -ForegroundColor Green

# Install dependencies
Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
npm install

# Compile TypeScript
Write-Host "Compiling TypeScript..." -ForegroundColor Yellow
npm run compile

Write-Host "Installation complete!" -ForegroundColor Green
Write-Host "To test the extension:" -ForegroundColor Cyan
Write-Host "1. Press F5 in VSCode to launch the extension in debug mode" -ForegroundColor White
Write-Host "2. Create a new file with .automod extension" -ForegroundColor White
Write-Host "3. Start typing to see IntelliSense in action" -ForegroundColor White
Write-Host "4. Use Ctrl+Shift+P and search for 'Create AutoModerator Scaffold'" -ForegroundColor White 