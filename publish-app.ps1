Write-Host "Publishing Solana Maker Bot to Expo..." -ForegroundColor Green
Write-Host ""
Write-Host "This will create a shareable link that you and your collaborators can access." -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to continue or Ctrl+C to cancel." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

npx expo publish --non-interactive

Write-Host ""
Write-Host "If successful, your app is now available at:" -ForegroundColor Green
Write-Host "https://expo.dev/@solanamakerbot/solana-maker-bot" -ForegroundColor Cyan
Write-Host ""
Write-Host "Share this link with your collaborators." -ForegroundColor Green
Write-Host ""
pause