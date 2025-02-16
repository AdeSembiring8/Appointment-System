import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const token = req.cookies.get("token"); // Ambil token dari cookie (atau sesuaikan dengan penyimpanan sesi Anda)

    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url)); // Redirect ke halaman login
    }

    return NextResponse.next(); // Lanjutkan ke halaman yang diminta jika sudah login
}

// Tentukan halaman yang menggunakan middleware
export const config = {
    matcher: ["/", "/dashboard", "/profile"], // Halaman yang perlu dicek login
};
