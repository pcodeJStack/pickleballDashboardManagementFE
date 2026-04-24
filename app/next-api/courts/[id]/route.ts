import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/config/env";
import { COURT_API } from "@/constants/api-endpoints";

export async function PUT(
	req: Request,
	context: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await context.params;
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

		const res = await fetch(`${env.API_URL}${COURT_API.UPDATE(id)}`, {
			method: "PUT",
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

		return NextResponse.json(data, { status: 200 });
	} catch (error) {
		console.error("UPDATE COURT ERROR:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	_req: Request,
	context: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await context.params;

		const cookieStore = await cookies();
		const accessToken = cookieStore.get("accessToken")?.value;

		if (!accessToken) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}

		const res = await fetch(`${env.API_URL}${COURT_API.DELETE(id)}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${accessToken}`,
			},
		});

		const data = await res.json();
		if (!res.ok) {
			return NextResponse.json({ message: data }, { status: res.status });
		}

		return NextResponse.json(data, { status: 200 });
	} catch (error) {
		console.error("DELETE COURT ERROR:", error);
		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
