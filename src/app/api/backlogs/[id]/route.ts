import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - récupérer un backlog
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const backlog = await prisma.backlog.findUnique({
      where: { id: params.id },
    });

    if (!backlog) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(backlog);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT - update backlog (status, title, etc.)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const updated = await prisma.backlog.update({
      where: { id: params.id },
      data: {
        title: body.title,
        status: body.status,
        highlightColor: body.highlightColor,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// DELETE backlog
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.backlog.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
