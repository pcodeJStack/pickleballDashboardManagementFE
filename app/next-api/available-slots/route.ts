import { AVAILABLE_SLOT_API } from "@/constants/api-endpoints";
import { env } from "@/config/env";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const courtId = url.searchParams.get("courtId");
  const date = url.searchParams.get("date");
  const page = url.searchParams.get("page") || "0";
  const size = url.searchParams.get("size") || "10";

  if (!courtId || !date) {
    return new Response(
      JSON.stringify({ message: "courtId and date are required" }),
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const params = new URLSearchParams({
    courtId,
    date,
    page,
    size,
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const backendRes = await fetch(
    `${env.API_URL}${AVAILABLE_SLOT_API.GET_ALL}?${params.toString()}`,
    {
      method: "GET",
      headers,
      cache: "no-store",
    },
  );

  const data = await backendRes.json();

  if (!backendRes.ok) {
    return new Response(JSON.stringify(data), {
      status: backendRes.status,
    });
  }

  return Response.json(data);
}
