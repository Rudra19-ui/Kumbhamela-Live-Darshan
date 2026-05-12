# Build a release APK for KumbhConnect (Expo / React Native).
# Prerequisites: Android SDK (Android Studio), JDK 17+, Expo prebuild already run (mobile/android exists).
# Output: ..\releases\KumbhConnect-1.0.0-release.apk
#
# Usage (from repo root):
#   powershell -ExecutionPolicy Bypass -File .\scripts\build-android-apk.ps1

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$mobile = Join-Path $repoRoot "mobile"
$android = Join-Path $mobile "android"

if (-not (Test-Path (Join-Path $android "gradlew.bat"))) {
  Write-Error "mobile/android not found. Run from repo root: cd mobile ; npx expo prebuild --platform android"
}

# Prefer Eclipse Temurin JDK 17 (adjust if your install path differs)
$candidates = @(
  "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot",
  "C:\Program Files\Eclipse Adoptium\jdk-17.0.17-hotspot",
  $env:JAVA_HOME
) | Where-Object { $_ -and (Test-Path $_) }
if ($candidates.Count -eq 0) {
  Write-Error "JDK 17+ not found. Install Temurin 17 or set JAVA_HOME to your JDK."
}
$env:JAVA_HOME = $candidates[0]
Write-Host "Using JAVA_HOME=$($env:JAVA_HOME)"

$sdk = Join-Path $env:LOCALAPPDATA "Android\Sdk"
if (-not (Test-Path $sdk)) {
  Write-Error "Android SDK not found at $sdk. Install Android Studio / SDK first."
}
$propsPath = Join-Path $android "local.properties"
$sdkUnix = $sdk -replace "\\", "/"
@"
sdk.dir=$sdkUnix
"@ | Set-Content -Path $propsPath -Encoding UTF8
Write-Host "Wrote $propsPath"

Push-Location $android
try {
  .\gradlew.bat --stop 2>$null
  .\gradlew.bat assembleRelease
} finally {
  Pop-Location
}

$apk = Join-Path $android "app\build\outputs\apk\release\app-release.apk"
if (-not (Test-Path $apk)) {
  Write-Error "APK not found at $apk"
}

$outDir = Join-Path $repoRoot "releases"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$dest = Join-Path $outDir "KumbhConnect-1.0.0-release.apk"
Copy-Item -Force $apk $dest
Write-Host ""
Write-Host "Done. Installable APK:"
Write-Host "  $dest"
Get-Item $dest | Format-List FullName, Length, LastWriteTime
