import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth, getUserWithRole } from "@/lib/auth";

const UpdateNoteSchema = z.object({
  content: z.string().min(1, "Note content is required").optional(),
  isPrivate: z.boolean().optional(),
  mentions: z.array(z.string()).optional(),
});

// GET /api/notes/[id] - Get a specific note
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const note = await prisma.note.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true },
        },
        contact: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Get user with role information
    const userWithRole = await getUserWithRole(session.user.id);

    // Check if user can view this note (public notes or own private notes or admin)
    const canView =
      !note.isPrivate ||
      note.authorId === session.user.id ||
      (userWithRole && userWithRole.role === "ADMIN");

    if (!canView) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error("Error fetching note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/notes/[id] - Update a specific note
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const note = await prisma.note.findUnique({
      where: { id: params.id },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Get user with role information
    const userWithRole = await getUserWithRole(session.user.id);

    // Check if user can edit this note (author or admin)
    const canEdit =
      note.authorId === session.user.id ||
      (userWithRole && userWithRole.role === "ADMIN");

    if (!canEdit) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = UpdateNoteSchema.parse(body);

    let updatedMentions = note.mentions;

    // Process @mentions in content if content is being updated
    if (validatedData.content) {
      const mentionRegex = /@(\w+)/g;
      const mentionsInContent: string[] = [];
      let match;

      while ((match = mentionRegex.exec(validatedData.content)) !== null) {
        const username = match[1];
        const mentionedUser = await prisma.user.findFirst({
          where: {
            OR: [
              { name: { contains: username, mode: "insensitive" } },
              { email: { contains: username, mode: "insensitive" } },
            ],
          },
        });

        if (mentionedUser) {
          mentionsInContent.push(mentionedUser.id);
        }
      }

      // Combine existing mentions with mentions found in content
      updatedMentions = [
        ...new Set([
          ...(validatedData.mentions || note.mentions),
          ...mentionsInContent,
        ]),
      ];
    }

    const updatedNote = await prisma.note.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        mentions: updatedMentions,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, image: true },
        },
        contact: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/[id] - Delete a specific note
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const note = await prisma.note.findUnique({
      where: { id: params.id },
    });

    if (!note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Get user with role information
    const userWithRole = await getUserWithRole(session.user.id);

    // Check if user can delete this note (author or admin)
    const canDelete =
      note.authorId === session.user.id ||
      (userWithRole && userWithRole.role === "ADMIN");

    if (!canDelete) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await prisma.note.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
