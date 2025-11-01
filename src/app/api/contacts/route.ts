import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";

const CreateContactSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  tags: z.array(z.string()).default([]),
  customFields: z.record(z.string(), z.any()).optional(),
});

const UpdateContactSchema = CreateContactSchema.partial();

// GET /api/contacts - List all contacts with optional filtering
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const tags = searchParams.get("tags")?.split(",");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: {
          conversations: {
            include: {
              messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
          notes: {
            orderBy: { createdAt: "desc" },
            take: 3,
            include: {
              author: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip: offset,
        take: limit,
      }),
      prisma.contact.count({ where }),
    ]);

    return NextResponse.json({
      contacts,
      total,
      hasMore: offset + contacts.length < total,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/contacts - Create a new contact
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CreateContactSchema.parse(body);

    // Check for existing contact with same email or phone
    if (validatedData.email || validatedData.phone) {
      const existingContact = await prisma.contact.findFirst({
        where: {
          OR: [
            validatedData.email ? { email: validatedData.email } : {},
            validatedData.phone ? { phone: validatedData.phone } : {},
          ].filter((obj) => Object.keys(obj).length > 0),
        },
      });

      if (existingContact) {
        return NextResponse.json(
          { error: "Contact with this email or phone already exists" },
          { status: 400 }
        );
      }
    }

    const contact = await prisma.contact.create({
      data: {
        ...validatedData,
        customFields: validatedData.customFields || undefined,
      },
      include: {
        conversations: true,
        notes: {
          include: {
            author: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating contact:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
