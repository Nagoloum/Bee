import { NextResponse, type NextRequest } from 'next/server';

// Protéger les zones authentifiées (client, vendor, delivery, admin)
const PROTECTED = [/^\/(client|vendor|delivery|admin)(\/|$)/];

export function middleware(req: NextRequest) {
  const needsAuth = PROTECTED.some((re) => re.test(req.nextUrl.pathname));
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get('bee.access')?.value;
  if (!token) {
    const signIn = new URL('/sign-in', req.url);
    signIn.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(signIn);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
