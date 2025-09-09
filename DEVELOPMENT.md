# Development Setup - Admin Access

## Quick Start

The admin panel is already configured for easy development access!

### 🚀 Starting the Development Server

```bash
npm start
```

The development server will start at `http://localhost:3000`

### 🔑 Admin Panel Access

**In Development Mode**: Authentication is automatically bypassed! 

- **Admin Panel URL**: `http://localhost:3000/admin`
- **No login required**: Direct access to all admin features
- **Auto-enabled**: Works when `NODE_ENV=development` (automatic with `npm start`)

### 🛠 Admin Account Creation (Optional)

If you need to test authentication features or want a real admin account, you can create one:

```bash
# Create a development admin account
npm run create-dev-admin
```

This will create an admin user with:
- **Email**: `admin@dev.local`
- **Phone**: `+6281234567890`
- **Password**: `admin123`
- **Admin Rights**: Enabled

### 📁 Available Admin Routes

Once the server is running, you can access:

- **Dashboard**: `http://localhost:3000/admin`
- **Products**: `http://localhost:3000/admin/products`
- **Orders**: `http://localhost:3000/admin/orders`
- **Users**: `http://localhost:3000/admin/users`
- **Settings**: `http://localhost:3000/admin/settings`

### 🔧 Configuration

The development bypass is configured in `/src/routes/AdminRoute.tsx`:

```tsx
if (process.env.NODE_ENV === 'development') {
  return <AdminLayout />;
}
```

### 🌐 Environment Variables

Make sure you have the required environment variables. Copy from `.env.example`:

```bash
cp .env.example .env.local
```

### 🐛 Troubleshooting

1. **Admin panel not loading?**
   - Make sure the dev server is running with `npm start`
   - Check that you're accessing `http://localhost:3000/admin` (not just `/admin`)

2. **Build errors?**
   - Run `npm install` to ensure all dependencies are installed
   - Check the terminal for any TypeScript errors

3. **Need to test real authentication?**
   - Run `npm run create-dev-admin` to create a test admin account
   - Or set `NODE_ENV=production` to enable authentication checks

### 📚 Development Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run create-dev-admin` - Create development admin account
- `npm test` - Run tests

---

**Happy coding!** 🎉 The admin panel is ready for development with zero configuration needed.
