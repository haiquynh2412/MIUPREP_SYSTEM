$pdfPath = "C:\Users\HAIQUYNH\OneDrive\SACH VIET\TOAN\toan 8\chuyen-de-phuong-trinh-nghiem-nguyen-boi-duong-hoc-sinh-gioi-toan-8.pdf"
$docxPath = "C:\Users\HAIQUYNH\OneDrive\SACH VIET\TOAN\toan 8\hSG\chuyen-de-phuong-trinh-nghiem-nguyen-boi-duong-hoc-sinh-gioi-toan-8.docx"

Write-Host "Starting Word COM Object..."
try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0
  
  Write-Host "Opening PDF: $pdfPath"
  $doc = $word.Documents.Open($pdfPath, $false, $true)
  
  Write-Host "Saving as DOCX: $docxPath"
  $doc.SaveAs($docxPath, 16) # wdFormatXMLDocument
  
  $doc.Close($false)
  Write-Host "Conversion completed successfully!"
} catch {
  Write-Error $_.Exception.Message
} finally {
  if ($word -ne $null) {
    $word.Quit()
  }
}
