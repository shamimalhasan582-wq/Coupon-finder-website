#!/bin/bash

# Copy admin components from src/components to admin/src/components
echo "Copying admin components to separate admin app..."

cp src/components/AdminLayout.tsx admin/src/components/ || true
cp src/components/AdminDashboard.tsx admin/src/components/ || true
cp src/components/AdminCouponManager.tsx admin/src/components/ || true
cp src/components/AdminBrandManager.tsx admin/src/components/ || true
cp src/components/AdminUserManager.tsx admin/src/components/ || true
cp src/components/AdminCategoryManager.tsx admin/src/components/ || true
cp src/components/AdminAnalytics.tsx admin/src/components/ || true
cp src/types.ts admin/src/ || true

echo "✅ Admin components copied successfully!"
echo ""
echo "Next steps:"
echo "1. Run: npm run dev:admin"
echo "2. Visit: http://localhost:3001"
echo ""
