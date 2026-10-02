Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force -Path 'public'

$srcPath = Join-Path (Get-Location) 'assets\icons\aura-logo.png'
$src = [System.Drawing.Image]::FromFile($srcPath)

function Resize-Img($inImg, [int]$w, [int]$h, [string]$outPath) {
    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($inImg, 0, 0, $w, $h)
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

Resize-Img $src 64 64 'public\favicon.png'
Resize-Img $src 32 32 'public\favicon-32x32.png'
Resize-Img $src 16 16 'public\favicon-16x16.png'
Resize-Img $src 180 180 'public\apple-touch-icon.png'
Resize-Img $src 64 64 'favicon.png'
Resize-Img $src 32 32 'favicon.ico'
Copy-Item 'favicon.ico' 'public\favicon.ico' -Force
$src.Dispose()

Get-ChildItem -Path 'public' | Select-Object Name, Length
