#!/usr/bin/env node

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

async function generateFavicon() {
  console.log('🔔 Converting SVG to ICO favicon...')
  
  try {
    const svgPath = path.join(__dirname, '../public/bell-icon.svg')
    const outputPath = path.join(__dirname, '../public/favicon.ico')
    
    // Check if SVG exists
    if (!fs.existsSync(svgPath)) {
      console.error('❌ SVG file not found:', svgPath)
      return
    }
    
    // Read SVG content
    const svgBuffer = fs.readFileSync(svgPath)
    
    // Convert SVG to ICO (32x32 PNG format inside ICO)
    await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toFile(outputPath.replace('.ico', '.png'))
    
    console.log('✅ Created favicon.png (32x32)')
    
    // Create Apple touch icon (180x180)
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(__dirname, '../public/apple-touch-icon.png'))
    
    console.log('✅ Created apple-touch-icon.png (180x180)')
    
    // Create multiple sizes for better compatibility
    const sizes = [16, 32, 48, 64, 96, 128, 192, 256]
    
    for (const size of sizes) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(__dirname, `../public/favicon-${size}x${size}.png`))
      
      console.log(`✅ Created favicon-${size}x${size}.png`)
    }
    
    console.log('\n🎉 Favicon files generated successfully!')
    console.log('📋 Files created:')
    console.log('  - favicon.png (32x32)')
    console.log('  - apple-touch-icon.png (180x180)')
    console.log('  - favicon-{size}x{size}.png (multiple sizes)')
    console.log('\n💡 Modern browsers will use the SVG favicon automatically.')
    console.log('   PNG fallbacks are available for older browsers.')
    
  } catch (error) {
    console.error('❌ Error generating favicon:', error)
  }
}

generateFavicon() 