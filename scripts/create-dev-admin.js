#!/usr/bin/env node
/*
  Create a development admin account
  Usage: node scripts/create-dev-admin.js
*/

const { createClient } = require('@supabase/supabase-js')

function requiredEnv(name) {
  const v = process.env[name]
  if (!v) {
    console.error(`[create-dev-admin] Missing env ${name}. Make sure to export REACT_APP_SUPABASE_* variables.`)
    console.error(`You can also load them from .env file in the root directory.`)
    process.exit(2)
  }
  return v
}

async function main() {
  try {
    // Load environment variables
    require('dotenv').config()
    
    const url = requiredEnv('REACT_APP_SUPABASE_URL')
    const anon = requiredEnv('REACT_APP_SUPABASE_ANON_KEY')
    const supabase = createClient(url, anon)

    const log = (...args) => console.log('[create-dev-admin]', ...args)

    log('Creating development admin account...')

    // Development admin credentials
    const devAdmin = {
      phone: '+6281234567890',
      email: 'admin@dev.local',
      name: 'Development Admin',
      password: 'admin123', // Simple password for development
      isAdmin: true,
      phoneVerified: true,
      profileCompleted: true
    }

    // Check if admin already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, phone, isAdmin')
      .or(`email.eq.${devAdmin.email},phone.eq.${devAdmin.phone}`)
      .single()

    if (existingUser) {
      log('Development admin account already exists:')
      log('- Email:', existingUser.email)
      log('- Phone:', existingUser.phone)
      log('- Is Admin:', existingUser.isAdmin)
      
      if (!existingUser.isAdmin) {
        log('Updating existing user to admin...')
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            isAdmin: true,
            name: devAdmin.name,
            phoneVerified: true,
            profileCompleted: true
          })
          .eq('id', existingUser.id)
        
        if (updateError) {
          console.error('Error updating user to admin:', updateError)
          process.exit(1)
        }
        log('✅ User updated to admin successfully!')
      }
      return
    }

    // Create new admin user
    log('Creating new admin user...')
    
    const userData = {
      phone: devAdmin.phone,
      email: devAdmin.email,
      name: devAdmin.name,
      isAdmin: true,
      phoneVerified: true,
      profileCompleted: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      notificationPreferences: {
        whatsapp: true,
        email: true
      }
    }

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()

    if (createError) {
      console.error('Error creating admin user:', createError)
      process.exit(1)
    }

    log('✅ Development admin account created successfully!')
    log('📧 Email:', devAdmin.email)
    log('📱 Phone:', devAdmin.phone)
    log('🔑 Password:', devAdmin.password)
    log('👤 Name:', devAdmin.name)
    log('')
    log('🚀 You can now access the admin panel at: http://localhost:3000/admin')
    log('⚠️  NOTE: Authentication is bypassed in development mode, so you can access admin pages directly.')

  } catch (error) {
    console.error('[create-dev-admin] Error:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}
