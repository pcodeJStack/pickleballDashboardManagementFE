import { BOOKING_API } from "@/constants/api-endpoints";
import { env } from "@/config/env";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = url.searchParams.get("page") || "0";
  const size = url.searchParams.get("size") || "10";

  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = new URLSearchParams({ page, size });

  const backendRes = await fetch(
    `${env.API_URL}${BOOKING_API.MY_BOOKINGS}?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  const data = await backendRes.json();

  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  return NextResponse.json(data, { status: 200 });
}
