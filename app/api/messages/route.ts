import { NextResponse } from 'next/server';

// In-memory store untuk penampung pesan saat mode lokal offline
declare global {
  var __DEV_MESSAGES_STORE: Array<{
    id: string;
    username: string;
    sender: string;
    email: string;
    content: string;
    created_at: string;
    is_read: boolean;
  }> | undefined;
}

if (!global.__DEV_MESSAGES_STORE) {
  global.__DEV_MESSAGES_STORE = [
    {
      id: 'demo-1',
      username: 'aries',
      sender: 'TechBrand Agency (Brand Deal)',
      email: 'partnership@techbrand.io',
      content: '[CAMPAIGN INQUIRY - BRAND DEAL]\nCompany: TechBrand Agency\nSelected Bundle: Instagram: 1x Dedicated Reel Video ($150), Curiolot Bio: Top Spotlight Link Banner ($50)\nTotal Estimate: $180 (10% Bundle Discount Applied)\nPreferred Timeline: Next Month\n\nCampaign Brief: We would like to sponsor your upcoming tech reel showcase.',
      created_at: new Date().toISOString(),
      is_read: false,
    }
  ];
}

// GET: Mengambil daftar pesan untuk admin inbox
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = (searchParams.get('username') || 'aries').toLowerCase();

    const messages = (global.__DEV_MESSAGES_STORE || []).filter(
      (m) => m.username.toLowerCase() === username
    );

    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST: Menerima pengiriman brief dari halaman Media Kit publik
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, sender, email, content } = body;

    if (!content || !sender) {
      return NextResponse.json({ error: 'Sender and content are required' }, { status: 400 });
    }

    const newMessage = {
      id: Date.now().toString(),
      username: (username || 'aries').toLowerCase(),
      sender: sender.trim(),
      email: (email || '').trim(),
      content: content.trim(),
      created_at: new Date().toISOString(),
      is_read: false,
    };

    if (!global.__DEV_MESSAGES_STORE) {
      global.__DEV_MESSAGES_STORE = [];
    }

    global.__DEV_MESSAGES_STORE.unshift(newMessage);

    return NextResponse.json({
      success: true,
      message: 'Inquiry submitted successfully',
      data: newMessage,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit inquiry' }, { status: 500 });
  }
}