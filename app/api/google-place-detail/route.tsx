import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { placeName } = await req.json();

        const apiKey = process.env.GOOGLE_PLACE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Missing GOOGLE_PLACE_API_KEY" }, { status: 400 });
        }

        // Use the Places Text Search webservice which accepts the API key as a query parameter.
        const BASE_URL = `https://maps.googleapis.com/maps/api/place/textsearch/json`;
        const url = `${BASE_URL}?query=${encodeURIComponent(placeName ?? "")}&key=${apiKey}`;

        const result = await axios.get(url);

        // If Google returns an error status, forward a helpful message.
        if (result?.status !== 200) {
            return NextResponse.json({ error: 'Google Places API error', details: result?.data }, { status: result?.status ?? 502 });
        }

        return NextResponse.json(result.data);
    } catch (err: any) {
        // If axios error and response exists, include the status and data for debugging
        if (err?.response) {
            return NextResponse.json({ error: 'Upstream request failed', status: err.response.status, data: err.response.data }, { status: err.response.status });
        }

        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}