import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

/**
 * Free-only place lookup:
 * 1. Wikipedia (Wikimedia API) → landmark images (preferred)
 * 2. Unsplash → fallback
 *
 * Returns:
 * { imageUrl, source }
 */

// Required by Wikimedia API
const WIKI_HEADERS = {
  "User-Agent": "TripPlannerApp/1.0 (contact: riya204verma@gmail.com)",
  Accept: "application/json",
};

const TIMEOUT = 15000;

/* ----------------------------- Wikipedia ----------------------------- */
const fetchWikipediaImage = async (placeName: string) => {
  const retries = 3;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Step 1: search page
      const searchUrl =
        "https://en.wikipedia.org/w/api.php" +
        `?action=query&list=search&srsearch=${encodeURIComponent(placeName)}` +
        "&srlimit=1&format=json";

      const searchRes = await axios.get(searchUrl, {
        timeout: TIMEOUT,
        headers: WIKI_HEADERS,
      });

      const result = searchRes.data?.query?.search?.[0];
      if (!result?.pageid) return null;

      // Step 2: fetch page image
      const imageUrl =
        "https://en.wikipedia.org/w/api.php" +
        `?action=query&prop=pageimages&format=json&pageids=${result.pageid}` +
        "&pithumbsize=800";

      const imageRes = await axios.get(imageUrl, {
        timeout: TIMEOUT,
        headers: WIKI_HEADERS,
      });

      const page = imageRes.data?.query?.pages?.[result.pageid];
      return page?.thumbnail?.source || null;
    } catch (err: any) {
      console.error(
        `❌ Wikimedia fetch error (attempt ${attempt + 1}):`,
        err?.response?.status || err.message
      );
      if (attempt === retries - 1) return null;
    }
  }

  return null;
};

/* ----------------------------- Unsplash ----------------------------- */
const fetchUnsplashImage = async (query: string) => {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;

  try {
    const url =
      "https://api.unsplash.com/search/photos" +
      `?query=${encodeURIComponent(query)}` +
      "&per_page=1&orientation=landscape";

    const res = await axios.get(url, {
      timeout: TIMEOUT,
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    });

    return res.data?.results?.[0]?.urls?.regular || null;
  } catch (err: any) {
    console.error("❌ Unsplash fetch error:", err.message);
    return null;
  }
};

/* ----------------------------- Health Check ----------------------------- */
export async function GET() {
  return NextResponse.json({
    status: "place-lookup endpoint working",
    timestamp: new Date().toISOString(),
  });
}

/* ----------------------------- Main Handler ----------------------------- */
export async function POST(req: NextRequest) {
  try {
    const { placeName } = await req.json();

    if (!placeName || typeof placeName !== "string") {
      return NextResponse.json(
        { error: "missing or invalid placeName" },
        { status: 400 }
      );
    }

    // 1️⃣ Wikipedia first (best for landmarks)
    const wikiImage = await fetchWikipediaImage(placeName);
    if (wikiImage) {
      return NextResponse.json({
        imageUrl: wikiImage,
        source: "wikipedia",
      });
    }

    // 2️⃣ Unsplash fallback
    const unsplashImage = await fetchUnsplashImage(placeName);
    if (unsplashImage) {
      return NextResponse.json({
        imageUrl: unsplashImage,
        source: "unsplash",
      });
    }

    return NextResponse.json(
      { error: "no image found" },
      { status: 404 }
    );
  } catch (err: any) {
    console.error("❌ Place lookup error:", err.message);
    return NextResponse.json(
      { error: "internal_server_error" },
      { status: 500 }
    );
  }
}
