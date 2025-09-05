const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xeithuvgldzxnggxadri.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjMzMjEsImV4cCI6MjA3MjAzOTMyMX0.g8n_0wiTn7BQK_uujfU9d4zqb5lSQcW6oGC8GxIhjAQ'
);

async function testFooterData() {
  try {
    const { data, error } = await supabase
      .from('website_settings')
      .select('*')
      .limit(1)
      .maybeSingle();
      
    if (error) {
      console.error('Database error:', error);
      return;
    }

    if (!data) {
      console.log('No data found in website_settings table');
      return;
    }

    console.log('\n=== FOOTER DATA ANALYSIS ===');
    console.log('Site Name:', data.site_name || 'NOT SET');
    console.log('WhatsApp Number:', data.whatsapp_number || 'NOT SET');
    console.log('Contact Email:', data.contact_email || 'NOT SET');
    console.log('Contact Phone:', data.contact_phone || 'NOT SET');
    console.log('Address:', data.address || 'NOT SET');
    console.log('Facebook URL:', data.facebook_url || 'NOT SET');
    console.log('Instagram URL:', data.instagram_url || 'NOT SET');
    console.log('TikTok URL:', data.tiktok_url || 'NOT SET');

    console.log('\n=== ISSUES FOUND ===');
    const issues = [];
    
    if (!data.contact_email) issues.push('- Contact email is empty');
    if (!data.address) issues.push('- Address is empty');
    if (!data.facebook_url) issues.push('- Facebook URL is empty');
    if (!data.instagram_url) issues.push('- Instagram URL is empty');
    if (!data.tiktok_url) issues.push('- TikTok URL is empty');
    
    if (issues.length === 0) {
      console.log('No issues found! All footer data is properly set.');
    } else {
      issues.forEach(issue => console.log(issue));
    }

    console.log('\n=== WHAT FOOTER SHOULD SHOW ===');
    console.log('Site Name: JB Alwikobra');
    console.log('WhatsApp: +085693891473');
    console.log('Email: admin@jbalwikobra.com');
    console.log('Address: BEKASI KOTA');
    console.log('Facebook: https://www.facebook.com/alwikobraasli');
    console.log('Instagram: https://www.instagram.com/alwikobrastoreasli');
    console.log('TikTok: https://www.tiktok.com/@alwikobrastorejb');

  } catch (e) {
    console.error('Error testing footer data:', e.message);
  }
}

testFooterData();
