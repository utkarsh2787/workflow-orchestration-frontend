import { NextRequest, NextResponse } from "next/server";
import { validateToken } from "./api_services/auth.service";
import axios from "axios";


const PUBLIC_PAGES = ["/", "/login", "/register", "/auth/callback"];



export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Skip static files and _next
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/static") ||
        pathname === "/favicon.ico" ||
        pathname.startsWith("/api")
    ) {
        return NextResponse.next();
    }
    let isValid = false;
    try {

        const resp = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, {
            headers: {
                cookie: req.headers.get("cookie") || "", // forward cookies from incoming request
            },
        });
        console.log("Middleware: Token valid:", resp.data);
        // const dispatch = useDispatch();
        // await dispatch(setUser({
        //     email: resp.data.email,
        //     name: resp.data.name,
        //     id: resp.data.id,
        // }));

        isValid = true;
        console.log("Middleware: User is authenticated");
    }
    catch (err) {
        isValid = false;
    }


    const isPublic = PUBLIC_PAGES.includes(pathname);
    console.log(`Middleware: Pathname=${pathname}, isPublic=${isPublic}, isValid=${isValid}`);

    // If user is authenticated and visits public pages, redirect to dashboard
    if (isValid && isPublic) {
        console.log("Redirecting authenticated user from public page to dashboard");
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    // If user is not authenticated and visits protected pages, redirect to login
    if (!isValid && !isPublic) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        // Optionally add returnTo
        url.searchParams.set("returnTo", pathname);
        return NextResponse.redirect(url);
    }

    // Otherwise continue
    return NextResponse.next();
}

export const config = {
    matcher: "/:path*",
};
