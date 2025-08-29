# Test Xendit API locally without Vercel CLI
import os
import json
import requests
from datetime import datetime

# Mock environment variables for testing
os.environ['XENDIT_SECRET_KEY'] = 'xnd_production_8atm8xMVUWRIfw9uAP07lViSrVkusuaiSlYGJU1ydIjbAKuORUbjzy82ZP8Tx1'

def test_xendit_api():
    """Test creating a Xendit invoice directly"""
    secret_key = os.environ.get('XENDIT_SECRET_KEY')
    if not secret_key:
        print("❌ XENDIT_SECRET_KEY not set")
        return
    
    # Prepare invoice data
    invoice_data = {
        'external_id': f'test_{int(datetime.now().timestamp())}',
        'amount': 10000,
        'payer_email': 'test@example.com',
        'description': 'Test invoice from local debug',
        'currency': 'IDR'
    }
    
    print(f"🚀 Creating Xendit invoice with data: {json.dumps(invoice_data, indent=2)}")
    
    # Create auth header
    import base64
    auth_string = base64.b64encode(f'{secret_key}:'.encode()).decode()
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Basic {auth_string}',
        'X-IDEMPOTENCY-KEY': invoice_data['external_id']
    }
    
    try:
        response = requests.post(
            'https://api.xendit.co/v2/invoices',
            headers=headers,
            json=invoice_data,
            timeout=20
        )
        
        print(f"📊 Response status: {response.status_code}")
        print(f"📊 Response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Success! Invoice created:")
            print(f"   ID: {data.get('id')}")
            print(f"   URL: {data.get('invoice_url')}")
            print(f"   Status: {data.get('status')}")
            print(f"   Amount: {data.get('amount')} {data.get('currency')}")
        else:
            print(f"❌ Error response:")
            try:
                error_data = response.json()
                print(f"   {json.dumps(error_data, indent=2)}")
            except:
                print(f"   {response.text}")
                
    except requests.exceptions.Timeout:
        print("❌ Request timed out")
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == '__main__':
    test_xendit_api()
