Add-Type -AssemblyName System.Drawing

$width = 1200
$height = 630
$outputPath = Join-Path $PSScriptRoot '..\public\og-image.png'
$bitmap = [System.Drawing.Bitmap]::new($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

function New-RoundedPath([float]$X, [float]$Y, [float]$W, [float]$H, [float]$R) {
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $diameter = $R * 2
  $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
  $path.AddArc($X + $W - $diameter, $Y, $diameter, $diameter, 270, 90)
  $path.AddArc($X + $W - $diameter, $Y + $H - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($X, $Y + $H - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

try {
  $background = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    [System.Drawing.Rectangle]::new(0, 0, $width, $height),
    [System.Drawing.Color]::FromArgb(251, 250, 246),
    [System.Drawing.Color]::FromArgb(233, 239, 232),
    35
  )
  $graphics.FillRectangle($background, 0, 0, $width, $height)
  $background.Dispose()

  foreach ($circle in @(@(780, 95, 440, 440, 40), @(825, 140, 350, 350, 34), @(870, 185, 260, 260, 28))) {
    $pen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb($circle[4], 117, 145, 122), 1.4)
    $graphics.DrawEllipse($pen, $circle[0], $circle[1], $circle[2], $circle[3])
    $pen.Dispose()
  }

  $tilePath = New-RoundedPath 872 187 256 256 76
  $tileBrush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    [System.Drawing.Rectangle]::new(872, 187, 256, 256),
    [System.Drawing.Color]::FromArgb(66, 109, 85),
    [System.Drawing.Color]::FromArgb(39, 72, 56),
    135
  )
  $graphics.FillPath($tileBrush, $tilePath)
  $tilePath.Dispose(); $tileBrush.Dispose()

  $whitePen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(247, 245, 240), 16)
  $whitePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $whitePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $whitePen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $graphics.DrawLine($whitePen, 1000, 368, 1000, 293)
  $leftLeaf = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $leftLeaf.AddBezier(993, 298, 954, 297, 929, 274, 925, 240)
  $leftLeaf.AddBezier(925, 240, 963, 237, 991, 257, 999, 295)
  $graphics.DrawPath($whitePen, $leftLeaf)
  $leftLeaf.Dispose()
  $rightLeaf = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $rightLeaf.AddBezier(1007, 282, 1015, 244, 1042, 222, 1076, 222)
  $rightLeaf.AddBezier(1076, 222, 1077, 259, 1053, 285, 1008, 291)
  $graphics.DrawPath($whitePen, $rightLeaf)
  $rightLeaf.Dispose()
  $groundPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(199, 247, 245, 240), 14)
  $groundPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $groundPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $graphics.DrawLine($groundPen, 950, 368, 1050, 368)
  $whitePen.Dispose(); $groundPen.Dispose()

  $labelBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(88, 115, 94))
  $titleBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(38, 54, 44))
  $greenBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(52, 93, 75))
  $bodyBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(102, 115, 106))
  $noteBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(130, 144, 135))
  $rulePen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(184, 201, 182), 2)
  $eyebrowFont = [System.Drawing.Font]::new('Arial', 18, [System.Drawing.FontStyle]::Bold)
  $titleFont = [System.Drawing.Font]::new('Arial', 66, [System.Drawing.FontStyle]::Bold)
  $serifFont = [System.Drawing.Font]::new('Georgia', 64, [System.Drawing.FontStyle]::Italic)
  $bodyFont = [System.Drawing.Font]::new('Arial', 23, [System.Drawing.FontStyle]::Regular)
  $noteFont = [System.Drawing.Font]::new('Arial', 17, [System.Drawing.FontStyle]::Bold)
  $graphics.FillRectangle([System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(120, 146, 123)), 92, 104, 42, 3)
  $graphics.DrawString('GROWTHOS', $eyebrowFont, $labelBrush, 148, 91)
  $graphics.DrawString('Become through', $titleFont, $titleBrush, 92, 196)
  $graphics.DrawString('what you practise.', $serifFont, $greenBrush, 92, 283)
  $graphics.DrawString('A thoughtful daily practice for a life that feels like yours.', $bodyFont, $bodyBrush, 96, 377)
  $graphics.DrawLine($rulePen, 96, 500, 146, 500)
  $graphics.DrawString('PLAN  /  PRACTISE  /  REFLECT', $noteFont, $noteBrush, 96, 518)
  $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
} finally {
  $graphics.Dispose()
  $bitmap.Dispose()
}
