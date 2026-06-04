param(
  [string]$SourceRoot = "C:\Users\HAIQUYNH\OneDrive\SACH VIET\TOAN\TAI LIEU TOAN 6",
  [string]$OutPath = "reports\content-quality\math6-raw-extract.json",
  [switch]$IncludePdf,
  [string]$FileListPath = "",
  [int]$Limit = 0
)

$ErrorActionPreference = "Continue"
$workspaceRoot = Split-Path -Parent $PSScriptRoot
$resolvedOutPath = if ([System.IO.Path]::IsPathRooted($OutPath)) { $OutPath } else { Join-Path $workspaceRoot $OutPath }
$extensions = @(".doc", ".docx", ".dot")
if ($IncludePdf) {
  $extensions += ".pdf"
}

function Get-RelativeSourcePath {
  param($File)

  $rootWithSeparator = $SourceRoot.TrimEnd("\", "/") + "\"
  if ($File.FullName.StartsWith($rootWithSeparator, [System.StringComparison]::OrdinalIgnoreCase)) {
    return $File.FullName.Substring($rootWithSeparator.Length).Replace("\", "/")
  }

  return $File.Name
}

function Write-ExtractPayload {
  param($Sources)

  $payload = [ordered]@{
    schemaVersion = "math6_raw_extract_v1"
    generatedAt = (Get-Date).ToUniversalTime().ToString("o")
    sourceRoot = $SourceRoot
    sources = $Sources
  }

  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $resolvedOutPath) | Out-Null
  $json = $payload | ConvertTo-Json -Depth 6
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($resolvedOutPath, $json + [Environment]::NewLine, $utf8NoBom)
}

if ($FileListPath) {
  $resolvedFileListPath = if ([System.IO.Path]::IsPathRooted($FileListPath)) { $FileListPath } else { Join-Path $workspaceRoot $FileListPath }
  $files = @(
    Get-Content -LiteralPath $resolvedFileListPath |
      Where-Object { $_ -and -not $_.Trim().StartsWith("#") } |
      ForEach-Object {
        $relativePath = $_.Trim().Replace("/", "\")
        $candidatePath = Join-Path $SourceRoot $relativePath
        if (Test-Path -LiteralPath $candidatePath) {
          Get-Item -LiteralPath $candidatePath
        } else {
          Write-Warning "Source file not found: $relativePath"
        }
      }
  ) | Where-Object { $_ -and ($extensions -contains $_.Extension.ToLowerInvariant()) } | Sort-Object FullName
} else {
  $files = Get-ChildItem -LiteralPath $SourceRoot -Recurse -File |
    Where-Object { $extensions -contains $_.Extension.ToLowerInvariant() } |
    Sort-Object FullName
}

if ($Limit -gt 0) {
  $files = @($files | Select-Object -First $Limit)
}

$sources = New-Object System.Collections.Generic.List[object]
$word = $null

try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0

  foreach ($file in $files) {
    $relativePath = Get-RelativeSourcePath -File $file
    Write-Host "Extracting $relativePath"
    $doc = $null

    try {
      $doc = $word.Documents.Open($file.FullName, $false, $true, $false)
      $text = [string]$doc.Content.Text
      $sources.Add([ordered]@{
        fileName = $file.Name
        relativePath = $relativePath
        path = $file.FullName
        extension = $file.Extension.ToLowerInvariant().TrimStart(".")
        text = $text
      })
    } catch {
      $sources.Add([ordered]@{
        fileName = $file.Name
        relativePath = $relativePath
        path = $file.FullName
        extension = $file.Extension.ToLowerInvariant().TrimStart(".")
        text = ""
        error = $_.Exception.Message
      })
    } finally {
      if ($doc -ne $null) {
        try {
          $doc.Close($false) | Out-Null
        } catch {
        }
      }
      Write-ExtractPayload -Sources $sources
    }
  }
} finally {
  if ($word -ne $null) {
    try {
      $word.Quit() | Out-Null
    } catch {
    }
  }
}

Write-ExtractPayload -Sources $sources
Write-Host "Wrote $($sources.Count) extracted sources to $resolvedOutPath"
