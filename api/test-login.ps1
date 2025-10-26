$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    email = "test3@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    Write-Host "Testing login..."
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method POST -Headers $headers -Body $body
    
    Write-Host "✅ Login successful!"
    Write-Host "User: $($response.user | ConvertTo-Json)"
    Write-Host "Token received: $($response.token -ne $null)"
    
    if ($response.token) {
        Write-Host "`nTesting /me endpoint..."
        $meHeaders = @{
            "Authorization" = "Bearer $($response.token)"
        }
        
        $meResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/me" -Method GET -Headers $meHeaders
        Write-Host "✅ /me endpoint successful!"
        Write-Host "User profile: $($meResponse.user | ConvertTo-Json)"
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody"
    }
}