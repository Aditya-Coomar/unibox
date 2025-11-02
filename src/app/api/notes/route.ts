import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth, getUserWithRole } from "@/lib/auth";

const CreateNoteSchema = z.object({
  contactId: z.string(),
  content: z.string().min(1, "Note content is required"),
  isPrivate: z.boolean().default(false),
  mentions: z.array(z.string()).default([]), // Array of user IDs
});

const UpdateNoteSchema = CreateNoteSchema.partial().omit({ contactId: true });

// GET /api/notes - Get notes for a contact
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get("contactId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!contactId) {
      return NextResponse.json(
        { error: "contactId is required" },
        { status: 400 }
      );
    }

    const where: any = {
      contactId,
    };

    // Get user with role information
    const userWithRole = await getUserWithRole(session.user.id);

    // Only show public notes or private notes authored by current user
    if (!userWithRole || userWithRole.role !== "ADMIN") {
      where.OR = [
        { isPrivate: false },
        { authorId: session.user.id, isPrivate: true },
      ];
    }

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true, email: true, image: true },
          },
          contact: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.note.count({ where }),
    ]);

    return NextResponse.json({
      notes,
      total,
      hasMore: offset + notes.length < total,
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create a new note
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CreateNoteSchema.parse(body);

    // Verify contact exists
    const contact = await prisma.contact.findUnique({
      where: { id: validatedData.contactId },
    });

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Process @mentions in content
    const mentionRegex = /@(\w+)/g;
    const mentionsInContent: string[] = [];
    let match;

    while ((match = mentionRegex.exec(validatedData.content)) !== null) {
      const username = match[1];
      // Find user by name or email (simplified for demo)
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

    // Combine explicit mentions with mentions found in content
    const allMentions = [
      ...new Set([...validatedData.mentions, ...mentionsInContent]),
    ];

    const note = await prisma.note.create({
      data: {
        contactId: validatedData.contactId,
        authorId: session.user.id,
        content: validatedData.content,
        isPrivate: validatedData.isPrivate,
        mentions: allMentions,
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

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
