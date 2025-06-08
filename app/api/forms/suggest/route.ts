import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/app/lib/prisma';
import { z } from 'zod';
import { analyzeFormFields } from '@/app/lib/google-ai';

// Define interface for user data items
interface UserDataItem {
  key: string;
  value: string;
  category?: string;
}

// Interface for profile data
interface ProfileData {
  [key: string]: string | null | undefined;
  id: string;
  name: string | null;
  email: string | null;
  firstName: string;
  lastName: string;
  middleName: string;
  phoneNumber: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  addressLine1: string;
  address: string;
  addressLine2: string;
  city: string;
  state: string;
  province: string;
  postalCode: string;
  zipCode: string;
  zip: string;
  country: string;
  occupation: string;
}

// Interface for suggestions
interface FieldSuggestions {
  [key: string]: string | null | undefined;
}

// Enhanced field mappings interface
interface FieldMappings {
  [key: string]: {
    type: string;
    category: string;
    dataPoint: string;
    suggestedValue: string;
    validationRules?: {
      pattern?: string;
      min?: number;
      max?: number;
      minLength?: number;
      maxLength?: number;
    };
    options?: Array<{
      value: string;
      label: string;
      isRecommended: boolean;
    }>;
    fileTypes?: string[];
  };
}

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
      options: z.array(
        z.object({
          value: z.string(),
          label: z.string()
        })
      ).optional(),
      required: z.boolean().optional(),
      validation: z.object({
        pattern: z.string().optional(),
        min: z.number().optional(),
        max: z.number().optional(),
        minLength: z.number().optional(),
        maxLength: z.number().optional()
      }).optional(),
      multiple: z.boolean().optional(),
      accept: z.string().optional()
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

    // Get user's AI persona data
    const aiPersona = await prisma.aiPersona.findFirst({
      where: {
        userId: session.user.id,
        status: 'TRAINED'
      }
    });

    if (!aiPersona || !aiPersona.trainingData) {
      return NextResponse.json(
        { error: "No trained persona found or invalid training data" },
        { status: 404 }
      );
    }

    // Get user's uploaded files
    const userFiles = await prisma.userDocument.findMany({
      where: {
        userId: session.user.id,
        processingStatus: 'COMPLETED' as const
      },
      select: {
        id: true,
        filename: true,
        mimeType: true,
        size: true,
        extractedData: true
      }
    });

    console.log('Found user documents:', userFiles);

    // Analyze form fields using Google AI
    const analysisResult = await analyzeFormFields(fields, userFiles.map(file => ({
      id: file.id,
      name: file.filename,
      type: file.mimeType,
      size: file.size,
      metadata: file.extractedData as Record<string, any> || undefined
    })));
    if (!analysisResult) {
      return NextResponse.json(
        { error: "Failed to analyze form fields" },
        { status: 500 }
      );
    }

    // Generate suggestions based on field analysis and user persona
    const suggestions: Record<string, any> = {};
    const fileUploads: Record<string, { fileId: string; reason: string }> = {};
    
    fields.forEach(field => {
      const fieldAnalysis = analysisResult[field.name];
      if (!fieldAnalysis) return;

      // Get base value from persona
      const trainingData = aiPersona.trainingData as Record<string, any>;
      let value = trainingData[fieldAnalysis.dataPoint];
      
      // Handle different field types
      switch (field.type) {
        case 'checkbox':
          // Convert value to boolean
          value = Boolean(value);
          break;
          
        case 'radio':
          // Find matching option
          if (fieldAnalysis.options) {
            const recommendedOption = fieldAnalysis.options.find((opt: { isRecommended: boolean }) => opt.isRecommended);
            if (recommendedOption) {
              value = recommendedOption.value;
            }
          }
          break;
          
        case 'select-one':
          // Find matching option
          if (fieldAnalysis.options) {
            const recommendedOption = fieldAnalysis.options.find((opt: { isRecommended: boolean }) => opt.isRecommended);
            if (recommendedOption) {
              value = recommendedOption.value;
            }
          }
          break;
          
        case 'select-multiple':
          // Handle multiple selections
          if (fieldAnalysis.options) {
            const recommendedOptions = fieldAnalysis.options
              .filter((opt: { isRecommended: boolean }) => opt.isRecommended)
              .map((opt: { value: string }) => opt.value);
            if (recommendedOptions.length > 0) {
              value = recommendedOptions;
            }
          }
          break;
          
        case 'file':
          // Handle file uploads
          if (fieldAnalysis.fileUpload?.suggestedFileId) {
            const suggestedFile = userFiles.find(f => f.id === fieldAnalysis.fileUpload.suggestedFileId);
            if (suggestedFile) {
              fileUploads[field.name] = {
                fileId: suggestedFile.id,
                reason: fieldAnalysis.fileUpload.reason
              };
              value = suggestedFile.filename; // Use file name as the display value
            }
          }
          break;
          
        default:
          // Apply validation rules for text-like inputs
          if (fieldAnalysis.validationRules) {
            const { pattern, min, max, minLength, maxLength } = fieldAnalysis.validationRules;
            
            // Apply pattern if exists
            if (pattern && typeof value === 'string') {
              const regex = new RegExp(pattern);
              if (!regex.test(value)) {
                value = fieldAnalysis.suggestedValue;
              }
            }
            
            // Apply length constraints
            if (typeof value === 'string') {
              if (minLength && value.length < minLength) {
                value = value.padEnd(minLength, ' ');
              }
              if (maxLength && value.length > maxLength) {
                value = value.substring(0, maxLength);
              }
            }
            
            // Apply numeric constraints
            if (typeof value === 'number') {
              if (min !== undefined && value < min) {
                value = min;
              }
              if (max !== undefined && value > max) {
                value = max;
              }
            }
          }
      }
      
      suggestions[field.name] = value;
    });

    // Log this autofill request
    await prisma.formFillLog.create({
      data: {
        userId: session.user.id,
        url,
        domain,
        fieldsCount: fields.length,
        suggestionsCount: Object.keys(suggestions).length,
        metadata: {
          timestamp: new Date().toISOString(),
          userAgent: request.headers.get('user-agent') || 'Unknown',
          fieldTypes: fields.map(f => f.type),
          validationRules: fields.map(f => f.validation || {}),
          fileUploads: Object.keys(fileUploads).length > 0 ? fileUploads : undefined,
          userFiles: userFiles.map(f => ({
            id: f.id,
            filename: f.filename,
            type: f.mimeType
          }))
        }
      }
    });

    return NextResponse.json({
      success: true,
      values: suggestions,
      totalFields: fields.length,
      matchedFields: Object.keys(suggestions).length,
      fieldAnalysis: analysisResult,
      fileUploads: Object.keys(fileUploads).length > 0 ? fileUploads : undefined,
      userFiles: userFiles.map(f => ({
        id: f.id,
        filename: f.filename,
        type: f.mimeType
      }))
    });
  } catch (error) {
    console.error('Error generating form suggestions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 