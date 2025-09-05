# 🚀 PRODUCTION TESTING GUIDE - jbalwikobra.com

## 📋 **Testing WhatsApp Notifications on Production**

### 🔍 **Why Production Testing Makes Sense:**
- ✅ Real environment variables (Xendit keys, Supabase service role)
- ✅ Vercel deployment environment 
- ✅ Actual payment gateway integration
- ✅ Real webhook endpoints
- ✅ Production database with real data

### 🧪 **Step-by-Step Test Process:**

#### **1. Test Purchase Flow**
1. Go to https://jbalwikobra.com
2. Browse products and select one to buy
3. Go through the purchase process
4. Make a real payment (small amount)
5. Check if WhatsApp notification is received

#### **2. Monitor What Happens**
- Check if order is created in database
- Verify if Xendit webhook is called
- Confirm WhatsApp API call is made

#### **3. Debug Endpoints Available**
```bash
# Test WhatsApp API directly (if needed)
curl -X POST "https://jbalwikobra.com/api/debug-whatsapp" \
  -H "Content-Type: application/json"

# Check if invoice creation works
curl -X POST "https://jbalwikobra.com/api/xendit/create-invoice" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10000,
    "description": "Test Product",
    "order": {
      "customer_name": "Test Customer",
      "customer_email": "test@example.com",
      "customer_phone": "+6289653510125",
      "amount": 10000,
      "order_type": "purchase"
    }
  }'
```

### 🎯 **What to Look For:**

#### **✅ Success Indicators:**
- Order appears in admin panel (/admin/orders)
- WhatsApp message received in group
- Payment status updates correctly

#### **❌ Failure Points to Check:**
- Order not created → Invoice creation issue
- Order created but no WhatsApp → Webhook not firing
- Webhook fires but no message → WhatsApp API issue

### 🔧 **Immediate Actions:**

1. **Test Now**: Try a real purchase on jbalwikobra.com
2. **Check Admin**: Go to /admin/orders to see if order appears
3. **Monitor WhatsApp**: Check the group for notifications
4. **Report Results**: Let me know what happens at each step

### 📱 **WhatsApp Group Info:**
- **Group ID**: 120363421819020887@g.us
- **API**: notifapi.com
- **Test Status**: ✅ Confirmed working (direct API test successful)

## 🚀 **Ready to Test!**

The production environment has all the necessary configurations. Let's test the real purchase flow and see exactly where the issue occurs.

**Go ahead and try purchasing a product on jbalwikobra.com - I'll help debug any issues we find!**
