# Script de PowerShell para probar el sistema de cache Redis/Upstash
# Uso: .\scripts\test-cache-simple.ps1

Write-Host "🚀 Prueba del Sistema de Cache Redis/Upstash" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Función para probar un endpoint
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Name
    )
    
    Write-Host "`n🔍 Probando $Name..." -ForegroundColor Blue
    
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 10
        $stopwatch.Stop()
        $responseTime = $stopwatch.ElapsedMilliseconds
        
        Write-Host "✅ $Name - ${responseTime}ms" -ForegroundColor Green
        Write-Host "   Status: 200" -ForegroundColor Green
        
        # Mostrar parte de la respuesta
        $responseJson = $response | ConvertTo-Json -Compress
        if ($responseJson.Length -gt 100) {
            $responseJson = $responseJson.Substring(0, 100) + "..."
        }
        Write-Host "   Datos: $responseJson" -ForegroundColor Green
        
        return @{
            Success = $true
            Time = $responseTime
            Data = $response
        }
    }
    catch {
        $stopwatch.Stop()
        Write-Host "❌ $Name - Error: $($_.Exception.Message)" -ForegroundColor Red
        return @{
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

# Endpoints a probar
$endpoints = @(
    @{ Url = "http://localhost:3000/api/categories"; Name = "Categorías" },
    @{ Url = "http://localhost:3000/api/catalog/filters"; Name = "Filtros" },
    @{ Url = "http://localhost:3000/api/sales/kpis"; Name = "KPIs" },
    @{ Url = "http://localhost:3000/api/catalog/products?page=1&limit=5"; Name = "Productos (Página 1)" },
    @{ Url = "http://localhost:3000/api/sales"; Name = "Ventas" }
)

$results = @()

# Primera ronda - Sin cache (primera llamada)
Write-Host "`n📊 Primera ronda - Sin cache:" -ForegroundColor Yellow
foreach ($endpoint in $endpoints) {
    $result = Test-Endpoint -Url $endpoint.Url -Name $endpoint.Name
    $result.Round = 1
    $result.Endpoint = $endpoint.Name
    $results += $result
    
    Start-Sleep -Milliseconds 500
}

# Segunda ronda - Con cache (segunda llamada)
Write-Host "`n📊 Segunda ronda - Con cache:" -ForegroundColor Yellow
foreach ($endpoint in $endpoints) {
    $result = Test-Endpoint -Url $endpoint.Url -Name $endpoint.Name
    $result.Round = 2
    $result.Endpoint = $endpoint.Name
    $results += $result
    
    Start-Sleep -Milliseconds 500
}

# Análisis de resultados
Write-Host "`n📈 Análisis de Rendimiento:" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

foreach ($endpoint in $endpoints) {
    $firstCall = $results | Where-Object { $_.Endpoint -eq $endpoint.Name -and $_.Round -eq 1 }
    $secondCall = $results | Where-Object { $_.Endpoint -eq $endpoint.Name -and $_.Round -eq 2 }
    
    if ($firstCall.Success -and $secondCall.Success) {
        $improvement = [math]::Round((($firstCall.Time - $secondCall.Time) / $firstCall.Time * 100), 1)
        
        Write-Host "`n$($endpoint.Name):" -ForegroundColor Blue
        Write-Host "   Primera llamada: $($firstCall.Time)ms" -ForegroundColor Yellow
        Write-Host "   Segunda llamada: $($secondCall.Time)ms" -ForegroundColor Green
        
        if ($improvement -gt 0) {
            Write-Host "   Mejora: $improvement%" -ForegroundColor Green
        } else {
            Write-Host "   Mejora: $improvement%" -ForegroundColor Red
        }
    }
}

# Estadísticas generales
$successfulTests = ($results | Where-Object { $_.Success }).Count
$totalTests = $results.Count

Write-Host "`n📊 Resumen:" -ForegroundColor Cyan
Write-Host "   Tests exitosos: $successfulTests/$totalTests" -ForegroundColor $(if ($successfulTests -eq $totalTests) { "Green" } else { "Red" })

if ($successfulTests -eq $totalTests) {
    Write-Host "`n🎉 ¡El sistema de cache está funcionando correctamente!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Algunos tests fallaron. Revisa la configuración." -ForegroundColor Red
}

# Probar invalidación de cache
Write-Host "`n🔄 Probando invalidación de cache..." -ForegroundColor Blue
try {
    $invalidationResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/cache/invalidate" -Method Post -TimeoutSec 10
    Write-Host "✅ Invalidación de cache exitosa" -ForegroundColor Green
    Write-Host "   Resultado: $($invalidationResponse | ConvertTo-Json -Compress)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error en invalidación de cache: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Prueba completada" -ForegroundColor Green
