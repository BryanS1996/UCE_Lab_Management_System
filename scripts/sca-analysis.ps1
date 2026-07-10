$ErrorActionPreference = "Stop"

Write-Host "Iniciando análisis completo SCA..." -ForegroundColor Cyan

# Aseguramos el directorio de reportes
if (!(Test-Path ".\reports")) {
    New-Item -ItemType Directory -Force -Path ".\reports" | Out-Null
}

Write-Host "`nPaso 1: Ejecutar npm audit consolidado..." -ForegroundColor Yellow
.\scripts\npm-audit-all.ps1

Write-Host "`nPaso 2: OWASP Dependency-Check (requiere tener dependency-check instalado en la máquina)" -ForegroundColor Yellow
Write-Host "Nota: Si no tienes Dependency-Check en el PATH, este script omitirá el análisis visual HTML y json de OWASP." -ForegroundColor DarkGray

try {
    # Check if dependency-check.bat is in PATH
    $depCheck = Get-Command "dependency-check.bat" -ErrorAction Stop
    Write-Host "Ejecutando Dependency-Check..." -ForegroundColor Cyan
    
    dependency-check.bat --project "UCE_Lab_Management_System" `
        --scan "." `
        --out ".\reports" `
        --format "ALL" `
        --exclude "**\node_modules\**" `
        --exclude "**\dist\**" `
        --disableAssembly

    Write-Host "`nReportes generados en la carpeta /reports" -ForegroundColor Green
} catch {
    Write-Host "`n[!] dependency-check.bat no encontrado en el PATH." -ForegroundColor Yellow
    Write-Host "Puedes descargar OWASP Dependency Check Command Line desde: https://owasp.org/www-project-dependency-check/" -ForegroundColor Yellow
    Write-Host "Para el análisis local de SonarQube, necesitaremos que lo instales." -ForegroundColor Yellow
}

Write-Host "`nPaso 3: Análisis de SonarQube (requiere SonarScanner en el PATH)" -ForegroundColor Yellow
try {
    $sonar = Get-Command "sonar-scanner.bat" -ErrorAction Stop
    Write-Host "Asegúrate de haber configurado tu SONAR_TOKEN en las variables de entorno." -ForegroundColor DarkGray
    
    # Asume que sonar-project.properties ya tiene todo configurado
    sonar-scanner.bat
    
    Write-Host "`nAnálisis de SonarQube completado." -ForegroundColor Green
} catch {
    Write-Host "`n[!] sonar-scanner.bat no encontrado en el PATH." -ForegroundColor Yellow
    Write-Host "Omitiendo subida a SonarQube desde el equipo local. Usa el flujo de CI para subir al servidor." -ForegroundColor Yellow
}

Write-Host "`nAnálisis SCA local finalizado." -ForegroundColor Cyan
