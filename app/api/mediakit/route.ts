import { NextResponse } from 'next/server';

// Penyimpanan data lokal saat offline
const localMediaKitStore: Record<string, any> = {};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = (searchParams.get('username') || 'aries').toLowerCase();

    const data = localMediaKitStore[username] || {
      headline: 'Content Creator & Brand Partner',
      about: 'I produce high-retention content and creative digital showcases. Open for sponsored integrations, dedicated reviews, and long-term brand partnerships.',
      contact_email: '',
      total_followers: 50000,
      monthly_impressions: 250000,
      engagement_rate: 4.8,
      primary_niche: 'Tech & Lifestyle',
      audience_country: 'JAPAN',
      rate_cards: [
        {
          id: '1',
          platform: 'Instagram',
          deliverable: '1x Dedicated Reel Video',
          price: 150,
          description: 'Includes 30 days usage rights and link in bio.',
        },
        {
          id: '2',
          platform: 'Curiolot Bio',
          deliverable: 'Top Spotlight Link Banner (30 Days)',
          price: 50,
          description: 'Fixed top-level biolink card with HOT badge & neon glow.',
        },
        {
          id: '3',
          platform: 'YouTube',
          deliverable: '1x Full Dedicated Video Review',
          price: 250,
          description: 'Video ulasan mendalam durasi 8-10 menit dengan tautan produk di deskripsi.',
        },
      ],
    };

    return NextResponse.json({ success: true, mediakit: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    // Jika username kosong dari frontend, gunakan 'aries' secara otomatis
    const username = (body.username || 'aries').toLowerCase();
    const mediaKitData = body.mediaKitData || body;

    localMediaKitStore[username] = {
      ...mediaKitData,
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Media kit saved successfully',
      mediakit: localMediaKitStore[username],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}