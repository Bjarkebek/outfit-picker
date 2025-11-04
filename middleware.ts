// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';


export async function middleware(req: NextRequest) {

  // Bypass alt i E2E (Playwright sætter E2E=1)
  if (process.env.E2E === '1') {
    return NextResponse.next();
  }

  // Tillad assets uden auth
  const publicPaths = ['/login', '/favicon.ico', '/OutfitPickerLogo.png'];
  if (
    publicPaths.includes(req.nextUrl.pathname) ||
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  // Init Supabase server client (læser/fornyer session cookies)
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (key) => req.cookies.get(key)?.value,
        set: (key, value, options) => {
          res.cookies.set({ name: key, value, ...options });
        },
        remove: (key, options) => {
          res.cookies.set({ name: key, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Ikke logget ind → send til /login
  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectedFrom', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Logget ind → giv adgang
  return res;
}

export const config = {
  // Kør middleware på alle routes
  matcher: ['/((?!api/.*).*)'],
};
