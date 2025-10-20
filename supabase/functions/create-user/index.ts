import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the requesting user is an admin
    const jwt = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt)

    if (userError || !user) {
      throw new Error('Invalid authentication token')
    }

    // Check if user has admin role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      throw new Error('Insufficient permissions - admin role required')
    }

    // Parse request body
    const { email, password, role = 'view_only' } = await req.json()

    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    console.log('Creating user:', { email, role })

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password: password,
      email_confirm: true,
      user_metadata: {
        role: role,
        created_by_admin: true,
        created_by: user.email
      }
    })

    if (authError) {
      console.error('Auth creation error:', authError)
      throw new Error(`Failed to create auth user: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error('Auth user creation returned no user data')
    }

    console.log('Auth user created:', authData.user.id)

    // Create user profile
    const profileData = {
      id: crypto.randomUUID(),
      user_id: authData.user.id,
      email: email.toLowerCase().trim(),
      first_name: email.split('@')[0], // Default first name from email
      last_name: '',
      role: role,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert([profileData])

    if (profileError) {
      console.error('Profile creation error:', profileError)

      // Cleanup: Delete the auth user if profile creation failed
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        console.log('Cleaned up auth user after profile creation failure')
      } catch (cleanupError) {
        console.error('Failed to cleanup auth user:', cleanupError)
      }

      throw new Error(`Failed to create user profile: ${profileError.message}`)
    }

    console.log('User profile created successfully')

    return new Response(
      JSON.stringify({
        success: true,
        message: `User ${email} created successfully`,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: role
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in create-user function:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create user'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})