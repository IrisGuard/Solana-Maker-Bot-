@echo off
echo Publishing Solana Maker Bot to Expo...
echo.
echo This will create a shareable link that you and your collaborators can access.
echo.
echo Press any key to continue or Ctrl+C to cancel.
pause > nul
npx expo publish --non-interactive
echo.
echo If successful, your app is now available at:
echo https://expo.dev/@solanamakerbot/solana-maker-bot
echo.
echo Share this link with your collaborators.
echo.
pause