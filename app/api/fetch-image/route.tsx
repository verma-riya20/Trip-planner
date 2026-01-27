import { NextRequest, NextResponse } from 'next/server';

async function fetchFromUnsplash(location: string, page: number, resultIndex: number = 0, type: string = 'place', usedUrls: Set<string>) {
  try {
    let searchQuery = location;
    if (type === 'hotel') {
      searchQuery = `${location} hotel accommodation luxury`;
    } else if (type === 'place') {
      searchQuery = `${location} landmark tourism scenic`;
    }
    
    const encodedQuery = encodeURIComponent(searchQuery);
    const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodedQuery}&client_id=${process.env.UNSPLASH_ACCESS_KEY}&per_page=20&page=${page}&order_by=relevant`;
    
    const response = await fetch(unsplashUrl);
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      // Find first unused image
      for (let i = 0; i < data.results.length; i++) {
        const url = data.results[i].urls.regular;
        if (!usedUrls.has(url)) {
          usedUrls.add(url);
          return url;
        }
      }
      // If all are used, try next page
      if (page < 10) {
        return fetchFromUnsplash(location, page + 1, resultIndex, type, usedUrls);
      }
    }
  } catch (error) {
    console.error('Unsplash fetch error:', error);
  }
  return null;
}

async function fetchFromWikipedia(location: string, usedUrls: Set<string>) {
  try {
    const searchQuery = encodeURIComponent(location);
    const wikipediaUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${searchQuery}&prop=pageimages&format=json&pithumbsize=800&origin=*`;
    
    const response = await fetch(wikipediaUrl);
    const data = await response.json();
    
    const pages = data.query?.pages;
    if (pages) {
      const page = Object.values(pages)[0] as any;
      if (page.thumbnail?.source) {
        const imageUrl = page.thumbnail.source;
        if (!usedUrls.has(imageUrl)) {
          usedUrls.add(imageUrl);
          return imageUrl;
        }
      }
    }
  } catch (error) {
    console.error('Wikipedia fetch error:', error);
  }
  return null;
}

async function fetchGenericUnsplashFallback(type: string, usedUrls: Set<string>) {
  try {
    // Generic search terms as ultimate fallback
    const genericQueries = type === 'hotel' 
      ? ['luxury hotel', 'hotel room', 'resort', 'accommodation']
      : ['travel destination', 'tourist attraction', 'landmark', 'scenic view'];
    
    for (const query of genericQueries) {
      const encodedQuery = encodeURIComponent(query);
      const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodedQuery}&client_id=${process.env.UNSPLASH_ACCESS_KEY}&per_page=20&page=1&order_by=relevant`;
      
      const response = await fetch(unsplashUrl);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        // Find first unused image
        for (let i = 0; i < data.results.length; i++) {
          const url = data.results[i].urls.regular;
          if (!usedUrls.has(url)) {
            usedUrls.add(url);
            console.log(`✅ Generic fallback found: ${query}`);
            return url;
          }
        }
      }
    }
  } catch (error) {
    console.error('Generic Unsplash fallback error:', error);
  }
  return null;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  const location = request.nextUrl.searchParams.get('location');
  const type = request.nextUrl.searchParams.get('type') || 'place';
  const usedImagesParam = request.nextUrl.searchParams.get('usedImages') || '';
  
  // Reconstruct usedUrls Set from parameter
  const usedUrls = new Set<string>(usedImagesParam ? usedImagesParam.split('|').filter(u => u) : []);
  
  if (url) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error('Image fetch proxy error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch image', details: String(error) }, 
        { status: 500 }
      );
    }
  }

  if (location) {
    try {
      const randomPage = Math.floor(Math.random() * 5) + 1;
      
      console.log(`🔍 Fetching image for: ${location} (type: ${type}, usedCount: ${usedUrls.size})`);
      
      let imageUrl = null;
      let source = '';

      // Strategy 1: Try Wikipedia first
      imageUrl = await fetchFromWikipedia(location, usedUrls);
      if (imageUrl) {
        source = 'wikipedia';
        console.log(`✅ Got image from ${source}: ${location}`);
        return NextResponse.json({ 
          imageUrl, 
          source,
          location,
          type
        });
      }

      // Strategy 2: Try Unsplash with location name
      imageUrl = await fetchFromUnsplash(location, randomPage, 0, type, usedUrls);
      if (imageUrl) {
        source = 'unsplash';
        console.log(`✅ Got image from ${source}: ${location}`);
        return NextResponse.json({ 
          imageUrl, 
          source,
          location,
          type
        });
      }

      // Strategy 3: Generic Unsplash fallback (ULTIMATE FALLBACK)
      console.warn(`⚠️ No specific image found for ${location}, trying generic fallback...`);
      imageUrl = await fetchGenericUnsplashFallback(type, usedUrls);
      if (imageUrl) {
        source = 'unsplash-generic';
        console.log(`✅ Got generic fallback image for ${location}`);
        return NextResponse.json({ 
          imageUrl, 
          source,
          location,
          type
        });
      }
      
      // Strategy 4: Return reliable placeholder from Unsplash CDN
      console.warn(`⚠️ All fetching failed for ${location}, using default placeholder`);
      const defaultPlaceholder = type === 'hotel' 
        ? 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop'
        : 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop';
      
      return NextResponse.json({ 
        imageUrl: defaultPlaceholder,
        source: 'placeholder',
        location,
        type
      });
      
    } catch (error) {
      console.error('Image search error:', error);
      return NextResponse.json(
        { error: 'Failed to search images', details: String(error) }, 
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: 'URL or location parameter required' }, { status: 400 });
}