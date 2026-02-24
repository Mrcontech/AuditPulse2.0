$SUPABASE_URL = "https://hmpvqhxiihrgwaebpkpw.supabase.co"
$ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcHZxaHhpaWhyZ3dhZWJwa3B3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1NzA0NTYsImV4cCI6MjA4MjE0NjQ1Nn0.xBhk7m-5t_rZX47DgHvTdRvW9b8qoTaeiqUI76WR4Fs"
$ENDPOINT = "$SUPABASE_URL/functions/v1/dodo-checkout"

$headers = @{
    "Content-Type"  = "application/json"
    "Authorization" = "Bearer $ANON_KEY"
}

$body = @{
    productId     = "pdt_0NYUy3n4rUmePuUR2J0eF"
    customerEmail = "testuser@example.com"
    userId        = "614d513e-2e8f-4037-8df2-d6a98798acee"
    returnUrl     = "http://localhost:5173/dashboard"
} | ConvertTo-Json

Write-Host "Testing Dodo Checkout Endpoint..." -ForegroundColor Cyan
Write-Host "Endpoint: $ENDPOINT" -ForegroundColor Cyan
Write-Host "Body: $body" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri $ENDPOINT -Method Post -Headers $headers -Body $body -ErrorAction Stop
    Write-Host "SUCCESS! Checkout URL:" -ForegroundColor Green
    Write-Host $response.url -ForegroundColor Green
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errBody = $reader.ReadToEnd()
        Write-Host "Response Body: $errBody" -ForegroundColor Yellow
    }
}
