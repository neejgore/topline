#!/usr/bin/env node

const { default: fetch } = require('node-fetch');
const { XMLParser } = require('fast-xml-parser');

// All 25 RSS sources to test
const RSS_SOURCES = [
  { name: 'AdExchanger', url: 'https://www.adexchanger.com/feed/' },
  { name: 'MarTech Today', url: 'https://martech.org/feed/' },
  { name: 'Digiday', url: 'https://digiday.com/feed/' },
  { name: 'Ad Age', url: 'https://adage.com/rss.xml' },
  { name: 'Marketing Land', url: 'https://marketingland.com/feed' },
  { name: 'Campaign US', url: 'https://www.campaignlive.com/rss' },
  { name: 'MediaPost - Online Media Daily', url: 'http://feeds.mediapost.com/online-media-daily' },
  { name: 'MediaPost - Media Daily News', url: 'http://feeds.mediapost.com/mediadailynews' },
  { name: 'MediaPost - TV News Daily', url: 'http://feeds.mediapost.com/television-news-daily' },
  { name: 'MediaPost - Social Media Marketing', url: 'http://feeds.mediapost.com/social-media-marketing-daily' },
  { name: 'VentureBeat Marketing', url: 'https://venturebeat.com/category/marketing/feed/' },
  { name: 'Advertising Age Marketing', url: 'https://adage.com/section/marketing/rss' },
  { name: 'Chief Marketer', url: 'https://www.chiefmarketer.com/feed/' },
  { name: 'Mobile Marketer', url: 'https://www.mobilemarketer.com/rss.xml' },
  { name: 'Retail Dive', url: 'https://www.retaildive.com/feeds/news/' },
  { name: 'Marketing Brew', url: 'https://www.marketingbrew.com/feed' },
  { name: 'Adweek', url: 'https://www.adweek.com/feed/' },
  { name: 'eMarketer', url: 'https://www.emarketer.com/rss/all/' },
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
  { name: 'Wall Street Journal CMO', url: 'https://feeds.wsj.com/WSJ-com/RSS/WSJCOM-marketing' },
  { name: 'Forbes CMO Network', url: 'https://www.forbes.com/sites/cmo/feed/' },
  { name: 'Harvard Business Review Marketing', url: 'https://feeds.hbr.org/harvardbusiness/marketing' },
  { name: 'Modern Healthcare', url: 'https://www.modernhealthcare.com/rss.xml' },
  { name: 'American Banker', url: 'https://www.americanbanker.com/feed' },
  { name: 'Automotive News', url: 'https://www.autonews.com/rss.xml' }
];

const parser = new XMLParser({
  ignoreAttributes: false,
  parseNodeValue: true,
  parseAttributeValue: true
});

async function testRSSFeed(source, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    console.log(`\n🔍 Testing: ${source.name}`);
    console.log(`   URL: ${source.url}`);
    
    const response = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ToplineBot/1.0; +https://topline.com)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return {
        name: source.name,
        url: source.url,
        status: 'FAILED',
        error: `HTTP ${response.status}: ${response.statusText}`,
        articles: 0
      };
    }
    
    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();
    
    if (!text || text.length < 100) {
      return {
        name: source.name,
        url: source.url,
        status: 'FAILED',
        error: 'Empty or too short response',
        articles: 0
      };
    }
    
    // Check if it's XML/RSS
    if (!text.includes('<rss') && !text.includes('<feed') && !text.includes('<?xml')) {
      return {
        name: source.name,
        url: source.url,
        status: 'FAILED',
        error: 'Not XML/RSS format',
        articles: 0
      };
    }
    
    // Parse XML
    const feed = parser.parse(text);
    let articles = 0;
    let latestDate = null;
    
    // Handle different RSS formats
    if (feed.rss && feed.rss.channel && feed.rss.channel.item) {
      const items = Array.isArray(feed.rss.channel.item) ? feed.rss.channel.item : [feed.rss.channel.item];
      articles = items.length;
      
      // Get latest article date
      if (items[0] && items[0].pubDate) {
        latestDate = new Date(items[0].pubDate);
      }
    } else if (feed.feed && feed.feed.entry) {
      const entries = Array.isArray(feed.feed.entry) ? feed.feed.entry : [feed.feed.entry];
      articles = entries.length;
      
      // Get latest entry date
      if (entries[0] && entries[0].published) {
        latestDate = new Date(entries[0].published);
      }
    }
    
    return {
      name: source.name,
      url: source.url,
      status: 'SUCCESS',
      articles: articles,
      latestDate: latestDate ? latestDate.toISOString().split('T')[0] : 'Unknown',
      contentType: contentType
    };
    
  } catch (error) {
    clearTimeout(timeoutId);
    return {
      name: source.name,
      url: source.url,
      status: 'FAILED',
      error: error.message,
      articles: 0
    };
  }
}

async function testAllFeeds() {
  console.log('🚀 TESTING ALL 25 RSS FEEDS...\n');
  console.log('=' .repeat(80));
  
  const results = [];
  const working = [];
  const broken = [];
  
  // Test all feeds in batches of 5 to avoid overwhelming servers
  for (let i = 0; i < RSS_SOURCES.length; i += 5) {
    const batch = RSS_SOURCES.slice(i, i + 5);
    const batchResults = await Promise.all(
      batch.map(source => testRSSFeed(source))
    );
    results.push(...batchResults);
    
    // Small delay between batches
    if (i + 5 < RSS_SOURCES.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Categorize results
  results.forEach(result => {
    if (result.status === 'SUCCESS') {
      working.push(result);
    } else {
      broken.push(result);
    }
  });
  
  // Display results
  console.log('\n' + '=' .repeat(80));
  console.log(`📊 FINAL RESULTS: ${working.length} WORKING / ${broken.length} BROKEN`);
  console.log('=' .repeat(80));
  
  if (working.length > 0) {
    console.log(`\n✅ WORKING SOURCES (${working.length}):`);
    console.log('-' .repeat(50));
    working.forEach((result, index) => {
      console.log(`${index + 1}. ${result.name}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   Articles: ${result.articles}, Latest: ${result.latestDate}`);
      console.log('');
    });
  }
  
  if (broken.length > 0) {
    console.log(`\n❌ BROKEN SOURCES (${broken.length}):`);
    console.log('-' .repeat(50));
    broken.forEach((result, index) => {
      console.log(`${index + 1}. ${result.name}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   Error: ${result.error}`);
      console.log('');
    });
  }
  
  return { working, broken, total: results.length };
}

// Run the test
testAllFeeds().then(({ working, broken, total }) => {
  console.log('=' .repeat(80));
  console.log(`🏁 COMPLETE: ${working.length}/${total} sources working`);
  
  if (broken.length > 0) {
    console.log(`\n🔧 NEXT STEPS: Fix ${broken.length} broken RSS feeds`);
    console.log('   - Find correct RSS URLs for broken sources');
    console.log('   - Update lib/content-sources.ts with working URLs');
    console.log('   - Re-test to ensure all 22 sources work');
  } else {
    console.log('\n🎉 ALL RSS FEEDS ARE WORKING!');
  }
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 