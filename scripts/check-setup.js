const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkSetup() {
  console.log('🔍 Checking Topline setup...\n')

  try {
    // Check database connection
    console.log('1. Testing database connection...')
    await prisma.$connect()
    console.log('   ✅ Database connected successfully')

    // Check if tables exist and have data
    console.log('2. Checking database schema...')
    const articleCount = await prisma.article.count()
    const metricCount = await prisma.metric.count()
    const userCount = await prisma.user.count()
    
    console.log(`   ✅ Articles: ${articleCount} found`)
    console.log(`   ✅ Metrics: ${metricCount} found`)
    console.log(`   ✅ Users: ${userCount} found`)

    if (articleCount === 0 || metricCount === 0) {
      console.log('   ⚠️  Run "npm run seed" to add sample content')
    }

    // Check published content
    console.log('3. Checking published content...')
    const publishedArticles = await prisma.article.count({
      where: { status: 'PUBLISHED' }
    })
    const publishedMetrics = await prisma.metric.count({
      where: { status: 'PUBLISHED' }
    })

    console.log(`   ✅ Published articles: ${publishedArticles}`)
    console.log(`   ✅ Published metrics: ${publishedMetrics}`)

    // Check environment variables
    console.log('4. Checking environment variables...')
    const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET']
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    if (missingVars.length === 0) {
      console.log('   ✅ Required environment variables found')
    } else {
      console.log(`   ❌ Missing environment variables: ${missingVars.join(', ')}`)
      console.log('   📝 Check your .env file')
    }

    // Summary
    console.log('\n🎉 Setup Check Complete!')
    console.log('\nNext steps:')
    console.log('1. Run "npm run dev" to start development server')
    console.log('2. Visit http://localhost:3000 to see your site')
    console.log('3. Check the homepage shows articles and metrics')
    console.log('4. Test the archive page and search functionality')
    console.log('\nOnce local development works:')
    console.log('- Push to GitHub: git push origin main')
    console.log('- Deploy to Vercel (see DEPLOY.md)')

  } catch (error) {
    console.log('\n❌ Setup check failed!')
    
    if (error.code === 'P1001') {
      console.log('🔧 Database connection failed:')
      console.log('   - Check your DATABASE_URL in .env file')
      console.log('   - Make sure PostgreSQL is running')
      console.log('   - For Supabase, verify the connection string')
    } else if (error.code === 'P2021') {
      console.log('🔧 Database tables not found:')
      console.log('   - Run "npm run db:push" to create tables')
      console.log('   - Then run "npm run seed" to add sample data')
    } else {
      console.log('Error details:', error.message)
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Check if this script is being run directly
if (require.main === module) {
  checkSetup()
}

module.exports = { checkSetup } 