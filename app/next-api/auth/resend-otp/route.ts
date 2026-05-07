import { env } from "@/config/env";
import { AUTH_API } from "@/constants/api-endpoints";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const backendRes = await fetch(`${env.API_URL}${AUTH_API.RESEND_OTP}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json();

  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  return NextResponse.json(data, { status: 200 });
}
