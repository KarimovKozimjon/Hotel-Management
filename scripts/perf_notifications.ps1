param(
  [int]$Count = 6,
  [string]$Token = ''
)

if (-not $Token) {
  $tokenFile = "c:\Users\kozim\Hotel-Management-System\storage\app\perf_token.txt"
  if (Test-Path $tokenFile) {
    $Token = (Get-Content -Raw -Path $tokenFile).Trim()
  }
}

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

function Measure-Url {
  param(
    [string]$Label,
    [string]$Url,
    [int]$N
  )

  1..$N | ForEach-Object {
    $i = $_
    $commonArgs = @('-s', '-o', 'NUL', '-w', 'http:%{http_code} total:%{time_total} ttfb:%{time_starttransfer}`n')
    if ($Token) {
      $commonArgs += @('-H', "Authorization: Bearer $Token")
    }
    $out = & curl.exe @commonArgs $Url
    Write-Output ("$Label#$i $out")
    Start-Sleep -Milliseconds 200
  }
}

Set-Location "c:\Users\kozim\Hotel-Management-System"

Measure-Url -Label 'backend' -Url 'http://127.0.0.1:8000/api/notifications' -N $Count
Measure-Url -Label 'proxy' -Url 'http://localhost:3000/api/notifications' -N $Count
