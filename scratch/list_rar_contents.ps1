$unrar = "C:\Program Files\WinRAR\UnRAR.exe"
$toan7 = "C:\Users\HAIQUYNH\OneDrive\SACH VIET\TOAN\toan 7"
$toan8 = "C:\Users\HAIQUYNH\OneDrive\SACH VIET\TOAN\toan 8"

Write-Host "--- TOAN 7 RAR FILES ---"
Get-ChildItem -Path $toan7 -Filter *.rar | ForEach-Object {
    Write-Host "`nArchive: $($_.Name)"
    & $unrar l $_.FullName | Select-String -Pattern "\.docx|\.pdf|\.doc" | ForEach-Object {
        Write-Host "  $($_.Line)"
    }
}

Write-Host "`n--- TOAN 8 RAR FILES ---"
Get-ChildItem -Path $toan8 -Filter *.rar | ForEach-Object {
    Write-Host "`nArchive: $($_.Name)"
    & $unrar l $_.FullName | Select-String -Pattern "\.docx|\.pdf|\.doc" | ForEach-Object {
        Write-Host "  $($_.Line)"
    }
}
