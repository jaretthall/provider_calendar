# Edge Function Setup for User Management

## Overview
This setup enables creating users directly from the app using a Supabase Edge Function that has admin privileges.

## Prerequisites
1. Supabase CLI installed: `npm install -g supabase`
2. Docker installed and running (for local development)

## Deployment Steps

### 1. Login to Supabase CLI
```bash
supabase login
```

### 2. Link to your Supabase project
```bash
supabase link --project-ref fgqhclnsndiwdecxvcxi
```

### 3. Deploy the Edge Function
```bash
supabase functions deploy create-user
```

### 4. Set Environment Variables
In your Supabase dashboard, go to Settings → Edge Functions and set:
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key from Settings → API

### 5. Test the Function
After deployment, the function will be available at:
`https://fgqhclnsndiwdecxvcxi.supabase.co/functions/v1/create-user`

## Local Development (Optional)

### 1. Start Supabase locally
```bash
supabase start
```

### 2. Serve functions locally
```bash
supabase functions serve create-user --env-file .env.local
```

### 3. Create .env.local file
```bash
SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key
```

## Security Notes
- The Edge Function validates that the requesting user has admin role
- Only authenticated admin users can create new users
- The function automatically creates both auth user and user profile
- Failed profile creation triggers automatic auth user cleanup

## Usage from App
Once deployed, the UserManagement component will automatically use the Edge Function when creating users. No additional configuration needed in the app.

## Troubleshooting

### Function not found error
- Ensure the function is deployed: `supabase functions list`
- Check the function URL in the app matches your project

### Permission errors
- Verify the service role key is set in Edge Function environment
- Ensure requesting user has admin role in user_profiles table

### CORS errors
- The function includes proper CORS headers
- Ensure your domain is allowed in Supabase dashboard Settings → Auth → Site URL