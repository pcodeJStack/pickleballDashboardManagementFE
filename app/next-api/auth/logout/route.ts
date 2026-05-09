import { env } from "@/config/env";
import { AUTH_API } from "@/constants/api-endpoints";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  const backendRes = await fetch(`${env.API_URL}${AUTH_API.LOGOUT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
  });

  const data = await backendRes.json();

  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  const res = NextResponse.json(data, { status: 200 });
  res.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
  res.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
  res.cookies.set("role", "", { maxAge: 0, path: "/" });

  return res;
}
