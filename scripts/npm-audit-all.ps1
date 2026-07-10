$ErrorActionPreference = "Stop"

Write-Host "Iniciando análisis rápido de dependencias (npm audit)..." -ForegroundColor Cyan

$services = Get-ChildItem -Path ".\services" -Directory
$frontend = Get-Item -Path ".\apps\frontend" -ErrorAction SilentlyContinue

$allProjects = @()
$allProjects += $services
if ($frontend) { $allProjects += $frontend }

$summary = @()

foreach ($project in $allProjects) {
    $projectName = $project.Name
    $projectPath = $project.FullName

    if (Test-Path "$projectPath\package.json") {
        Write-Host "`nEscaneando: $projectName..." -ForegroundColor Yellow
        Push-Location $projectPath

        # Aseguramos que existan las dependencias
        if (!(Test-Path "node_modules")) {
            Write-Host "Instalando dependencias (necesario para npm audit)..." -ForegroundColor DarkGray
            npm ci --legacy-peer-deps | Out-Null
        }

        Write-Host "Ejecutando npm audit..." -ForegroundColor DarkGray
        $auditOutput = npm audit --json | Out-String
        $auditResult = $null
        try {
            $auditResult = $auditOutput | ConvertFrom-Json -ErrorAction Stop
        } catch {
            Write-Host "  [!] Error parseando JSON (puede haber errores de red)." -ForegroundColor Red
        }

        if ($auditResult) {
            $vulns = $auditResult.metadata.vulnerabilities
            
            $totalVulns = $vulns.info + $vulns.low + $vulns.medium + $vulns.high + $vulns.critical
            
            if ($totalVulns -gt 0) {
                Write-Host "  [!] Vulnerabilidades encontradas:" -ForegroundColor Red
                Write-Host "      Críticas: $($vulns.critical)" -ForegroundColor DarkRed
                Write-Host "      Altas:    $($vulns.high)" -ForegroundColor Red
                Write-Host "      Medias:   $($vulns.medium)" -ForegroundColor Yellow
                Write-Host "      Bajas:    $($vulns.low)" -ForegroundColor Blue
            } else {
                Write-Host "  [OK] No se encontraron vulnerabilidades." -ForegroundColor Green
            }

            $summary += [PSCustomObject]@{
                Servicio = $projectName
                Criticas = $vulns.critical
                Altas    = $vulns.high
                Medias   = $vulns.medium
                Bajas    = $vulns.low
                Total    = $totalVulns
            }
        }

        Pop-Location
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "RESUMEN DE VULNERABILIDADES (npm audit)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
$summary | Format-Table -AutoSize
