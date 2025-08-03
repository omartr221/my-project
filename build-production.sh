#!/bin/bash

echo "🏗️ Building V POWER TUNING for Render deployment..."

# Copy client structure to root for Vite compatibility
echo "📁 Setting up file structure for Render..."

# Create src directory and copy main.tsx if not exists
if [ ! -f "src/main.tsx" ]; then
    echo "📋 Creating src/main.tsx from client structure..."
    mkdir -p src
    cat > src/main.tsx << 'EOF'
// Production entry point for Render
import { createRoot } from "react-dom/client";
import App from "../client/src/App";
import "../client/src/index.css";

// Error handlers
window.addEventListener('error', function(event) {
  event.preventDefault();
  event.stopPropagation();
  return false;
}, true);

window.addEventListener('unhandledrejection', function(event) {
  event.preventDefault();
  event.stopPropagation();
  return false;
});

console.log('🚀 V POWER TUNING - Starting in production mode...');
createRoot(document.getElementById("root")!).render(<App />);
EOF
fi

# Update index.html to point to correct location
if [ ! -f "index.html" ]; then
    echo "📄 Creating production index.html..."
    cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>V POWER TUNING - نظام إدارة المهام</title>
    <meta name="description" content="نظام إدارة المهام والعمال - V POWER TUNING" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF
fi

echo "✅ File structure ready for Render!"
echo "📦 Files created:"
ls -la src/main.tsx index.html

echo "🚀 Ready for Render deployment!"