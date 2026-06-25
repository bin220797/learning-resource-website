# Start phpstudy and Node.js server
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start phpstudy
Write-Host "Starting phpstudy..."
try {
    $phpPath = "D:\phpstudy_pro\Extensions\php\php8.2.9nts"
    if (Test-Path "$phpPath\php-cgi.exe") {
        Start-Process -FilePath "$phpPath\php-cgi.exe" -ArgumentList "-b 127.0.0.1:9002 -c php.ini" -WindowStyle Hidden
        Write-Host "phpstudy started"
    } else {
        Write-Host "php-cgi.exe not found at $phpPath"
    }
} catch {
    Write-Host "Error starting phpstudy: $_"
}

# Start Node.js server
Write-Host "Starting Node.js server..."
try {
    Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Hidden -WorkingDirectory $scriptPath
    Write-Host "Node.js server started (hidden window)"
} catch {
    Write-Host "Error starting Node.js server: $_"
}

Write-Host "All services started"
