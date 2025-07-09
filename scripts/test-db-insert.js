const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testDatabaseInsert() {
  console.log('🧪 Testing manual database insert...')
  
  const testArticle = {
    title: 'Test Article ' + Date.now(),
    summary: 'This is a test article to check database functionality',
    sourceUrl: 'https://example.com/test-' + Date.now(),
    sourceName: 'Test Source',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    vertical: 'Technology & Media',
    status: 'PUBLISHED',
    priority: 'MEDIUM',
    category: 'NEWS',
    whyItMatters: 'This is a test why it matters',
    talkTrack: 'This is a test talk track',
    importanceScore: 0,
    views: 0,
    clicks: 0,
    shares: 0
  }
  
  console.log('📝 Inserting test article:', JSON.stringify(testArticle, null, 2))
  
  const { data, error } = await supabase
    .from('articles')
    .insert(testArticle)
    .select()
  
  if (error) {
    console.error('❌ Error inserting test article:', error)
    return false
  }
  
  console.log('✅ Successfully inserted test article:', data)
  
  // Check if we can fetch it back
  const { data: fetchedArticle, error: fetchError } = await supabase
    .from('articles')
    .select('*')
    .eq('sourceUrl', testArticle.sourceUrl)
    .single()
  
  if (fetchError) {
    console.error('❌ Error fetching test article:', fetchError)
    return false
  }
  
  console.log('✅ Successfully fetched test article:', fetchedArticle)
  
  // Clean up - delete the test article
  const { error: deleteError } = await supabase
    .from('articles')
    .delete()
    .eq('id', fetchedArticle.id)
  
  if (deleteError) {
    console.error('❌ Error deleting test article:', deleteError)
  } else {
    console.log('✅ Successfully deleted test article')
  }
  
  return true
}

testDatabaseInsert().catch(console.error) 