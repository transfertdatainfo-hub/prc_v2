import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const sprint = await prisma.sprint.create({
      data: {
        name: body.name,
        userId: "user-1",
        status: "active",
      },
    });

    return NextResponse.json(sprint);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur création" }, { status: 500 });
  }
}
