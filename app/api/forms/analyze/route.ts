import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/app/lib/prisma";
import { analyzeFormFields } from "@/app/lib/google-ai";
import { generateEmbedding } from "@/app/lib/google-ai";
import { storeEmbedding } from "@/app/lib/pinecone";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

// Validation schema for form field analysis
const formFieldSchema = z.object({
  url: z.string().url(),
  domain: z.string(),
  fields: z.array(
    z.object({
      name: z.string(),
      label: z.string().optional(),
      type: z.string(),
      id: z.string().optional(),
    })
  ),
});

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate request data
    const result = formFieldSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 }
      );
    }

    const { url, domain, fields } = result.data;

    // Analyze form fields using Google AI
    const analysisResult = await analyzeFormFields(fields);
    if (!analysisResult) {
      return NextResponse.json(
        { error: "Failed to analyze form fields" },
        { status: 500 }
      );
    }

    // Create or update form template
    const formTemplate = await prisma.formTemplate.upsert({
      where: {
        domainPattern_name: {
          domainPattern: domain,
          name: `${domain} Form`,
        },
      },
      update: {
        structure: fields,
        fieldMappings: analysisResult,
      },
      create: {
        domainPattern: domain,
        name: `${domain} Form`,
        description: `Form detected on ${url}`,
        structure: fields,
        fieldMappings: analysisResult,
      },
    });

    // Store embeddings for each field for future searches
    for (const field of fields) {
      if (field.label || field.name) {
        const fieldText = `${field.label || ""} ${field.name}`.trim();
        const embedding = await generateEmbedding(fieldText);
        
        // Create field embedding in database for reference
        const fieldEmbedding = await prisma.fieldEmbedding.create({
          data: {
            fieldName: field.name,
            fieldLabel: field.label || field.name,
            fieldType: field.type,
            embedding: Buffer.from(new Float32Array(embedding).buffer).toString("base64"),
            metadata: {
              domain,
              formTemplateId: formTemplate.id,
              fieldIndex: fields.indexOf(field),
            },
          },
        });
        
        // Store embedding in Pinecone
        await storeEmbedding(
          fieldEmbedding.id,
          embedding,
          {
            userId: session.user.id,
            fieldName: field.name,
            fieldLabel: field.label || field.name,
            fieldType: field.type,
            domain,
            formTemplateId: formTemplate.id,
          }
        );
      }
    }

    return NextResponse.json({
      templateId: formTemplate.id,
      analysis: analysisResult,
    });
  } catch (error) {
    console.error("Form analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 