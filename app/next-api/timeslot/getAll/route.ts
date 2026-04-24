import { TIMESLOT_API } from "@/constants/api-endpoints";
import { env } from "@/config/env";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = url.searchParams.get("page") || "0";
  const size = url.searchParams.get("size") || "10";

  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const params = new URLSearchParams({
    page,
    size,
  });

  const backendRes = await fetch(
    `${env.API_URL}${TIMESLOT_API.GET_ALL}?${params.toString()}`,
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
    return new Response(JSON.stringify(data), {
      status: backendRes.status,
    });
  }

  return Response.json(data);
}
