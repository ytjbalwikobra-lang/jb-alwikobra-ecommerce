/* eslint-disable @typescript-eslint/no-unused-vars */
import { createClient } from '@supabase/supabase-js';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

// WhatsApp Service using Woo-wa.com API (notifapi.com)
// This service handles WhatsApp notifications through Woo-wa platform
export class WhatsAppService {
  private static API_KEY = process.env.REACT_APP_WHATSAPP_API_KEY || 'f104a4c19ea118dd464e9de20605c4e5';
  private static API_BASE_URL = 'https://notifapi.com'; // Woo-wa.com uses notifapi.com
  
    // Woo-wa.com API endpoints
  private static ENDPOINTS = {
    SEND_MESSAGE: '/send_message',
    ASYNC_SEND_MESSAGE: '/async_send_message',
    SEND_MESSAGE_GROUP: '/send_message_group_id',
    ASYNC_SEND_MESSAGE_GROUP: '/async_send_message_group_id',
    SEND_IMAGE: '/send_image_url',
    SEND_FILE: '/send_file_url',
    CHECK_STATUS: '/qr_status',
    GET_INFO: '/info',
    SCHEDULER: '/scheduler'
  };

  // WhatsApp Group ID for order notifications
  private static ORDER_GROUP_ID = '120363421819020887@g.us'; // "ORDERAN WEBSITE" group

  // Group configurations
  private static GROUP_IDS = {
    ORDERAN_WEBSITE: '120363421819020887@g.us'
  };

  /**
   * Test the WhatsApp API key with Woo-wa.com service
   */
  static async testApiKey(phoneNumber: string = '6281234567890'): Promise<{ 
    success: boolean; 
    provider?: string; 
    endpoint?: string; 
    error?: string;
    response?: any;
  }> {
    const testMessage = `🧪 Test pesan dari JB Alwikobra E-commerce
    
Ini adalah test notifikasi WhatsApp API melalui Woo-wa.com
Waktu: ${new Date().toLocaleString('id-ID')}
Key: ${this.API_KEY.substring(0, 8)}...

Jika Anda menerima pesan ini, API key berhasil dikonfigurasi! ✅`;

    try {
      console.log('🧪 Testing Woo-wa.com API with key:', this.API_KEY);

      // First, check if device is connected and active
      const statusResponse = await fetch(`${this.API_BASE_URL}${this.ENDPOINTS.CHECK_STATUS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: this.API_KEY
        })
      });

      const statusData = await statusResponse.json();
      console.log('📱 Device status:', statusData);

      // Test sending message
      const messageResponse = await fetch(`${this.API_BASE_URL}${this.ENDPOINTS.SEND_MESSAGE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone_no: phoneNumber,
          key: this.API_KEY,
          message: testMessage
        })
      });

      const messageData = await messageResponse.json();
      console.log('📩 Message response:', messageData);

      if (messageResponse.ok && messageData.status === 'success') {
        return {
          success: true,
          provider: 'Woo-wa.com (NotifAPI)',
          endpoint: this.API_BASE_URL,
          response: messageData
        };
      } else {
        return {
          success: false,
          provider: 'Woo-wa.com (NotifAPI)',
          endpoint: this.API_BASE_URL,
          error: messageData.message || messageData.error || 'Test message failed',
          response: messageData
        };
      }
    } catch (error) {
      console.error('❌ Error testing Woo-wa API:', error);
      return {
        success: false,
        provider: 'Woo-wa.com (NotifAPI)',
        endpoint: this.API_BASE_URL,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Send order notification to customer
   */
  static async sendOrderNotification(
    phoneNumber: string,
    orderData: {
      orderId: string;
      productName: string;
      amount: number;
      status: 'pending' | 'paid' | 'completed' | 'cancelled';
      customerName: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const message = this.generateOrderNotificationMessage(orderData);
      
      // Try to send with the working provider (you'll need to store this after testing)
      const result = await this.sendMessage(phoneNumber, message);
      
      return result;
    } catch (error) {
      console.error('Failed to send order notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send payment confirmation to customer
   */
  static async sendPaymentConfirmation(
    phoneNumber: string,
    orderData: {
      orderId: string;
      productName: string;
      amount: number;
      customerName: string;
      paymentMethod: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const message = this.generatePaymentConfirmationMessage(orderData);
      const result = await this.sendMessage(phoneNumber, message);
      
      return result;
    } catch (error) {
      console.error('Failed to send payment confirmation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send order notification to "Orderan Website" group
   */
  static async sendOrderGroupNotification(
    orderData: {
      orderId: string;
      productName: string;
      amount: number;
      customerName: string;
      customerPhone: string;
      status: 'pending' | 'paid' | 'completed' | 'cancelled';
      paymentMethod?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const message = this.generateOrderGroupNotificationMessage(orderData);
      const result = await this.sendGroupMessage(this.GROUP_IDS.ORDERAN_WEBSITE, message);
      
      // Also log to console for debugging
      console.log(`📊 Order notification sent to group: ${orderData.orderId}`);
      
      return result;
    } catch (error) {
      console.error('Failed to send order group notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send generic message using Woo-wa.com API
   */
  private static async sendMessage(
    phoneNumber: string,
    message: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`📱 Sending WhatsApp message via Woo-wa.com to ${phoneNumber}:`, message);
      
      const response = await fetch(`${this.API_BASE_URL}${this.ENDPOINTS.SEND_MESSAGE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone_no: phoneNumber,
          key: this.API_KEY,
          message: message
        })
      });

      const data = await response.json();
      console.log('📩 Woo-wa API response:', data);

      if (response.ok && data.status === 'success') {
        return { success: true };
      } else {
        console.error('❌ Failed to send message:', data);
        
        // Fallback: Generate WhatsApp web URL
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        console.log(`� WhatsApp web fallback: ${whatsappUrl}`);
        
        return {
          success: false,
          error: data.message || data.error || 'Failed to send via Woo-wa API, please use WhatsApp web link'
        };
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      // Fallback: Generate WhatsApp web URL
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      console.log(`🔗 WhatsApp web fallback: ${whatsappUrl}`);
      
      return {
        success: false,
        error: 'Network error - please use WhatsApp web link as fallback'
      };
    }
  }

  /**
   * Send message to WhatsApp group
   */
  private static async sendGroupMessage(
    groupId: string,
    message: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`👥 Sending WhatsApp group message via Woo-wa.com to group ${groupId}:`, message);
      
      const response = await fetch(`${this.API_BASE_URL}${this.ENDPOINTS.SEND_MESSAGE_GROUP}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          group_id: groupId,
          key: this.API_KEY,
          message: message
        })
      });

      const data = await response.json();
      console.log('📩 Woo-wa Group API response:', data);

      if (response.ok && data.status === 'success') {
        return { success: true };
      } else {
        console.error('❌ Failed to send group message:', data);
        return {
          success: false,
          error: data.message || data.error || 'Failed to send group message via Woo-wa API'
        };
      }
    } catch (error) {
      console.error('❌ Error sending group message:', error);
      return {
        success: false,
        error: 'Network error - failed to send group message'
      };
    }
  }

  /**
   * Generate order notification message
   */
  private static generateOrderNotificationMessage(orderData: {
    orderId: string;
    productName: string;
    amount: number;
    status: string;
    customerName: string;
  }): string {
    const statusEmoji = {
      pending: '⏳',
      paid: '✅',
      completed: '🎉',
      cancelled: '❌'
    };

    const statusText = {
      pending: 'Menunggu Pembayaran',
      paid: 'Pembayaran Berhasil',
      completed: 'Pesanan Selesai',
      cancelled: 'Pesanan Dibatalkan'
    };

    return `🛍️ *Update Pesanan JB Alwikobra*

Halo ${orderData.customerName}! 👋

${statusEmoji[orderData.status as keyof typeof statusEmoji]} *Status:* ${statusText[orderData.status as keyof typeof statusText]}

📋 *Detail Pesanan:*
• Order ID: ${orderData.orderId}
• Produk: ${orderData.productName}
• Total: Rp ${orderData.amount.toLocaleString('id-ID')}

${orderData.status === 'paid' 
  ? '🎮 Akun game akan segera diproses dan dikirim dalam 1x24 jam!'
  : orderData.status === 'pending'
  ? '💳 Silakan selesaikan pembayaran untuk melanjutkan pesanan.'
  : ''}

Terima kasih telah berbelanja di JB Alwikobra! 🙏

---
*JB Alwikobra - Trusted Gaming Account Provider*
🌐 https://jbalwikobra.com`;
  }

  /**
   * Generate payment confirmation message
   */
  private static generatePaymentConfirmationMessage(orderData: {
    orderId: string;
    productName: string;
    amount: number;
    customerName: string;
    paymentMethod: string;
  }): string {
    return `💳 *Konfirmasi Pembayaran JB Alwikobra*

Halo ${orderData.customerName}! 👋

✅ Pembayaran Anda telah diterima!

📋 *Detail Transaksi:*
• Order ID: ${orderData.orderId}
• Produk: ${orderData.productName}
• Total: Rp ${orderData.amount.toLocaleString('id-ID')}
• Metode: ${orderData.paymentMethod}

🎮 *Langkah Selanjutnya:*
1. Akun game akan diproses tim kami
2. Estimasi pengiriman: 1x24 jam
3. Anda akan di WhatsApp saat akun siap oleh tim kami

Ada pertanyaan? Hubungi admin kami! 💬

Terima kasih telah mempercayai JB Alwikobra! 🙏

---
*JB Alwikobra - Marketplace Akun Game #1 Indonesia*
🌐 https://jbalwikobra.com`;
  }

  /**
   * Generate order group notification message for "Orderan Website" group
   */
  private static generateOrderGroupNotificationMessage(orderData: {
    orderId: string;
    productName: string;
    amount: number;
    customerName: string;
    customerPhone: string;
    status: 'pending' | 'paid' | 'completed' | 'cancelled';
    paymentMethod?: string;
  }): string {
    const statusEmoji = {
      pending: '🟡',
      paid: '🟢',
      completed: '🎉',
      cancelled: '🔴'
    };

    const statusText = {
      pending: 'ORDER BARU - MENUNGGU BAYAR',
      paid: 'PEMBAYARAN BERHASIL',
      completed: 'ORDER SELESAI',
      cancelled: 'ORDER DIBATALKAN'
    };

    const currentDate = new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `${statusEmoji[orderData.status]} *${statusText[orderData.status]}*

📋 *DETAIL ORDER:*
• ID: #${orderData.orderId}
• Produk: ${orderData.productName}
• Total: Rp ${orderData.amount.toLocaleString('id-ID')}
• Customer: ${orderData.customerName}
• Phone: ${orderData.customerPhone}
${orderData.paymentMethod ? `• Payment: ${orderData.paymentMethod}` : ''}
• Waktu: ${currentDate}

${orderData.status === 'paid' 
  ? '🎮 *ACTION REQUIRED:* Segera proses akun game untuk customer!'
  : orderData.status === 'pending'
  ? '💳 *STATUS:* Menunggu konfirmasi pembayaran customer'
  : orderData.status === 'completed'
  ? '✅ *STATUS:* Akun sudah berhasil dikirim ke customer'
  : '❌ *STATUS:* Order dibatalkan atau refund'
}

---
📊 *ORDERAN WEBSITE - JB ALWIKOBRA*`;
  }

  /**
   * Log WhatsApp activity to Supabase
   */
  static async logWhatsAppActivity(
    phoneNumber: string,
    message: string,
    status: 'sent' | 'failed',
    orderId?: string
  ): Promise<void> {
    try {
      // Reuse existing singleton supabase client to avoid multiple GoTrueClient instances
      const { supabase } = await import('./supabase');
      if (!supabase) {
        console.warn('Supabase not configured, skipping WhatsApp log');
        return;
      }

      await (supabase as any).from('whatsapp_logs').insert({
        phone_number: phoneNumber,
        message: message.substring(0, 1000), // Limit message length
        status,
        order_id: orderId,
        api_key_used: this.API_KEY.substring(0, 8) + '...',
        sent_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log WhatsApp activity:', error);
    }
  }
}

export default WhatsAppService;
