try {
    $response = Invoke-RestMethod -Uri "http://127.0.0.1:3001/health" -Method GET
    Write-Host "✅ Health check successful: $($response | ConvertTo-Json)"
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)"
}