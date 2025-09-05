import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, Phone, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const WhatsAppTestPage: React.FC = () => {
  const [testPhone, setTestPhone] = useState('6281234567890');
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const handleTestWhatsApp = async () => {
    setTesting(true);
    setTestResults(null);

    try {
      const response = await fetch('/api/test-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: 'f104a4c19ea118dd464e9de20605c4e5',
          phoneNumber: testPhone
        })
      });

      const result = await response.json();
      setTestResults(result);
    } catch (error) {
      setTestResults({
        success: false,
        message: 'Network error atau API tidak tersedia',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-dark text-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link
            to="/admin"
            className="inline-flex items-center space-x-2 text-gray-400 hover:text-pink-400 mr-4"
          >
            <ArrowLeft size={20} />
            <span>Kembali</span>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Test WhatsApp API</h1>
            <p className="text-gray-400 mt-1">
              Test API key WhatsApp untuk notifikasi otomatis
            </p>
          </div>
        </div>

        {/* API Key Info */}
        <div className="bg-black border border-pink-500/30 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <MessageCircle className="text-green-500" size={24} />
            <h2 className="text-xl font-semibold text-white">WhatsApp API Configuration</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">API Key</label>
              <div className="bg-gray-800 rounded-lg p-3 font-mono text-sm">
                f104a4c19ea118dd464e9de20605c4e5
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Woo-wa.com API key - akan ditest melalui notifapi.com endpoint
              </p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Service Provider</label>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800">
                <p className="font-medium">🌐 Woo-wa.com (NotifAPI)</p>
                <p className="text-sm mt-1">• Endpoint: https://notifapi.com</p>
                <p className="text-sm">• Device harus terhubung via QR code</p>
                <p className="text-sm">• Support: text, image, file, scheduling</p>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Target Phone</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="6281234567890"
                  className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                />
                <button
                  onClick={handleTestWhatsApp}
                  disabled={testing || !testPhone}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {testing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Testing...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Test API</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className="bg-black border border-pink-500/30 rounded-xl p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              {testResults.success ? (
                <CheckCircle className="text-green-500" size={24} />
              ) : (
                <AlertCircle className="text-red-500" size={24} />
              )}
              <h2 className="text-xl font-semibold text-white">Test Results</h2>
            </div>

            <div className={`p-4 rounded-lg mb-4 ${
              testResults.success 
                ? 'bg-green-500/10 border border-green-500/30' 
                : 'bg-red-500/10 border border-red-500/30'
            }`}>
              <p className={`font-medium ${
                testResults.success ? 'text-green-400' : 'text-red-400'
              }`}>
                {testResults.message}
              </p>
              
              {testResults.workingProvider && (
                <div className="mt-2">
                  <p className="text-green-300">
                    ✅ <strong>Working Provider:</strong> {testResults.workingProvider}
                  </p>
                  <p className="text-green-300 text-sm mt-1">
                    {testResults.recommendation}
                  </p>
                </div>
              )}
            </div>

            {/* Detailed Results */}
            {testResults.results && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-white">Provider Test Results:</h3>
                {testResults.results.map((result: any, index: number) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.success 
                        ? 'bg-green-500/5 border-green-500/30' 
                        : 'bg-red-500/5 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">{result.provider}</span>
                      <span className={`text-sm px-2 py-1 rounded ${
                        result.success 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {result.success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                    
                    {result.endpoint && (
                      <p className="text-sm text-gray-400 mt-1">
                        Endpoint: {result.endpoint}
                      </p>
                    )}
                    
                    {result.error && (
                      <p className="text-sm text-red-400 mt-1">
                        Error: {result.error}
                      </p>
                    )}
                    
                    {result.response && (
                      <details className="mt-2">
                        <summary className="text-sm text-gray-400 cursor-pointer">
                          View Response
                        </summary>
                        <pre className="text-xs text-gray-300 mt-2 p-2 bg-gray-800 rounded overflow-x-auto">
                          {JSON.stringify(result.response, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Troubleshooting */}
            {!testResults.success && testResults.troubleshooting && (
              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <h3 className="text-lg font-medium text-yellow-400 mb-3">
                  🔧 Troubleshooting Guide
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-yellow-300">Possible Issues:</h4>
                    <ul className="list-disc list-inside text-sm text-yellow-200 mt-1">
                      {testResults.troubleshooting.possibleIssues.map((issue: string, index: number) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-yellow-300">Next Steps:</h4>
                    <ul className="list-disc list-inside text-sm text-yellow-200 mt-1">
                      {testResults.troubleshooting.nextSteps.map((step: string, index: number) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Integration Guide */}
        <div className="bg-black border border-pink-500/30 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">🔧 Woo-wa.com Integration Guide</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-300">1. Setup Environment Variables</h3>
              <p className="text-sm text-gray-400 mt-1">
                Tambahkan konfigurasi Woo-wa.com ke environment:
              </p>
              <div className="bg-gray-800 rounded-lg p-3 mt-2 font-mono text-sm">
                REACT_APP_WHATSAPP_API_KEY=f104a4c19ea118dd464e9de20605c4e5<br />
                REACT_APP_WHATSAPP_API_URL=https://notifapi.com<br />
                REACT_APP_LOG_WHATSAPP_ACTIVITY=true
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-300">2. Connect WhatsApp Device</h3>
              <p className="text-sm text-gray-400 mt-1">
                Pastikan device WhatsApp terhubung ke Woo-wa.com:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-400 mt-2">
                <li>Login ke panel Woo-wa.com dengan API key Anda</li>
                <li>Scan QR code untuk menghubungkan WhatsApp</li>
                <li>Pastikan status device "authenticated"</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-300">3. Automatic Notifications</h3>
              <p className="text-sm text-gray-400 mt-1">
                Setelah berhasil, notifikasi otomatis akan dikirim untuk:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-400 mt-2">
                <li>Order confirmation setelah pembayaran berhasil</li>
                <li>Account delivery dengan detail login</li>
                <li>Payment reminders untuk pending orders</li>
                <li>Status update untuk cancelled/refunded orders</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-gray-300">4. Advanced Features</h3>
              <p className="text-sm text-gray-400 mt-1">
                Woo-wa.com mendukung fitur tambahan:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-400 mt-2">
                <li>Scheduled messages (pengingat otomatis)</li>
                <li>Image attachments (QR codes, receipts)</li>
                <li>File attachments (PDFs, documents)</li>
                <li>Message templates dengan variables</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppTestPage;
