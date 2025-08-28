import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    try {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Auth exchange error:', exchangeError)
        return NextResponse.redirect(`${origin}/login?error=auth_failed`)
      }

      // Successful authentication
      return NextResponse.redirect(`${origin}${next}`)
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }
  }

  // No code - redirect to login
  return NextResponse.redirect(`${origin}/login`)
}
