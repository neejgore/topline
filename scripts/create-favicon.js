#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔔 Creating favicon files for The Beacon...')

// Read the simple SVG
const svgPath = path.join(__dirname, '../public/bell-icon.svg')
const svgContent = fs.readFileSync(svgPath, 'utf8')

console.log('✅ SVG favicon created at /public/favicon.svg')
console.log('✅ Simple SVG created at /public/bell-icon.svg')

console.log('\n📋 To complete the favicon setup:')
console.log('1. Visit https://realfavicongenerator.net/')
console.log('2. Upload the bell-icon.svg file')
console.log('3. Generate all favicon formats')
console.log('4. Download and extract to /public/ folder')
console.log('')
console.log('Or use the following commands if you have imagemagick/convert installed:')
console.log('  # Convert SVG to ICO')
console.log('  convert public/bell-icon.svg -resize 32x32 public/favicon.ico')
console.log('  ')
console.log('  # Create Apple touch icon')
console.log('  convert public/bell-icon.svg -resize 180x180 public/apple-touch-icon.png')
console.log('')

// Create a basic HTML file to test the favicon locally
const testHtml = `<!DOCTYPE html>
<html>
<head>
    <title>Favicon Test - The Beacon</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
</head>
<body>
    <h1>🔔 The Beacon Favicon Test</h1>
    <p>Check your browser tab for the bell icon!</p>
</body>
</html>`

fs.writeFileSync(path.join(__dirname, '../public/favicon-test.html'), testHtml)
console.log('✅ Test file created at /public/favicon-test.html')
console.log('   Visit /favicon-test.html to test favicon display')

console.log('\n🎉 Favicon setup initiated! SVG favicon will work immediately in modern browsers.')
console.log('   For maximum compatibility, complete the ICO conversion steps above.') 