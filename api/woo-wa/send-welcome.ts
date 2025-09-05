import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phone, message, name } = await request.json();

    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    // Woo-WA API configuration
    const WOO_WA_API_KEY = process.env.WOO_WA_API_KEY;
    const WOO_WA_PHONE = process.env.WOO_WA_PHONE; // Your WhatsApp Business number

    if (!WOO_WA_API_KEY || !WOO_WA_PHONE) {
      console.log('Woo-WA not configured, simulating welcome message...');
      return NextResponse.json({ 
        success: true, 
        message: 'Welcome message sent (simulated)',
        data: { phone, name }
      });
    }

    // Send welcome message via Woo-WA
    const wooWaResponse = await fetch('https://api.woo-wa.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WOO_WA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phone,
        type: 'text',
        text: {
          body: message
        }
      }),
    });

    const wooWaData = await wooWaResponse.json();

    if (!wooWaResponse.ok) {
      console.error('Woo-WA API error:', wooWaData);
      return NextResponse.json(
        { error: 'Failed to send welcome message' },
        { status: 500 }
      );
    }

    console.log('Welcome message sent successfully:', {
      phone,
      name,
      messageId: wooWaData.id
    });

    return NextResponse.json({
      success: true,
      message: 'Welcome message sent successfully',
      data: {
        phone,
        name,
        messageId: wooWaData.id
      }
    });

  } catch (error) {
    console.error('Error in send-welcome endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
