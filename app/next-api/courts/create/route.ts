import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/config/env";
import { COURT_API } from "@/constants/api-endpoints";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      description,
      courtNumber,
      courtType,
      surfaceType,
      courtStatus,
      imageUrl,
      location,
      maxPlayers,
      zoneId,
    } = body;

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${env.API_URL}${COURT_API.CREATE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name,
        description,
        courtNumber,
        courtType,
        surfaceType,
        courtStatus,
        imageUrl,
        location,
        maxPlayers,
        zoneId,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ message: data }, { status: res.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("CREATE COURT ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
