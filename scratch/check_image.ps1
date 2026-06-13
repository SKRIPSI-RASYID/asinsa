Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap("C:\Users\user\.gemini\antigravity\brain\f3272976-515a-4a7e-a14e-c14f855d3df4\login_page_white_1780814766575.png")

# Card is at the center (around width/2, height/2)
$centerX = [int]($bmp.Width / 2)
$centerY = [int]($bmp.Height / 2)

# Page background is near the top-left (e.g. 50, 50)
$bgX = 50
$bgY = 50

$cardPixel = $bmp.GetPixel($centerX, $centerY)
$bgPixel = $bmp.GetPixel($bgX, $bgY)

Write-Output "Image Resolution: $($bmp.Width)x$($bmp.Height)"
Write-Output "Card center pixel color ($centerX, $centerY): R=$($cardPixel.R), G=$($cardPixel.G), B=$($cardPixel.B)"
Write-Output "Page background pixel color ($bgX, $bgY): R=$($bgPixel.R), G=$($bgPixel.G), B=$($bgPixel.B)"
$bmp.Dispose()
