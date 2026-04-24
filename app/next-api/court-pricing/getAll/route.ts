import { env } from "@/config/env";
import { COURT_PRICING_API } from "@/constants/api-endpoints";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = url.searchParams.get("page") || "0";
  const size = url.searchParams.get("size") || "10";
  const branchId = url.searchParams.get("branchId") || "";
  const zoneId = url.searchParams.get("zoneId") || "";
  const courtId = url.searchParams.get("courtId") || "";
  const dayOfWeek = url.searchParams.get("dayOfWeek") || "";
  const startTime = url.searchParams.get("startTime") || "";
  const endTime = url.searchParams.get("endTime") || "";

  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const params = new URLSearchParams({
    page,
    size,
  });

  if (branchId) params.set("branchId", branchId);
  if (zoneId) params.set("zoneId", zoneId);
  if (courtId) params.set("courtId", courtId);
  if (dayOfWeek) params.set("dayOfWeek", dayOfWeek);
  if (startTime) params.set("startTime", startTime);
  if (endTime) params.set("endTime", endTime);

  const backendRes = await fetch(
    `${env.API_URL}${COURT_PRICING_API.GET_ALL}?${params.toString()}`,
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
