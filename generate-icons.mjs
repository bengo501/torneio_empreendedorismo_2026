// Run once: node generate-icons.mjs
// Generates public/icons/icon-192.png and icon-512.png from an SVG string.
import { createCanvas } from 'canvas'
import fs from 'fs'

const sizes = [192, 512]
const GREEN = '#3DED7A'
const DARK  = '#0A0A0A'

for (const size of sizes) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background circle
  ctx.fillStyle = DARK
  ctx.beginPath()
  ctx.roundRect(0, 0, size, size, size * 0.22)
  ctx.fill()

  // Green bolt ⚡ emoji
  ctx.fillStyle = GREEN
  ctx.font = `bold ${size * 0.55}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('⚡', size / 2, size / 2 + size * 0.04)

  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync(`public/icons/icon-${size}.png`, buffer)
  console.log(`✓ icon-${size}.png`)
}
