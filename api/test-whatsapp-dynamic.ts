import { VercelRequest, VercelResponse } from '@vercel/node';
import { DynamicWhatsAppService } from '../_utils/dynamicWhatsAppService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone, testType = 'verification' } = req.body;

    if (!phone) {
      return res.status(400).json({ 
        success: false,
        error: 'Phone number is required' 
      });
    }

    // Validate Indonesian phone number format
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone.startsWith('62') || cleanPhone.length < 11) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid Indonesian phone number format. Use format: 62xxxxxxxxx' 
      });
    }

    const whatsappService = new DynamicWhatsAppService();

    let result;
    if (testType === 'verification') {
      // Test verification message
      result = await whatsappService.sendVerificationMessage(
        phone,
        '123456', // Test verification code
        'Test User'
      );
    } else {
      // Test welcome message
      result = await whatsappService.sendWelcomeMessage(
        'Test User',
        phone
      );
    }

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: `✅ WhatsApp message sent successfully!`,
        details: {
          messageId: result.messageId,
          provider: result.providerName,
          responseTime: result.responseTime,
          logId: result.logId
        },
        recommendation: result.providerName 
          ? `${result.providerName} is working properly` 
          : 'Message sent successfully'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: `❌ Failed to send WhatsApp message: ${result.error}`,
        error: result.error,
        details: result.details || {}
      });
    }

  } catch (error) {
    console.error('Dynamic WhatsApp test error:', error);
    return res.status(500).json({
      success: false,
      message: '❌ Internal server error during WhatsApp test',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
