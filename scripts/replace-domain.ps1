#!/usr/bin/env pwsh
# Replace omnipdf.com with omnipdf.uiflexer.com script

$rootPath = "c:\Users\Huzaifa\Documents\Projects\pdf-conversion\web"
$oldUrl = "https://omnipdf.uiflexer.com"
$newUrl = "https://omnipdf.uiflexer.com"

Write-Host "Starting URL replacement..." -ForegroundColor Cyan
Write-Host "Old: $oldUrl" -ForegroundColor Yellow
Write-Host "New: $newUrl" -ForegroundColor Green
Write-Host ""

# Get all files (excluding node_modules, .git, .next, build artifacts)
$excludePatterns = @('node_modules', '.git', '.next', 'dist', 'build', '.vercel')
$files = Get-ChildItem -Path $rootPath -Recurse -File | Where-Object {
    $filePath = $_.FullName
    -not ($excludePatterns | Where-Object { $filePath -like "*$_*" })
}

$replacedCount = 0
$filesModified = @()

foreach ($file in $files) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
        
        if ($content -and $content.Contains($oldUrl)) {
            $newContent = $content.Replace($oldUrl, $newUrl)
            Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
            $filesModified += $file.FullName
            $occurrences = (($content.Length - $newContent.Length) / ($oldUrl.Length - $newUrl.Length))
            Write-Host "âœ… $($file.Name)" -ForegroundColor Green
            $replacedCount++
        }
    }
    catch {
        # Silently skip files that can't be read/written (binary files, locked files, etc.)
    }
}

Write-Host ""
Write-Host "Replacement Summary:" -ForegroundColor Cyan
Write-Host "Files modified: $replacedCount" -ForegroundColor Green
Write-Host ""

if ($filesModified.Count -gt 0) {
    Write-Host "Files updated:" -ForegroundColor Yellow
    $filesModified | ForEach-Object {
        Write-Host "  - $_"
    }
}

Write-Host ""
Write-Host "Replacement complete!" -ForegroundColor Green

