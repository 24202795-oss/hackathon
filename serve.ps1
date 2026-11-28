$prefix = "http://localhost:8090/"
$root = Join-Path $PSScriptRoot "frontend"
$mime = @{
  ".html"="text/html"; ".css"="text/css"; ".js"="text/javascript";
  ".svg"="image/svg+xml"; ".png"="image/png"; ".ico"="image/x-icon"; ".json"="application/json"
}
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()
Write-Host "Serving $root at $prefix"
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  try {
    $rel = $ctx.Request.Url.AbsolutePath
    if ($rel -eq "/") { $rel = "/index.html" }
    $file = Join-Path $root ($rel.TrimStart("/") -replace "/", "\")
    if (Test-Path $file -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($file).ToLower()
      $bytes = [System.IO.File]::ReadAllBytes($file)
      $ctx.Response.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" }
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
    }
  } catch { try { $ctx.Response.StatusCode = 500 } catch {} }
  try { $ctx.Response.OutputStream.Close() } catch {}
}
