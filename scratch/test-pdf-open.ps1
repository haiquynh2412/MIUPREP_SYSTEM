$file = "C:\Users\HAIQUYNH\OneDrive\SACH VIET\TOAN\toan 10\DS_C1_So gan dung va Sai so.pdf"
Write-Host "File exists: $(Test-Path $file)"

try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0
  
  Write-Host "Opening file..."
  $startTime = Get-Date
  $doc = $word.Documents.OpenNoRepairDialog($file, $false, $true, $false)
  $endTime = Get-Date
  Write-Host "Opened in $(($endTime - $startTime).TotalSeconds) seconds."
  
  $textLength = $doc.Content.Text.Length
  $shapeCount = $doc.InlineShapes.Count
  Write-Host "Text length: $textLength"
  Write-Host "Inline shapes: $shapeCount"
  
  $doc.Close($false)
} catch {
  Write-Host "Error occurred: $_"
} finally {
  if ($word -ne $null) {
    $word.Quit()
  }
}
