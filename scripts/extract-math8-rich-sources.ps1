param(
  [string]$SourceRoot = "C:\Users\HAIQUYNH\OneDrive\SACH VIET\TOAN\toan 8\extracted_kntt",
  [string]$OutPath = "reports\content-quality\math8-rich-raw-extract.json",
  [string]$HtmlWorkDir = "reports\content-quality\math8-rich-html",
  [string]$AssetPublicRoot = "apps\miuprep-portal\public\assets\math8\formulas",
  [switch]$IncludePdf,
  [string]$FileListPath = "",
  [int]$Limit = 0
)

$ErrorActionPreference = "Continue"
$workspaceRoot = Split-Path -Parent $PSScriptRoot
$resolvedOutPath = if ([System.IO.Path]::IsPathRooted($OutPath)) { $OutPath } else { Join-Path $workspaceRoot $OutPath }
$resolvedHtmlWorkDir = if ([System.IO.Path]::IsPathRooted($HtmlWorkDir)) { $HtmlWorkDir } else { Join-Path $workspaceRoot $HtmlWorkDir }
$resolvedAssetPublicRoot = if ([System.IO.Path]::IsPathRooted($AssetPublicRoot)) { $AssetPublicRoot } else { Join-Path $workspaceRoot $AssetPublicRoot }
$extensions = @(".doc", ".docx", ".dot")
if ($IncludePdf) {
  $extensions += ".pdf"
}

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

function Get-RelativeSourcePath {
  param($File)

  $rootWithSeparator = $SourceRoot.TrimEnd("\", "/") + "\"
  if ($File.FullName.StartsWith($rootWithSeparator, [System.StringComparison]::OrdinalIgnoreCase)) {
    return $File.FullName.Substring($rootWithSeparator.Length).Replace("\", "/")
  }

  return $File.Name
}

function Get-Slug {
  param([string]$Value)

  $normalized = $Value.ToLowerInvariant() -replace '[^a-z0-9]+', '-'
  $normalized = $normalized.Trim('-')
  if (-not $normalized) {
    $normalized = "source"
  }

  $sha1 = [System.Security.Cryptography.SHA1]::Create()
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($Value)
  $hashBytes = $sha1.ComputeHash($bytes)
  $hash = -join ($hashBytes[0..3] | ForEach-Object { $_.ToString("x2") })
  return "$($normalized.Substring(0, [Math]::Min(52, $normalized.Length)))-$hash"
}

function Count-OleMarkers {
  param([string]$Text)
  return ([regex]::Matches([string]$Text, [regex]::Escape([string][char]1))).Count
}

function Export-InlineShapeAsset {
  param(
    $InlineShape,
    [int]$Index,
    [string]$AssetTargetDir,
    [string]$AssetPublicBase
  )

  $assetName = "formula{0:D4}.png" -f $Index
  $targetPath = Join-Path $AssetTargetDir $assetName
  $publicPath = ($AssetPublicBase.TrimEnd('/') + '/' + $assetName).Replace('\', '/')
  $width = ""
  $height = ""
  $copied = $false
  $method = ""

  try {
    $width = [string][Math]::Max(1, [int][Math]::Round([double]$InlineShape.Width * 96 / 72))
    $height = [string][Math]::Max(1, [int][Math]::Round([double]$InlineShape.Height * 96 / 72))
  } catch {
    $width = ""
    $height = ""
  }

  $emfPath = [System.IO.Path]::ChangeExtension($targetPath, ".emf")
  $metafile = $null
  try {
    $bits = $InlineShape.Range.EnhMetaFileBits
    if ($bits -ne $null) {
      [System.IO.File]::WriteAllBytes($emfPath, [byte[]]$bits)
      $metafile = [System.Drawing.Image]::FromFile($emfPath)
      $metafile.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
      $copied = $true
      $method = "emf_png"
    }
  } catch {
    $copied = $false
  } finally {
    if ($metafile -ne $null) {
      try {
        $metafile.Dispose()
      } catch {
      }
    }
    if (Test-Path -LiteralPath $emfPath) {
      try {
        Remove-Item -LiteralPath $emfPath -Force
      } catch {
      }
    }
  }

  if (-not $copied) {
    try {
      for ($attempt = 1; $attempt -le 4 -and -not $copied; $attempt += 1) {
        [System.Windows.Forms.Clipboard]::Clear()
        $InlineShape.Range.CopyAsPicture()
        Start-Sleep -Milliseconds (180 * $attempt)
        $image = [System.Windows.Forms.Clipboard]::GetImage()
        if ($image -ne $null) {
          $image.Save($targetPath, [System.Drawing.Imaging.ImageFormat]::Png)
          $image.Dispose()
          $copied = $true
          $method = "clipboard_png"
        }
      }
    } catch {
      $copied = $false
    }
  }

  $parts = New-Object System.Collections.Generic.List[string]
  $parts.Add("{{formula:$publicPath")
  if ($width) {
    $parts.Add("|w=$width")
  }
  if ($height) {
    $parts.Add("|h=$height")
  }
  $parts.Add("}}")

  return [ordered]@{
    token = (($parts.ToArray()) -join "")
    asset = [ordered]@{
      src = $publicPath
      width = $width
      height = $height
      fileName = $assetName
      copied = $copied
      source = "inlineShape:$Index"
      exportMethod = $method
    }
  }
}

function Convert-PlainTextMarkersToRichText {
  param(
    [string]$PlainText,
    $InlineShapes,
    [string]$AssetTargetDir,
    [string]$AssetPublicBase
  )

  New-Item -ItemType Directory -Force -Path $AssetTargetDir | Out-Null
  $assets = New-Object System.Collections.Generic.List[object]
  $builder = New-Object System.Text.StringBuilder
  $marker = [char]1
  $shapeIndex = 1
  $shapeCount = 0

  try {
    $shapeCount = [int]$InlineShapes.Count
  } catch {
    $shapeCount = 0
  }

  for ($i = 0; $i -lt $PlainText.Length; $i += 1) {
    $char = $PlainText[$i]
    if ($char -eq $marker) {
      if ($shapeIndex -le $shapeCount) {
        $export = Export-InlineShapeAsset -InlineShape $InlineShapes.Item($shapeIndex) -Index $shapeIndex -AssetTargetDir $AssetTargetDir -AssetPublicBase $AssetPublicBase
        $assets.Add($export.asset)
        [void]$builder.Append(" ")
        [void]$builder.Append($export.token)
        [void]$builder.Append(" ")
        $shapeIndex += 1
      }
    } else {
      [void]$builder.Append($char)
    }
  }

  return [ordered]@{
    text = $builder.ToString()
    assets = $assets
    inlineShapeCount = $shapeCount
    exportedInlineShapes = $assets.Count
  }
}

function Write-ExtractPayload {
  param($Sources)

  $payload = [ordered]@{
    schemaVersion = "math8_rich_raw_extract_v1"
    generatedAt = (Get-Date).ToUniversalTime().ToString("o")
    sourceRoot = $SourceRoot
    assetPublicRoot = "/assets/math8/formulas"
    sources = $Sources
  }

  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $resolvedOutPath) | Out-Null
  $json = $payload | ConvertTo-Json -Depth 8
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($resolvedOutPath, $json + [Environment]::NewLine, $utf8NoBom)
}

if ($FileListPath) {
  $resolvedFileListPath = if ([System.IO.Path]::IsPathRooted($FileListPath)) { $FileListPath } else { Join-Path $workspaceRoot $FileListPath }
  $files = @(
    Get-Content -LiteralPath $resolvedFileListPath -Encoding UTF8 |
      Where-Object { $_ -and -not $_.Trim().StartsWith("#") } |
      ForEach-Object {
        $relativePath = $_.Trim().Replace("/", "\")
        $candidatePath = if ([System.IO.Path]::IsPathRooted($relativePath)) { $relativePath } else { Join-Path $SourceRoot $relativePath }
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

New-Item -ItemType Directory -Force -Path $resolvedHtmlWorkDir | Out-Null
New-Item -ItemType Directory -Force -Path $resolvedAssetPublicRoot | Out-Null

$sources = New-Object System.Collections.Generic.List[object]
$word = $null

try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0

  foreach ($file in $files) {
    $relativePath = Get-RelativeSourcePath -File $file
    $sourceSlug = Get-Slug -Value $relativePath
    $assetTargetDir = Join-Path $resolvedAssetPublicRoot $sourceSlug
    $assetPublicBase = "/assets/math8/formulas/$sourceSlug"
    Write-Host "Extracting rich $relativePath"
    $doc = $null

    try {
      $doc = $word.Documents.Open($file.FullName, $false, $true, $false)
      $plainText = [string]$doc.Content.Text
      $rich = Convert-PlainTextMarkersToRichText -PlainText $plainText -InlineShapes $doc.InlineShapes -AssetTargetDir $assetTargetDir -AssetPublicBase $assetPublicBase
      $sources.Add([ordered]@{
        fileName = $file.Name
        relativePath = $relativePath
        path = $file.FullName
        extension = $file.Extension.ToLowerInvariant().TrimStart(".")
        text = [string]$rich.text
        richExtraction = $true
        richExtractionMethod = "inline_shape_png"
        assetBasePath = $assetPublicBase
        formulaAssetCount = $rich.assets.Count
        formulaAssets = $rich.assets
        inlineShapeCount = $rich.inlineShapeCount
        exportedInlineShapes = $rich.exportedInlineShapes
        rawOleMarkerCount = Count-OleMarkers -Text $plainText
      })
    } catch {
      $sources.Add([ordered]@{
        fileName = $file.Name
        relativePath = $relativePath
        path = $file.FullName
        extension = $file.Extension.ToLowerInvariant().TrimStart(".")
        text = ""
        richExtraction = $false
        formulaAssetCount = 0
        rawOleMarkerCount = 0
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
Write-Host "Wrote $($sources.Count) rich extracted sources to $resolvedOutPath"
