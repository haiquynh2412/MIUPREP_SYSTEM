param(
  [string]$SourceRoot = "C:\Users\HAIQUYNH\OneDrive\SACH VIET\TOAN\TOAN 9",
  [string]$OutPath = "reports\content-quality\math9-native-docx-raw-extract.json",
  [string]$AssetPublicRoot = "apps\miuprep-portal\public\assets\math9\formulas",
  [string]$FileListPath = "",
  [int]$Limit = 0
)

$ErrorActionPreference = "Stop"
$workspaceRoot = Split-Path -Parent $PSScriptRoot
$resolvedOutPath = if ([System.IO.Path]::IsPathRooted($OutPath)) { $OutPath } else { Join-Path $workspaceRoot $OutPath }
$resolvedAssetPublicRoot = if ([System.IO.Path]::IsPathRooted($AssetPublicRoot)) { $AssetPublicRoot } else { Join-Path $workspaceRoot $AssetPublicRoot }

Add-Type -AssemblyName System.IO.Compression.FileSystem
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

function Get-EntryText {
  param($Zip, [string]$EntryName)

  $entry = $Zip.GetEntry($EntryName)
  if ($null -eq $entry) {
    throw "Missing DOCX entry: $EntryName"
  }

  $stream = $entry.Open()
  try {
    $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
    try {
      return $reader.ReadToEnd()
    } finally {
      $reader.Dispose()
    }
  } finally {
    $stream.Dispose()
  }
}

function Get-RelationshipMap {
  param([xml]$RelsXml)

  $map = @{}
  foreach ($relationship in $RelsXml.Relationships.Relationship) {
    $id = [string]$relationship.Id
    $target = [string]$relationship.Target
    $type = [string]$relationship.Type
    if (-not $id -or -not $target) {
      continue
    }
    $map[$id] = [ordered]@{
      target = (Join-Path "word" $target).Replace("\", "/")
      type = $type
    }
  }
  return $map
}

function Get-AttributeValueByLocalName {
  param($Node, [string[]]$LocalNames)

  if ($null -eq $Node -or $null -eq $Node.Attributes) {
    return ""
  }

  foreach ($attribute in $Node.Attributes) {
    if ($LocalNames -contains $attribute.LocalName) {
      return [string]$attribute.Value
    }
  }
  return ""
}

function Find-DescendantByLocalName {
  param($Node, [string[]]$LocalNames)

  if ($null -eq $Node) {
    return $null
  }

  foreach ($child in $Node.ChildNodes) {
    if ($LocalNames -contains $child.LocalName) {
      return $child
    }
    $match = Find-DescendantByLocalName -Node $child -LocalNames $LocalNames
    if ($null -ne $match) {
      return $match
    }
  }
  return $null
}

function Get-RelationshipIdFromMediaNode {
  param($Node)

  $media = Find-DescendantByLocalName -Node $Node -LocalNames @("imagedata", "blip")
  if ($null -eq $media) {
    return ""
  }

  return Get-AttributeValueByLocalName -Node $media -LocalNames @("id", "embed", "link")
}

function Get-ImageSizeFromNode {
  param($Node)

  $width = ""
  $height = ""
  $shape = Find-DescendantByLocalName -Node $Node -LocalNames @("shape")
  if ($null -ne $shape) {
    $style = Get-AttributeValueByLocalName -Node $shape -LocalNames @("style")
    $widthMatch = [regex]::Match($style, "width:([0-9.]+)pt")
    $heightMatch = [regex]::Match($style, "height:([0-9.]+)pt")
    if ($widthMatch.Success) {
      $width = [string][Math]::Max(1, [int][Math]::Round([double]$widthMatch.Groups[1].Value * 96 / 72))
    }
    if ($heightMatch.Success) {
      $height = [string][Math]::Max(1, [int][Math]::Round([double]$heightMatch.Groups[1].Value * 96 / 72))
    }
  }

  if (-not $width -or -not $height) {
    $extent = Find-DescendantByLocalName -Node $Node -LocalNames @("extent")
    if ($null -ne $extent) {
      $cx = Get-AttributeValueByLocalName -Node $extent -LocalNames @("cx")
      $cy = Get-AttributeValueByLocalName -Node $extent -LocalNames @("cy")
      if ($cx) {
        $width = [string][Math]::Max(1, [int][Math]::Round([double]$cx * 96 / 914400))
      }
      if ($cy) {
        $height = [string][Math]::Max(1, [int][Math]::Round([double]$cy * 96 / 914400))
      }
    }
  }

  return [ordered]@{
    width = $width
    height = $height
  }
}

function Copy-EntryToFile {
  param($Zip, [string]$EntryName, [string]$TargetPath)

  $entry = $Zip.GetEntry($EntryName)
  if ($null -eq $entry) {
    return $false
  }

  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $TargetPath) | Out-Null
  $inputStream = $entry.Open()
  try {
    $outputStream = [System.IO.File]::Create($TargetPath)
    try {
      $inputStream.CopyTo($outputStream)
    } finally {
      $outputStream.Dispose()
    }
  } finally {
    $inputStream.Dispose()
  }
  return $true
}

function Convert-ImageToPng {
  param([string]$SourcePath, [string]$TargetPath)

  $image = $null
  try {
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $TargetPath) | Out-Null
    $image = [System.Drawing.Image]::FromFile($SourcePath)
    $image.Save($TargetPath, [System.Drawing.Imaging.ImageFormat]::Png)
    return $true
  } catch {
    return $false
  } finally {
    if ($null -ne $image) {
      $image.Dispose()
    }
  }
}

function Export-MediaToken {
  param(
    $Zip,
    $RelationshipMap,
    [string]$RelationshipId,
    $Node,
    [int]$Index,
    [string]$AssetTargetDir,
    [string]$AssetPublicBase,
    $Assets
  )

  if (-not $RelationshipId -or -not $RelationshipMap.ContainsKey($RelationshipId)) {
    return ""
  }

  $rel = $RelationshipMap[$RelationshipId]
  if ([string]$rel.type -notmatch "/image$") {
    return ""
  }

  $entryName = [string]$rel.target
  $extension = [System.IO.Path]::GetExtension($entryName).ToLowerInvariant()
  $assetName = "formula{0:D4}.png" -f $Index
  $targetPath = Join-Path $AssetTargetDir $assetName
  $publicPath = ($AssetPublicBase.TrimEnd("/") + "/" + $assetName).Replace("\", "/")
  $copied = $false
  $method = ""
  $tempPath = ""

  if ($extension -in @(".png", ".jpg", ".jpeg", ".gif", ".webp")) {
    $copied = Copy-EntryToFile -Zip $Zip -EntryName $entryName -TargetPath $targetPath
    $method = "copy_$($extension.TrimStart('.'))"
  } else {
    $tempPath = Join-Path ([System.IO.Path]::GetTempPath()) ("miumath_docx_media_{0}_{1}{2}" -f ([System.Guid]::NewGuid().ToString("N")), $Index, $extension)
    $sourceCopied = Copy-EntryToFile -Zip $Zip -EntryName $entryName -TargetPath $tempPath
    if ($sourceCopied) {
      $copied = Convert-ImageToPng -SourcePath $tempPath -TargetPath $targetPath
      $method = if ($copied) { "native_${extension}_png" } else { "native_${extension}_failed" }
    }
    if ($tempPath -and (Test-Path -LiteralPath $tempPath)) {
      Remove-Item -LiteralPath $tempPath -Force -ErrorAction SilentlyContinue
    }
  }

  $size = Get-ImageSizeFromNode -Node $Node
  $parts = New-Object System.Collections.Generic.List[string]
  $parts.Add("{{formula:$publicPath")
  if ($size.width) {
    $parts.Add("|w=$($size.width)")
  }
  if ($size.height) {
    $parts.Add("|h=$($size.height)")
  }
  $parts.Add("}}")

  $Assets.Add([ordered]@{
    src = $publicPath
    width = $size.width
    height = $size.height
    fileName = $assetName
    copied = $copied
    source = $entryName
    relationshipId = $RelationshipId
    exportMethod = $method
  })

  return (($parts.ToArray()) -join "")
}

function Convert-DocumentNodeToText {
  param(
    $Node,
    $Zip,
    $RelationshipMap,
    [string]$AssetTargetDir,
    [string]$AssetPublicBase,
    $Assets,
    [ref]$AssetIndex,
    [ref]$MarkerCount
  )

  $builder = New-Object System.Text.StringBuilder

  function Walk {
    param($Current)

    if ($null -eq $Current) {
      return
    }

    if ($Current.NodeType -eq [System.Xml.XmlNodeType]::Text) {
      [void]$builder.Append($Current.Value)
      return
    }

    switch ($Current.LocalName) {
      "t" {
        [void]$builder.Append($Current.InnerText)
        return
      }
      "tab" {
        [void]$builder.Append("`t")
        return
      }
      "br" {
        [void]$builder.Append("`n")
        return
      }
      "cr" {
        [void]$builder.Append("`n")
        return
      }
      "object" {
        $relationshipId = Get-RelationshipIdFromMediaNode -Node $Current
        $MarkerCount.Value += 1
        $token = Export-MediaToken -Zip $Zip -RelationshipMap $RelationshipMap -RelationshipId $relationshipId -Node $Current -Index $AssetIndex.Value -AssetTargetDir $AssetTargetDir -AssetPublicBase $AssetPublicBase -Assets $Assets
        if ($token) {
          [void]$builder.Append(" ")
          [void]$builder.Append($token)
          [void]$builder.Append(" ")
          $AssetIndex.Value += 1
        }
        return
      }
      "drawing" {
        $relationshipId = Get-RelationshipIdFromMediaNode -Node $Current
        $MarkerCount.Value += 1
        $token = Export-MediaToken -Zip $Zip -RelationshipMap $RelationshipMap -RelationshipId $relationshipId -Node $Current -Index $AssetIndex.Value -AssetTargetDir $AssetTargetDir -AssetPublicBase $AssetPublicBase -Assets $Assets
        if ($token) {
          [void]$builder.Append(" ")
          [void]$builder.Append($token)
          [void]$builder.Append(" ")
          $AssetIndex.Value += 1
        }
        return
      }
      "p" {
        foreach ($child in $Current.ChildNodes) {
          Walk -Current $child
        }
        [void]$builder.Append("`n")
        return
      }
      default {
        foreach ($child in $Current.ChildNodes) {
          Walk -Current $child
        }
      }
    }
  }

  Walk -Current $Node
  return $builder.ToString()
}

function Write-ExtractPayload {
  param($Sources)

  $payload = [ordered]@{
    schemaVersion = "math9_native_docx_raw_extract_v1"
    generatedAt = (Get-Date).ToUniversalTime().ToString("o")
    sourceRoot = $SourceRoot
    assetPublicRoot = "/assets/math9/formulas"
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
  ) | Where-Object { $_ -and $_.Extension.ToLowerInvariant() -eq ".docx" } | Sort-Object FullName
} else {
  $files = Get-ChildItem -LiteralPath $SourceRoot -Recurse -File |
    Where-Object { $_.Extension.ToLowerInvariant() -eq ".docx" } |
    Sort-Object FullName
}

if ($Limit -gt 0) {
  $files = @($files | Select-Object -First $Limit)
}

New-Item -ItemType Directory -Force -Path $resolvedAssetPublicRoot | Out-Null
$sources = New-Object System.Collections.Generic.List[object]

foreach ($file in $files) {
  $relativePath = Get-RelativeSourcePath -File $file
  $sourceSlug = Get-Slug -Value $relativePath
  $assetTargetDir = Join-Path $resolvedAssetPublicRoot $sourceSlug
  $assetPublicBase = "/assets/math9/formulas/$sourceSlug"
  Write-Host "Extracting native DOCX $relativePath"
  $zip = $null

  try {
    $zip = [System.IO.Compression.ZipFile]::OpenRead($file.FullName)
    [xml]$documentXml = Get-EntryText -Zip $zip -EntryName "word/document.xml"
    [xml]$relsXml = Get-EntryText -Zip $zip -EntryName "word/_rels/document.xml.rels"
    $relationshipMap = Get-RelationshipMap -RelsXml $relsXml
    $assets = New-Object System.Collections.Generic.List[object]
    $assetIndex = 1
    $markerCount = 0
    $text = Convert-DocumentNodeToText -Node $documentXml.documentElement -Zip $zip -RelationshipMap $relationshipMap -AssetTargetDir $assetTargetDir -AssetPublicBase $assetPublicBase -Assets $assets -AssetIndex ([ref]$assetIndex) -MarkerCount ([ref]$markerCount)

    $sources.Add([ordered]@{
      fileName = $file.Name
      relativePath = $relativePath
      path = $file.FullName
      extension = $file.Extension.ToLowerInvariant().TrimStart(".")
      text = [string]$text
      richExtraction = $true
      richExtractionMethod = "docx_native_media_png"
      assetBasePath = $assetPublicBase
      formulaAssetCount = $assets.Count
      formulaAssets = $assets
      inlineShapeCount = $markerCount
      exportedInlineShapes = $assets.Count
      nativeMediaMarkerCount = $markerCount
      unresolvedDrawingCount = [Math]::Max(0, $markerCount - $assets.Count)
      rawOleMarkerCount = $assets.Count
    })
  } catch {
    $sources.Add([ordered]@{
      fileName = $file.Name
      relativePath = $relativePath
      path = $file.FullName
      extension = $file.Extension.ToLowerInvariant().TrimStart(".")
      text = ""
      richExtraction = $false
      richExtractionMethod = "docx_native_media_png"
      formulaAssetCount = 0
      rawOleMarkerCount = 0
      error = $_.Exception.Message
    })
  } finally {
    if ($null -ne $zip) {
      $zip.Dispose()
    }
    Write-ExtractPayload -Sources $sources
  }
}

Write-ExtractPayload -Sources $sources
Write-Host "Wrote $($sources.Count) native DOCX extracted sources to $resolvedOutPath"
