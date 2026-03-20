# Script: Copy-Multiple-To-Txt.ps1
# Description: Copie plusieurs fichiers sources vers un dossier cible et change leur extension en .txt

# === CONFIGURATION ===
# Dossier cible unique (MODIFIE CE CHEMIN)
$destinationDir = "C:\Travail\prc\Privatis Capital (docs)\codes"

# LISTE DES FICHIERS SOURCES (ajoute autant de fichiers que tu veux)
$sources = @(
    "C:\Travail\prc\prc\src\app\(dashboard)\news\page.tsx",
    "C:\Travail\prc\prc\src\app\(dashboard)\news\news-sections\ActualitesFilters.tsx",
    "C:\Travail\prc\prc\src\app\(dashboard)\news\news-sections\AllViews.tsx",
    "C:\Travail\prc\prc\src\app\(dashboard)\news\news-sections\CategoryView.tsx",
    "C:\Travail\prc\prc\src\app\(dashboard)\news\news-sections\FeedsView.tsx",
    "C:\Travail\prc\prc\src\app\(dashboard)\news\filters-config\page.tsx",
    "C:\Travail\prc\prc\src\app\api\rss-feeds\route.ts",
    "C:\Travail\prc\prc\src\app\api\rss-feeds\articles\route.ts",
    "C:\Travail\prc\prc\src\app\api\rss-feeds\[id]\route.ts",
    "C:\Travail\prc\prc\src\app\api\interest-filters\[id]\route.ts",
    "C:\Travail\prc\prc\src\app\api\interest-filters\route.ts",
    "C:\Travail\prc\prc\src\components\InterestFilterList.tsx",
    "C:\Travail\prc\prc\src\lib\rss\contentDetector.ts",
    "C:\Travail\prc\prc\src\lib\filters\newsFilters.ts",
    "C:\Travail\prc\prc\src\lib\filters\interestFilterEngine.ts",
    "C:\Travail\prc\prc\src\types\Article.ts",
    "C:\Travail\prc\prc\src\types\Filters.ts",
    "C:\Travail\prc\prc\src\types\global.d.ts",
    "C:\Travail\prc\prc\src\types\RssFeed.ts",
    "C:\Travail\prc\prc\src\types\InterestFilter.tsx",
    "C:\Travail\prc\prc\src\types\Props.ts",
    "C:\Travail\prc\prc\.env",
    "C:\Travail\prc\prc\package.json",
    "C:\Travail\prc\prc\tsconfig.json"
)

# === TRAITEMENT ===
Write-Host "🚀 Début de la copie multiple..." -ForegroundColor Cyan
Write-Host "Dossier cible: $destinationDir" -ForegroundColor Yellow
Write-Host ""

# Compteurs pour le résumé
$successCount = 0
$errorCount = 0
$skippedCount = 0

# Vérifier que le dossier cible existe, sinon le créer
if (-not (Test-Path $destinationDir)) {
    New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
    Write-Host "📁 Dossier cible créé: $destinationDir" -ForegroundColor Green
}

# Traiter chaque fichier source
foreach ($sourcePath in $sources) {
    Write-Host "---" -ForegroundColor Gray
    
    # Vérifier que le fichier source existe
    if (Test-Path $sourcePath) {
        try {
            # Extraire le nom sans extension
            $fileName = [System.IO.Path]::GetFileNameWithoutExtension($sourcePath)
            
            # Construire le chemin de destination
            $destinationPath = Join-Path $destinationDir "$fileName.txt"
            
            # Vérifier si le fichier destination existe déjà
            if (Test-Path $destinationPath) {
                Write-Host "⚠️  Fichier existant: $destinationPath" -ForegroundColor Yellow
                Write-Host "   (écrasé car -Force est utilisé)" -ForegroundColor Gray
            }
            
            # Copier le fichier
            Copy-Item -Path $sourcePath -Destination $destinationPath -Force
            
            Write-Host "✅ Copié: $fileName.txt" -ForegroundColor Green
            Write-Host "   De: $sourcePath" -ForegroundColor Gray
            $successCount++
        }
        catch {
            Write-Host "❌ Erreur sur: $sourcePath" -ForegroundColor Red
            Write-Host "   Détail: $_" -ForegroundColor Red
            $errorCount++
        }
    }
    else {
        Write-Host "❌ Fichier introuvable: $sourcePath" -ForegroundColor Red
        $skippedCount++
    }
}

# === RÉSUMÉ FINAL ===
Write-Host ""
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "📊 RÉSUMÉ" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "✅ Succès: $successCount fichier(s)" -ForegroundColor Green
if ($errorCount -gt 0) { Write-Host "❌ Erreurs: $errorCount fichier(s)" -ForegroundColor Red }
if ($skippedCount -gt 0) { Write-Host "⚠️  Ignorés (introuvables): $skippedCount fichier(s)" -ForegroundColor Yellow }
Write-Host "📁 Dossier cible: $destinationDir" -ForegroundColor Cyan

# Optionnel: Ouvrir le dossier cible à la fin
$openFolder = Read-Host "`nOuvrir le dossier cible? (O/N)"
if ($openFolder -eq "O" -or $openFolder -eq "o") {
    explorer $destinationDir
}

# Pause pour voir le résultat
Write-Host ""
Write-Host "Appuie sur une touche pour fermer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")