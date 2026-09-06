param(
  [Parameter(Mandatory = $true)][string]$InputPath,
  [Parameter(Mandatory = $true)][string]$OutputPath,
  [switch]$CleanDetachedFloorFragments
)

Add-Type -AssemblyName System.Drawing

$source = [System.Drawing.Bitmap]::FromFile($InputPath)
$bitmap = New-Object System.Drawing.Bitmap($source.Width, $source.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.DrawImageUnscaled($source, 0, 0)
$graphics.Dispose()
$source.Dispose()

$width = $bitmap.Width
$height = $bitmap.Height
$visited = New-Object 'bool[,]' $width, $height
$queue = New-Object 'System.Collections.Generic.Queue[System.Drawing.Point]'

function Test-BackgroundPixel([System.Drawing.Color]$color) {
  $max = [Math]::Max($color.R, [Math]::Max($color.G, $color.B))
  $min = [Math]::Min($color.R, [Math]::Min($color.G, $color.B))
  return $min -ge 222 -and ($max - $min) -le 18
}

function Add-EdgePixel([int]$x, [int]$y) {
  if (-not $visited[$x, $y] -and (Test-BackgroundPixel $bitmap.GetPixel($x, $y))) {
    $visited[$x, $y] = $true
    $queue.Enqueue([System.Drawing.Point]::new($x, $y))
  }
}

for ($x = 0; $x -lt $width; $x++) {
  Add-EdgePixel $x 0
  Add-EdgePixel $x ($height - 1)
}
for ($y = 0; $y -lt $height; $y++) {
  Add-EdgePixel 0 $y
  Add-EdgePixel ($width - 1) $y
}

$directions = @(
  [System.Drawing.Point]::new(1, 0),
  [System.Drawing.Point]::new(-1, 0),
  [System.Drawing.Point]::new(0, 1),
  [System.Drawing.Point]::new(0, -1),
  [System.Drawing.Point]::new(1, 1),
  [System.Drawing.Point]::new(-1, 1),
  [System.Drawing.Point]::new(1, -1),
  [System.Drawing.Point]::new(-1, -1)
)

while ($queue.Count -gt 0) {
  $point = $queue.Dequeue()
  $bitmap.SetPixel($point.X, $point.Y, [System.Drawing.Color]::Transparent)
  foreach ($direction in $directions) {
    $nextX = $point.X + $direction.X
    $nextY = $point.Y + $direction.Y
    if ($nextX -lt 0 -or $nextX -ge $width -or $nextY -lt 0 -or $nextY -ge $height) { continue }
    if ($visited[$nextX, $nextY]) { continue }
    if (Test-BackgroundPixel $bitmap.GetPixel($nextX, $nextY)) {
      $visited[$nextX, $nextY] = $true
      $queue.Enqueue([System.Drawing.Point]::new($nextX, $nextY))
    }
  }
}

if ($CleanDetachedFloorFragments) {
  $floorStart = [int]($height * 0.70)
  $floorVisited = New-Object 'bool[,]' $width, $height
  for ($y = $floorStart; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
      if ($floorVisited[$x, $y]) { continue }
      $color = $bitmap.GetPixel($x, $y)
      $maximum = [Math]::Max($color.R, [Math]::Max($color.G, $color.B))
      $minimum = [Math]::Min($color.R, [Math]::Min($color.G, $color.B))
      if ($color.A -eq 0 -or $minimum -lt 130 -or ($maximum - $minimum) -gt 25) {
        $floorVisited[$x, $y] = $true
        continue
      }

      $component = New-Object 'System.Collections.Generic.List[System.Drawing.Point]'
      $componentQueue = New-Object 'System.Collections.Generic.Queue[System.Drawing.Point]'
      $floorVisited[$x, $y] = $true
      $componentQueue.Enqueue([System.Drawing.Point]::new($x, $y))
      while ($componentQueue.Count -gt 0) {
        $candidate = $componentQueue.Dequeue()
        $component.Add($candidate)
        foreach ($direction in $directions) {
          $nextX = $candidate.X + $direction.X
          $nextY = $candidate.Y + $direction.Y
          if ($nextX -lt 0 -or $nextX -ge $width -or $nextY -lt $floorStart -or $nextY -ge $height) { continue }
          if ($floorVisited[$nextX, $nextY]) { continue }
          $nextColor = $bitmap.GetPixel($nextX, $nextY)
          $nextMaximum = [Math]::Max($nextColor.R, [Math]::Max($nextColor.G, $nextColor.B))
          $nextMinimum = [Math]::Min($nextColor.R, [Math]::Min($nextColor.G, $nextColor.B))
          $floorVisited[$nextX, $nextY] = $true
          if ($nextColor.A -gt 0 -and $nextMinimum -ge 130 -and ($nextMaximum - $nextMinimum) -le 25) {
            $componentQueue.Enqueue([System.Drawing.Point]::new($nextX, $nextY))
          }
        }
      }
      if ($component.Count -le 2400) {
        foreach ($candidate in $component) {
          $bitmap.SetPixel($candidate.X, $candidate.Y, [System.Drawing.Color]::Transparent)
        }
      }
    }
  }
}

$parent = Split-Path -Parent $OutputPath
if ($parent) { New-Item -ItemType Directory -Force -Path $parent | Out-Null }
$bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap.Dispose()
