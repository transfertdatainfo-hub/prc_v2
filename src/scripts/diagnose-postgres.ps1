Write-Host "=== Diagnostic PostgreSQL ===" -ForegroundColor Cyan

# Verifier .env
Write-Host "`n[Fichier .env]" -ForegroundColor Yellow
if (Test-Path .env) {
    Write-Host "OK: .env existe" -ForegroundColor Green
    $dbUrl = Get-Content .env | Select-String "DATABASE_URL"
    if ($dbUrl) {
        Write-Host "OK: DATABASE_URL est defini" -ForegroundColor Green
    } else {
        Write-Host "ERREUR: DATABASE_URL non trouve dans .env" -ForegroundColor Red
    }
} else {
    Write-Host "ERREUR: Fichier .env introuvable" -ForegroundColor Red
}

# Verifier PostgreSQL
Write-Host "`n[Services PostgreSQL]" -ForegroundColor Yellow
$pgServices = Get-Service | Where-Object {$_.Name -like "*postgres*"}
if ($pgServices) {
    $pgServices | ForEach-Object {
        if ($_.Status -eq "Running") {
            Write-Host "OK: $($_.Name) - $($_.Status)" -ForegroundColor Green
        } else {
            Write-Host "ERREUR: $($_.Name) - $($_.Status)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "ERREUR: Aucun service PostgreSQL trouve" -ForegroundColor Red
}

# Verifier le port
Write-Host "`n[Port 5432]" -ForegroundColor Yellow
$port = netstat -an | Select-String ":5432.*LISTENING"
if ($port) {
    Write-Host "OK: PostgreSQL ecoute sur le port 5432" -ForegroundColor Green
} else {
    Write-Host "ERREUR: Rien n'ecoute sur le port 5432" -ForegroundColor Red
}

Write-Host "`nExecutez maintenant: node test-connection.js" -ForegroundColor Cyan
