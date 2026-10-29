# Copy admin components from src/components to admin/src/components
Write-Host "Copying admin components to separate admin app..." -ForegroundColor Cyan

$components = @(
    "AdminLayout.tsx",
    "AdminDashboard.tsx",
    "AdminCouponManager.tsx",
    "AdminBrandManager.tsx",
    "AdminUserManager.tsx",
    "AdminCategoryManager.tsx",
    "AdminAnalytics.tsx"
)

foreach ($component in $components) {
    $srcPath = "src\components\$component"
    $destPath = "admin\src\components\$component"
    
    if (Test-Path $srcPath) {
        Copy-Item $srcPath $destPath -Force
        Write-Host "✓ Copied $component" -ForegroundColor Green
    }
}

# Copy types
Copy-Item "src\types.ts" "admin\src\types.ts" -Force

Write-Host "`n✅ All admin components copied successfully!`n" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run: npm run dev:admin" -ForegroundColor White
Write-Host "2. Visit: http://localhost:3001" -ForegroundColor White
