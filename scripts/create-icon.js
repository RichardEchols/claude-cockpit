#!/usr/bin/env node
// Generate a 1024x1024 Kiyomi app icon
// Design: Dark rounded square with a sparkle/star mark
// Colors: Deep navy/black gradient background (#0a0a1a to #1a1a3a)
// Center: A stylized sparkle in accent blue (#3b82f6) with a subtle glow
// Style: Apple-quality, minimal, modern

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const SIZE = 1024;
const canvas = createCanvas(SIZE, SIZE);
const ctx = canvas.getContext('2d');

// --- Background: dark gradient with rounded corners ---
const RADIUS = SIZE * 0.22; // Apple-style corner radius (~225px)

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// Clip to rounded rect
roundedRect(ctx, 0, 0, SIZE, SIZE, RADIUS);
ctx.clip();

// Gradient background
const bgGrad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
bgGrad.addColorStop(0, '#0a0a1a');
bgGrad.addColorStop(0.5, '#0f0f2e');
bgGrad.addColorStop(1, '#1a1a3a');
ctx.fillStyle = bgGrad;
ctx.fillRect(0, 0, SIZE, SIZE);

// Subtle radial glow behind the center
const glowGrad = ctx.createRadialGradient(SIZE / 2, SIZE / 2, 0, SIZE / 2, SIZE / 2, SIZE * 0.45);
glowGrad.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
glowGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.05)');
glowGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');
ctx.fillStyle = glowGrad;
ctx.fillRect(0, 0, SIZE, SIZE);

// --- Draw a 4-pointed sparkle / star ---
const cx = SIZE / 2;
const cy = SIZE / 2;

function drawSparkle(ctx, cx, cy, outerR, innerR, rotation = 0) {
  const points = 4;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI * 2 * i) / (points * 2) - Math.PI / 2 + rotation;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

// Outer glow sparkle
ctx.save();
ctx.shadowColor = 'rgba(59, 130, 246, 0.8)';
ctx.shadowBlur = 80;
drawSparkle(ctx, cx, cy, SIZE * 0.30, SIZE * 0.06);
const sparkleGrad = ctx.createLinearGradient(cx - SIZE * 0.3, cy - SIZE * 0.3, cx + SIZE * 0.3, cy + SIZE * 0.3);
sparkleGrad.addColorStop(0, '#60a5fa');
sparkleGrad.addColorStop(0.5, '#3b82f6');
sparkleGrad.addColorStop(1, '#2563eb');
ctx.fillStyle = sparkleGrad;
ctx.fill();
ctx.restore();

// Inner bright sparkle (smaller, white-ish)
ctx.save();
ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
ctx.shadowBlur = 30;
drawSparkle(ctx, cx, cy, SIZE * 0.14, SIZE * 0.03);
const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, SIZE * 0.14);
innerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
innerGrad.addColorStop(0.4, 'rgba(191, 219, 254, 0.7)');
innerGrad.addColorStop(1, 'rgba(96, 165, 250, 0.4)');
ctx.fillStyle = innerGrad;
ctx.fill();
ctx.restore();

// Small secondary sparkles for depth
function drawMiniSparkle(ctx, x, y, size, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = `rgba(59, 130, 246, ${alpha})`;
  ctx.shadowBlur = 15;
  drawSparkle(ctx, x, y, size, size * 0.2, Math.PI / 6);
  ctx.fillStyle = '#93c5fd';
  ctx.fill();
  ctx.restore();
}

drawMiniSparkle(ctx, cx + SIZE * 0.22, cy - SIZE * 0.18, SIZE * 0.04, 0.7);
drawMiniSparkle(ctx, cx - SIZE * 0.18, cy + SIZE * 0.22, SIZE * 0.03, 0.5);
drawMiniSparkle(ctx, cx + SIZE * 0.10, cy + SIZE * 0.26, SIZE * 0.025, 0.4);
drawMiniSparkle(ctx, cx - SIZE * 0.25, cy - SIZE * 0.12, SIZE * 0.02, 0.35);

// Center dot
ctx.save();
ctx.beginPath();
ctx.arc(cx, cy, SIZE * 0.025, 0, Math.PI * 2);
ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
ctx.shadowBlur = 20;
ctx.fill();
ctx.restore();

// --- Output ---
const outDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'icon-1024.png');
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(outPath, buffer);
console.log(`✅ Icon written to ${outPath} (${buffer.length} bytes)`);
