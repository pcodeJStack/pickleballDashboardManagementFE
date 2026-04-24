import { COURT_API } from "@/constants/api-endpoints";
import { env } from "@/config/env";
import { cookies } from "next/headers";

export async function GET(req: Request) {
	const url = new URL(req.url);
	const page = url.searchParams.get("page") || "0";
	const size = url.searchParams.get("size") || "10";
	const branchId = url.searchParams.get("branchId");
	const zoneId = url.searchParams.get("zoneId");
	const name = url.searchParams.get("name");
	const courtType = url.searchParams.get("courtType");
	const surfaceType = url.searchParams.get("surfaceType");
	const minPrice = url.searchParams.get("minPrice");
	const maxPrice = url.searchParams.get("maxPrice");
	const courtStatus = url.searchParams.get("courtStatus");

	if (!branchId || branchId.trim() === "") {
		return new Response(
			JSON.stringify({ message: "branchId is required" }),
			{ status: 400 },
		);
	}

	const cookieStore = await cookies();
	const token = cookieStore.get("accessToken")?.value;

	const params = new URLSearchParams({
		page,
		size,
		branchId,
	});

	if (name) params.append("name", name);
	if (zoneId) params.append("zoneId", zoneId);
	if (courtType) params.append("courtType", courtType);
	if (surfaceType) params.append("surfaceType", surfaceType);
	if (minPrice) params.append("minPrice", minPrice);
	if (maxPrice) params.append("maxPrice", maxPrice);
	if (courtStatus) params.append("courtStatus", courtStatus);

	const backendRes = await fetch(
		`${env.API_URL}${COURT_API.GET_ALL}?${params.toString()}`,
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
