Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot

python (Join-Path $PSScriptRoot "build_data.py")
python (Join-Path $PSScriptRoot "build_single_file.py")

Write-Host ""
Write-Host "완료:"
Write-Host " - 앱 데이터 갱신: $repoRoot\\app\\data.js"
Write-Host " - 단일 HTML 생성: $repoRoot\\dist\\thai-pocketbook-mobile.html"
