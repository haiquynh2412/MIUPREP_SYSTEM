$unrar = "C:\Program Files\WinRAR\UnRAR.exe"
$toan7 = "C:\Users\HAIQUYNH\OneDrive\SACH VIET\TOAN\toan 7"

Write-Host "Extracting RAR files in $toan7..."
Get-ChildItem -Path $toan7 -Filter *.rar | ForEach-Object {
    Write-Host "Extracting archive: $($_.Name)"
    # Extract to the same directory
    & $unrar x -o+ $_.FullName $toan7 | Out-Null
}
Write-Host "Extraction complete."
