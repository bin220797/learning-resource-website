# Render API Deploy Script
# Fill in your API_KEY below and run this script

$API_KEY = "rnd_f8VchqKeJn1fGaFOi4XhvsyAYtaJ"

$headers = @{
    "Accept" = "application/json"
    "Authorization" = "Bearer $API_KEY"
    "Content-Type" = "application/json"
}

# Step 1: Get user info
try {
    Write-Host "Getting account info..."
    $user = Invoke-RestMethod -Uri "https://api.render.com/v1/users" -Headers $headers
    $ownerId = $user[0].id
    Write-Host "OK - User ID: $ownerId"
} catch {
    Write-Host "ERROR getting user: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Create service
try {
    Write-Host "Creating service..."
    $body = @{
        type = "web_service"
        name = "learning-resource-website"
        ownerId = $ownerId
        repo = "https://github.com/bin220797/learning-resource-website"
        branch = "main"
        buildFilter = @{
            paths = @("**/*")
        }
        envVars = @(
            @{ key = "QINIU_ACCESS_KEY"; value = "jHlmOyj5A4jcFqr_GzdigjPaDDyGVW856UsXxZQ7" },
            @{ key = "QINIU_SECRET_KEY"; value = "DMvFXs-aV-8Z3c1NTa1XxDyKpLyyGC3JL-HkEBKG" },
            @{ key = "QINIU_BUCKET"; value = "bin220797" },
            @{ key = "QINIU_DOMAIN"; value = "th6uj1etn.hd-bkt.clouddn.com" },
            @{ key = "QINIU_ZONE"; value = "z0" }
        )
    } | ConvertTo-Json -Depth 10

    $service = Invoke-RestMethod -Uri "https://api.render.com/v1/services" -Method Post -Headers $headers -Body $body
    $serviceId = $service.service.id
    Write-Host "OK - Service ID: $serviceId"
} catch {
    Write-Host "ERROR creating service: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Trigger deploy
try {
    Write-Host "Triggering deploy..."
    $deployBody = @{ clearCache = "do_not_clear" } | ConvertTo-Json
    $deploy = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$serviceId/deploys" -Method Post -Headers $headers -Body $deployBody
    Write-Host "OK - Deploy triggered!"
} catch {
    Write-Host "ERROR deploying: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "DONE! Check status at:" -ForegroundColor Green
Write-Host "  https://dashboard.render.com/web/$serviceId"
