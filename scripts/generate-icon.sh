#!/bin/bash
# Generate Kiyomi app icon (.icns) from source PNG
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PUBLIC_DIR="$PROJECT_DIR/public"
SRC_ICON="$PUBLIC_DIR/icon-1024.png"
ICONSET="$PUBLIC_DIR/Kiyomi.iconset"
OUT_ICNS="$PUBLIC_DIR/icon.icns"

# Step 1: Generate source icon if needed
if [ ! -f "$SRC_ICON" ]; then
  echo "📦 Generating source icon..."
  node "$SCRIPT_DIR/create-icon.js"
fi

if [ ! -f "$SRC_ICON" ]; then
  echo "❌ Failed to create source icon at $SRC_ICON"
  exit 1
fi

echo "🎨 Creating iconset from $SRC_ICON..."

# Step 2: Create iconset directory
mkdir -p "$ICONSET"

# Step 3: Generate all required icon sizes using sips
sips -z 16 16     "$SRC_ICON" --out "$ICONSET/icon_16x16.png"      >/dev/null
sips -z 32 32     "$SRC_ICON" --out "$ICONSET/icon_16x16@2x.png"   >/dev/null
sips -z 32 32     "$SRC_ICON" --out "$ICONSET/icon_32x32.png"      >/dev/null
sips -z 64 64     "$SRC_ICON" --out "$ICONSET/icon_32x32@2x.png"   >/dev/null
sips -z 128 128   "$SRC_ICON" --out "$ICONSET/icon_128x128.png"    >/dev/null
sips -z 256 256   "$SRC_ICON" --out "$ICONSET/icon_128x128@2x.png" >/dev/null
sips -z 256 256   "$SRC_ICON" --out "$ICONSET/icon_256x256.png"    >/dev/null
sips -z 512 512   "$SRC_ICON" --out "$ICONSET/icon_256x256@2x.png" >/dev/null
sips -z 512 512   "$SRC_ICON" --out "$ICONSET/icon_512x512.png"    >/dev/null
sips -z 1024 1024 "$SRC_ICON" --out "$ICONSET/icon_512x512@2x.png" >/dev/null

# Step 4: Convert iconset to .icns
echo "📦 Building .icns..."
iconutil -c icns "$ICONSET" -o "$OUT_ICNS"

# Cleanup iconset directory
rm -rf "$ICONSET"

echo "✅ Icon generated at $OUT_ICNS ($(wc -c < "$OUT_ICNS" | tr -d ' ') bytes)"
