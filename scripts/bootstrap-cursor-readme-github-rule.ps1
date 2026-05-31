# Sao chép rule Cursor "README + GitHub" sang các dự án khác (cùng máy).
# Usage: .\scripts\bootstrap-cursor-readme-github-rule.ps1 -Target "D:\path\to\other-project"

param(
  [Parameter(Mandatory = $true)]
  [string]$Target
)

# Ưu tiên rule toàn cục (áp dụng mọi dự án); fallback rule trong repo này.
$Source = Join-Path $env:USERPROFILE ".cursor\rules\sync-readme-and-github.mdc"
if (-not (Test-Path $Source)) {
  $RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
  $Source = Join-Path $RepoRoot ".cursor\rules\sync-readme-github.mdc"
}

$DestDir = Join-Path $Target ".cursor\rules"
$DestFile = Join-Path $DestDir "sync-readme-github.mdc"

if (-not (Test-Path $Source)) {
  Write-Error "Không tìm thấy file rule nguồn."
  exit 1
}

New-Item -ItemType Directory -Force -Path $DestDir | Out-Null
Copy-Item -Path $Source -Destination $DestFile -Force
Write-Host "Đã copy rule -> $DestFile"
