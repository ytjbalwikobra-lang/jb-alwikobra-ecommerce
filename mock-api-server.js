// Simple API Server for Testing Traditional Auth
const http = require('http');
const url = require('url');

const PORT = 3001; // Use different port to avoid conflict

// Mock handlers for testing (will need proper Supabase in production)
const handlers = {
  // Signup endpoint
  'POST /api/auth/signup': async (req, res) => {
    try {
      const body = JSON.parse(req.body);
      console.log('📥 Signup request:', body);
      
      // Mock response
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        user_id: 'mock-user-' + Date.now(),
        message: 'Verification code sent to WhatsApp',
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      }));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request body' }));
    }
  },

  // Login endpoint
  'POST /api/auth/login': async (req, res) => {
    try {
      const body = JSON.parse(req.body);
      console.log('📥 Login request:', { ...body, password: '[HIDDEN]' });
      
      // Mock response
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        session_token: 'mock-session-' + Date.now(),
        user: {
          id: 'mock-user-123',
          phone: body.identifier,
          email: body.identifier.includes('@') ? body.identifier : null,
          name: 'Test User'
        }
      }));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request body' }));
    }
  },

  // Verify phone endpoint
  'POST /api/auth/verify-phone': async (req, res) => {
    try {
      const body = JSON.parse(req.body);
      console.log('📥 Verify phone request:', body);
      
      // Mock response
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        session_token: 'mock-session-' + Date.now(),
        user: {
          id: body.user_id,
          phone: '6281234567999',
          phone_verified: true
        }
      }));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request body' }));
    }
  },

  // Complete profile endpoint
  'POST /api/auth/complete-profile': async (req, res) => {
    try {
      const body = JSON.parse(req.body);
      console.log('📥 Complete profile request:', body);
      
      // Mock response
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        user: {
          id: 'mock-user-123',
          phone: '6281234567999',
          email: body.email,
          name: body.name,
          profile_complete: true
        },
        message: 'Profile completed successfully'
      }));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request body' }));
    }
  },

  // Validate session endpoint
  'POST /api/auth/validate-session': async (req, res) => {
    try {
      console.log('📥 Validate session request');
      
      // Mock response
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        user: {
          id: 'mock-user-123',
          phone: '6281234567999',
          email: 'test@example.com',
          name: 'Test User'
        }
      }));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request' }));
    }
  },

  // Logout endpoint
  'POST /api/auth/logout': async (req, res) => {
    try {
      const body = JSON.parse(req.body);
      console.log('📥 Logout request:', body);
      
      // Mock response
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'Logged out successfully'
      }));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request body' }));
    }
  }
};

// Helper function to read request body
function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      resolve(body);
    });
    req.on('error', reject);
  });
}

// Main server
const server = http.createServer(async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const key = `${req.method} ${parsedUrl.pathname}`;

  console.log(`🔄 ${req.method} ${parsedUrl.pathname}`);

  if (handlers[key]) {
    try {
      req.body = await getRequestBody(req);
      await handlers[key](req, res);
    } catch (error) {
      console.error('❌ Handler error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Mock API Server running on http://localhost:${PORT}`);
  console.log('\n📋 Available endpoints:');
  Object.keys(handlers).forEach(endpoint => {
    console.log(`  ${endpoint}`);
  });
  console.log('\n⚡ Ready to receive requests!');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down mock API server...');
  server.close(() => {
    process.exit(0);
  });
});
