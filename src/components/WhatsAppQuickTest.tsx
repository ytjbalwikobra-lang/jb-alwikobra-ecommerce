import React, { useState } from 'react';

const WhatsAppQuickTest: React.FC = () => {
  const [phone, setPhone] = useState('6281234567999');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testWhatsApp = async () => {
    setTesting(true);
    setResult(null);

    try {
      // For development, we'll test the direct service
      // In production, this would call the API endpoint
      const response = await fetch('/api/auth?action=test-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone,
          testType: 'verification'
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'API endpoint not available in development mode',
        note: 'Use the direct test script: node test-whatsapp-direct.js'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg mb-6">
      <h3 className="text-white text-lg font-bold mb-4">🧪 WhatsApp Quick Test</h3>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="6281234567999"
          className="flex-1 px-3 py-2 bg-gray-700 text-white rounded"
        />
        <button
          onClick={testWhatsApp}
          disabled={testing}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Test WhatsApp'}
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded ${result.success ? 'bg-green-900' : 'bg-red-900'}`}>
          <pre className="text-white text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="text-gray-400 text-sm mt-2">
        💡 For full testing, run: <code>node test-whatsapp-direct.js</code>
      </div>
    </div>
  );
};

export default WhatsAppQuickTest;
