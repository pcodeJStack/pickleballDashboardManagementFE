import { BRANCH_API } from "@/constants/api-endpoints";
import { env } from "@/config/env";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = url.searchParams.get("page") || "0";
  const size = url.searchParams.get("size") || "10";
  const name = url.searchParams.get("name");
  const address = url.searchParams.get("address");
  const phone = url.searchParams.get("phone");
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  // build query param
  const params = new URLSearchParams({
    page,
    size,
  });

  if (name) params.append("name", name);
  if (address) params.append("address", address);
  if (phone) params.append("phone", phone);

  const backendRes = await fetch(
    `${env.API_URL}${BRANCH_API.GET_ALL}?${params.toString()}`,
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
