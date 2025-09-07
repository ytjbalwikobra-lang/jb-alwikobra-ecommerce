import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface WhatsAppProvider {
  id: string;
  name: string;
  display_name: string;
  base_url: string;
  send_message_endpoint: string;
  async_send_message_endpoint: string;
  phone_field_name: string;
  key_field_name: string;
  message_field_name: string;
  success_status_field: string;
  success_status_value: string;
  message_id_field: string;
  settings: any;
}

interface WhatsAppApiKey {
  api_key: string;
  key_id: string;
  provider_config: WhatsAppProvider;
}

interface SendMessageOptions {
  phone: string;
  message: string;
  messageType?: 'text' | 'image' | 'file';
  mediaUrl?: string;
  contextType?: string;
  contextId?: string;
  useAsync?: boolean;
}

interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: string;
  responseTime?: number;
}

export class DynamicWhatsAppService {
  
  /**
   * Get the best available API key for a provider
   */
  private async getActiveApiKey(providerName: string = 'woo-wa'): Promise<WhatsAppApiKey | null> {
    try {
      const { data, error } = await supabase.rpc('get_active_api_key', {
        provider_name: providerName
      });

      if (error) {
        console.error('Error getting API key:', error);
        return null;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error in getActiveApiKey:', error);
      return null;
    }
  }

  /**
   * Send WhatsApp message using dynamic provider configuration
   */
  async sendMessage(options: SendMessageOptions): Promise<SendMessageResult> {
    const startTime = Date.now();
    
    try {
      // Get active API configuration
      const apiConfig = await this.getActiveApiKey();
      if (!apiConfig) {
        return {
          success: false,
          error: 'No active WhatsApp API configuration found'
        };
      }

      const { api_key, key_id, provider_config } = apiConfig;
      const provider = provider_config;

      // Build API endpoint
      const endpoint = options.useAsync && provider.async_send_message_endpoint
        ? provider.async_send_message_endpoint
        : provider.send_message_endpoint;
      
      const apiUrl = `${provider.base_url}${endpoint}`;

      // Build request body using dynamic field names
      const requestBody: any = {};
      requestBody[provider.phone_field_name] = this.formatPhoneNumber(options.phone);
      requestBody[provider.key_field_name] = api_key;
      requestBody[provider.message_field_name] = options.message;

      // Add media URL if provided
      if (options.mediaUrl && provider.settings?.supports_media) {
        requestBody.url = options.mediaUrl;
      }

      console.log(`📱 Sending WhatsApp via ${provider.display_name}:`, {
        provider: provider.name,
        endpoint: apiUrl,
        phone: options.phone,
        messageLength: options.message.length
      });

      // Make API request
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();
      const responseTime = Date.now() - startTime;

      // Check success based on provider configuration
      const isSuccess = this.isResponseSuccessful(responseData, provider);
      const messageId = this.extractMessageId(responseData, provider);

      // Log the message
      await this.logMessage({
        apiKeyId: key_id,
        phone: options.phone,
        messageType: options.messageType || 'text',
        messageContent: options.message,
        requestBody,
        responseBody: responseData,
        responseStatus: response.status,
        success: isSuccess,
        messageId,
        contextType: options.contextType,
        contextId: options.contextId,
        responseTime
      });

      if (isSuccess) {
        console.log(`✅ WhatsApp sent successfully via ${provider.display_name}:`, {
          messageId,
          responseTime: `${responseTime}ms`
        });

        return {
          success: true,
          messageId,
          provider: provider.display_name,
          responseTime
        };
      } else {
        console.error(`❌ WhatsApp sending failed via ${provider.display_name}:`, responseData);

        return {
          success: false,
          error: responseData.message || responseData.error || 'Unknown error',
          provider: provider.display_name,
          responseTime
        };
      }

    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error('WhatsApp service error:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        responseTime
      };
    }
  }

  /**
   * Send verification code via WhatsApp
   */
  async sendVerificationCode(phone: string, code: string): Promise<SendMessageResult> {
    const message = `🔐 *Kode Verifikasi JB Alwikobra*

Kode verifikasi Anda: *${code}*

⏰ Kode ini berlaku selama 15 menit
🔒 Jangan bagikan kode ini kepada siapapun

Setelah verifikasi, Anda akan diminta melengkapi profil dengan email dan nama.

---
🎮 *JB Alwikobra E-commerce*
Premium Game Accounts & Services`;

    return this.sendMessage({
      phone,
      message,
      messageType: 'text',
      contextType: 'verification',
      contextId: code
    });
  }

  /**
   * Send welcome message via WhatsApp
   */
  async sendWelcomeMessage(name: string, phone: string, email?: string): Promise<SendMessageResult> {
    const message = `🎮 *Selamat Datang di JB Alwikobra!*

Halo ${name}! 👋

Terima kasih telah bergabung dengan JB Alwikobra E-commerce - tempat terpercaya untuk game account premium!

🚀 *Sekarang Anda bisa:*
✅ Berbelanja game account terbaik
✅ Menyimpan wishlist favorit
✅ Tracking riwayat pesanan
✅ Mendapat notifikasi WhatsApp otomatis

🎯 *Fitur Unggulan:*
• Game account berkualitas tinggi
• Proses cepat & aman
• Support 24/7 via WhatsApp
• Garansi kepuasan pelanggan

📱 *Mulai belanja sekarang:*
${process.env.REACT_APP_SITE_URL || 'https://jbalwikobra.com'}

${email ? `📧 Email terdaftar: ${email}` : ''}

---
🎮 *JB Alwikobra E-commerce*
Premium Game Accounts & Services

Ada pertanyaan? Balas pesan ini! 💬`;

    return this.sendMessage({
      phone,
      message,
      messageType: 'text',
      contextType: 'welcome',
      contextId: `${name}-${Date.now()}`
    });
  }

  /**
   * Check if response indicates success based on provider configuration
   */
  private isResponseSuccessful(responseData: any, provider: WhatsAppProvider): boolean {
    if (!responseData) return false;

    const statusField = provider.success_status_field;
    const expectedValue = provider.success_status_value;

    // Check main status field
    if (responseData[statusField] === expectedValue) {
      return true;
    }

    // Check nested results field (common in some APIs)
    if (responseData.results && responseData.results[statusField] === expectedValue) {
      return true;
    }

    // For mock API, check success field
    if (provider.name === 'mock' && responseData.status === 'sent') {
      return true;
    }

    return false;
  }

  /**
   * Extract message ID from response based on provider configuration
   */
  private extractMessageId(responseData: any, provider: WhatsAppProvider): string | undefined {
    const messageIdField = provider.message_id_field;

    // Check main level
    if (responseData[messageIdField]) {
      return responseData[messageIdField];
    }

    // Check nested results
    if (responseData.results && responseData.results[messageIdField]) {
      return responseData.results[messageIdField];
    }

    // Fallback fields
    return responseData.id_message || responseData.message_id || responseData.id;
  }

  /**
   * Format phone number for Indonesian format
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Convert to Indonesian format (62xxx)
    if (cleaned.startsWith('8')) {
      cleaned = '62' + cleaned;
    } else if (cleaned.startsWith('08')) {
      cleaned = '62' + cleaned.substring(1);
    } else if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    }
    
    return cleaned;
  }

  /**
   * Log message to database
   */
  private async logMessage(params: {
    apiKeyId: string;
    phone: string;
    messageType: string;
    messageContent: string;
    requestBody: any;
    responseBody: any;
    responseStatus: number;
    success: boolean;
    messageId?: string;
    contextType?: string;
    contextId?: string;
    responseTime: number;
  }): Promise<void> {
    try {
      await supabase.rpc('log_whatsapp_message', {
        p_api_key_id: params.apiKeyId,
        p_phone_number: params.phone,
        p_message_type: params.messageType,
        p_message_content: params.messageContent,
        p_request_body: params.requestBody,
        p_response_body: params.responseBody,
        p_response_status: params.responseStatus,
        p_success: params.success,
        p_message_id: params.messageId,
        p_context_type: params.contextType,
        p_context_id: params.contextId,
        p_response_time_ms: params.responseTime
      });
    } catch (error) {
      console.error('Error logging WhatsApp message:', error);
    }
  }

  /**
   * Get all available providers
   */
  async getProviders(): Promise<WhatsAppProvider[]> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_providers')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error getting providers:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getProviders:', error);
      return [];
    }
  }

  /**
   * Add new API key for a provider
   */
  async addApiKey(providerName: string, keyName: string, apiKey: string, isPrimary: boolean = false): Promise<boolean> {
    try {
      // Get provider ID
      const { data: provider } = await supabase
        .from('whatsapp_providers')
        .select('id')
        .eq('name', providerName)
        .single();

      if (!provider) {
        console.error('Provider not found:', providerName);
        return false;
      }

      // If setting as primary, unset other primary keys
      if (isPrimary) {
        await supabase
          .from('whatsapp_api_keys')
          .update({ is_primary: false })
          .eq('provider_id', provider.id);
      }

      // Insert new key
      const { error } = await supabase
        .from('whatsapp_api_keys')
        .insert({
          provider_id: provider.id,
          key_name: keyName,
          api_key: apiKey,
          is_primary: isPrimary,
          is_active: true
        });

      if (error) {
        console.error('Error adding API key:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in addApiKey:', error);
      return false;
    }
  }

  /**
   * Get message logs with filtering
   */
  async getMessageLogs(filters: {
    phone?: string;
    contextType?: string;
    success?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<any[]> {
    try {
      let query = supabase
        .from('whatsapp_message_logs')
        .select(`
          *,
          whatsapp_providers(name, display_name),
          whatsapp_api_keys(key_name)
        `)
        .order('created_at', { ascending: false });

      if (filters.phone) {
        query = query.eq('phone_number', filters.phone);
      }

      if (filters.contextType) {
        query = query.eq('context_type', filters.contextType);
      }

      if (filters.success !== undefined) {
        query = query.eq('success', filters.success);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error getting message logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getMessageLogs:', error);
      return [];
    }
  }
}

// Export singleton instance
export const whatsappService = new DynamicWhatsAppService();
