import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient, Prisma, PersonaStatus, User, Profile, UserData, Document } from '@prisma/client';

const prisma = new PrismaClient();

type UserWithRelations = {
  id: string;
  name: string | null;
  email: string;
  profile: {
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    dateOfBirth: string | null;
    gender: string | null;
    occupation: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
  } | null;
  userData: Array<{
    key: string;
    value: string;
    category: string;
  }>;
  documents: Array<{
    id: string;
    originalName: string;
    mimeType: string;
    extractedData: any;
  }>;
  customFields: Record<string, string>;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const persona = await prisma.aiPersona.findFirst({
      where: { userId: session.user.id },
      orderBy: { version: 'desc' },
    });
    
    if (!persona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }
    
    return NextResponse.json(persona);
  } catch (error) {
    console.error('Error fetching AI persona:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for existing persona
    const existingPersona = await prisma.aiPersona.findFirst({
      where: {
        user: {
          email: session.user.email
        }
      }
    });

    let persona;
    if (existingPersona) {
      // Update existing persona
      persona = await prisma.aiPersona.update({
        where: { id: existingPersona.id },
        data: {
          status: 'PROCESSING',
          metadata: {}
        }
      });
    } else {
      // Create new persona
      persona = await prisma.aiPersona.create({
        data: {
          user: {
            connect: {
              email: session.user.email,
            },
          },
          status: 'PROCESSING',
        },
      });
    }

    // Start training process
    (async () => {
      try {
        // 1. Get user data
        const userDataRaw = await prisma.user.findUnique({
          where: { email: session.user.email },
          include: {
            profile: true,
            userData: true,
            documents: true,
          },
        });

        if (!userDataRaw || !userDataRaw.email) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const userData: UserWithRelations = {
          id: userDataRaw.id,
          name: userDataRaw.name,
          email: userDataRaw.email,
          profile: userDataRaw.profile,
          userData: userDataRaw.userData || [],
          documents: userDataRaw.documents || [],
          customFields: typeof userDataRaw.customFields === 'string' 
            ? JSON.parse(userDataRaw.customFields) 
            : (userDataRaw.customFields || {}),
        };

        // 2. Extract and structure training data
        const trainableData = {
          personalInfo: {
            name: userData.name,
            email: userData.email,
            firstName: userData.profile?.firstName,
            lastName: userData.profile?.lastName,
            phoneNumber: userData.profile?.phoneNumber,
            dateOfBirth: userData.profile?.dateOfBirth,
            gender: userData.profile?.gender,
            occupation: userData.profile?.occupation,
            address: {
              line1: userData.profile?.addressLine1,
              line2: userData.profile?.addressLine2,
              city: userData.profile?.city,
              state: userData.profile?.state,
              postalCode: userData.profile?.postalCode,
              country: userData.profile?.country,
            },
          },
          formFields: userData.userData.reduce((acc: Record<string, { value: string, category: string }>, item: { key: string, value: string, category: string }) => {
            acc[item.key] = {
              value: item.value,
              category: item.category,
            };
            return acc;
          }, {} as Record<string, { value: string, category: string }>),
          customFields: userData.customFields || {},
          documentData: userData.documents.map((doc: { id: string, originalName: string, mimeType: string, extractedData: any }) => ({
            id: doc.id,
            name: doc.originalName,
            type: doc.mimeType,
            extractedData: doc.extractedData,
          })),
        };

        // 3. Generate system prompt
        const systemPrompt = `You are an AI assistant that helps fill out forms on behalf of ${userData.name}. 
You have access to the following information about them:

Personal Information:
- Name: ${userData.name}
- Email: ${userData.email}
- First Name: ${userData.profile?.firstName}
- Last Name: ${userData.profile?.lastName}
- Phone: ${userData.profile?.phoneNumber}
- Date of Birth: ${userData.profile?.dateOfBirth}
- Occupation: ${userData.profile?.occupation}
- Address: ${userData.profile?.addressLine1}, ${userData.profile?.city}, ${userData.profile?.state}, ${userData.profile?.postalCode}, ${userData.profile?.country}

Custom Fields:
${Object.entries(userData.customFields || {}).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

Form Field History:
${Object.entries(trainableData.formFields).map(([key, data]) => `- ${key}: ${data.value} (Category: ${data.category})`).join('\n')}

Document Information:
${trainableData.documentData.map(doc => `- ${doc.name} (${doc.type})`).join('\n')}

Use this information to help fill out forms accurately and efficiently. When filling out forms:
1. Use the most appropriate information available
2. If exact information isn't available, use the closest match or ask for clarification
3. Keep track of which fields are filled with verified information vs. best guesses
4. Always maintain privacy and security by not sharing sensitive information unnecessarily`;

        // 4. Process training data (this would involve potentially complex ML operations)
        // In a production app, this would likely call an external ML service or queue
        const fieldHeuristics = await generateFieldHeuristics(trainableData);

        // 5. Save the processed training data back to the persona
        await prisma.aiPersona.update({
          where: { id: persona.id },
          data: {
            status: 'TRAINED',
            metadata: {
              systemPrompt,
              fieldHeuristics,
            },
          },
        });

        // 6. Log the successful training
        await prisma.auditLog.create({
          data: {
            action: 'AI_PERSONA_TRAINING_COMPLETED',
            userId: userData.id,
            resource: 'AI_PERSONA',
            resourceId: persona.id,
            metadata: {
              personaId: persona.id,
              status: 'success',
            },
          },
        });
      } catch (error) {
        console.error('Error in AI persona training:', error);
        await prisma.aiPersona.update({
          where: { id: persona.id },
          data: {
            status: 'FAILED',
            metadata: {
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          },
        });
      }
    })();

    return NextResponse.json({ success: true, personaId: persona.id });
  } catch (error) {
    console.error('Error creating AI persona:', error);
    return NextResponse.json(
      { error: 'Failed to create AI persona' },
      { status: 500 }
    );
  }
}

// Helper functions for AI persona training

async function generateFieldMappings(trainableData: any) {
  // This would map user data to common form fields
  // For example, matching "fname", "firstName", "first_name" to the user's first name
  
  const fieldMappings: Record<string, string[]> = {};
  
  // Map personal information fields
  if (trainableData.personalInfo.firstName) {
    fieldMappings.firstName = ['fname', 'first_name', 'first-name', 'given-name', 'givenname'];
  }
  
  if (trainableData.personalInfo.lastName) {
    fieldMappings.lastName = ['lname', 'last_name', 'last-name', 'family-name', 'familyname', 'surname'];
  }
  
  if (trainableData.personalInfo.email) {
    fieldMappings.email = ['email', 'email_address', 'emailaddress', 'e-mail'];
  }
  
  if (trainableData.personalInfo.phoneNumber) {
    fieldMappings.phoneNumber = ['phone', 'telephone', 'tel', 'mobile', 'cell', 'cellphone'];
  }
  
  // Add address mappings
  if (trainableData.personalInfo.address.line1) {
    fieldMappings.addressLine1 = ['address', 'addr', 'street', 'address1', 'address_line_1', 'address-line-1'];
  }
  
  if (trainableData.personalInfo.address.city) {
    fieldMappings.city = ['city', 'town', 'locality'];
  }
  
  if (trainableData.personalInfo.address.state) {
    fieldMappings.state = ['state', 'province', 'region', 'administrative_area'];
  }
  
  if (trainableData.personalInfo.address.postalCode) {
    fieldMappings.postalCode = ['zip', 'zipcode', 'zip_code', 'postal', 'postal_code', 'postcode'];
  }
  
  if (trainableData.personalInfo.address.country) {
    fieldMappings.country = ['country', 'nation'];
  }
  
  // Map form fields from user data
  Object.entries(trainableData.formFields).forEach(([key, data]: [string, any]) => {
    const fieldName = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    fieldMappings[key] = [fieldName];
    
    // Add category-based synonyms
    if (data.category === 'personal') {
      fieldMappings[key].push(`personal_${fieldName}`);
    } else if (data.category === 'professional') {
      fieldMappings[key].push(`professional_${fieldName}`, `work_${fieldName}`);
    }
  });
  
  return fieldMappings;
}

async function generateResponseTemplates(trainableData: any) {
  // Create templated responses for different types of forms
  
  const templates: Record<string, Record<string, any>> = {
    contact: {
      name: `${trainableData.personalInfo.firstName} ${trainableData.personalInfo.lastName}`,
      email: trainableData.personalInfo.email,
      phone: trainableData.personalInfo.phoneNumber,
    },
    address: {
      line1: trainableData.personalInfo.address.line1,
      line2: trainableData.personalInfo.address.line2,
      city: trainableData.personalInfo.address.city,
      state: trainableData.personalInfo.address.state,
      postalCode: trainableData.personalInfo.address.postalCode,
      country: trainableData.personalInfo.address.country,
    },
    professional: {
      occupation: trainableData.personalInfo.occupation,
    },
  };
  
  // Add custom templates based on userData
  Object.entries(trainableData.formFields).forEach(([key, data]: [string, any]) => {
    if (!templates[data.category]) {
      templates[data.category] = {};
    }
    templates[data.category][key] = data.value;
  });
  
  return templates;
}

async function generateFieldHeuristics(trainableData: any) {
  // Create heuristics for identifying form fields based on:
  // - Label text
  // - Field name/id attributes
  // - Field position in forms
  // - Field types
  
  const heuristics: Record<string, any> = {
    labelMatching: {
      firstName: ['First Name', 'Given Name', 'First'],
      lastName: ['Last Name', 'Surname', 'Family Name', 'Last'],
      email: ['Email', 'Email Address', 'E-mail'],
      phoneNumber: ['Phone', 'Telephone', 'Mobile', 'Cell', 'Phone Number'],
      addressLine1: ['Address', 'Street Address', 'Street', 'Address Line 1'],
      city: ['City', 'Town'],
      state: ['State', 'Province', 'Region'],
      postalCode: ['Zip', 'Zip Code', 'Postal Code', 'Postcode'],
      country: ['Country', 'Nation'],
    },
    fieldTypeMatching: {
      email: 'email',
      phoneNumber: 'tel',
      dateOfBirth: 'date',
      postalCode: 'number',
    },
    patterns: {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phoneNumber: /^[\d\s\-+()]{7,20}$/,
      postalCode: /^[\d\-\s]{5,10}$/,
    },
  };
  
  // Add custom field heuristics from user data
  Object.entries(trainableData.formFields).forEach(([key, data]: [string, any]) => {
    // Add field-specific patterns if we can detect them
    if (typeof data.value === 'string') {
      if (data.value.includes('@') && data.value.includes('.')) {
        heuristics.patterns[key] = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        heuristics.fieldTypeMatching[key] = 'email';
      } else if (/^\d+$/.test(data.value)) {
        heuristics.fieldTypeMatching[key] = 'number';
      }
    }
  });
  
  return heuristics;
}

function calculateConfidenceScore(trainableData: any) {
  // Calculate a confidence score for the AI persona based on data completeness
  let score = 0;
  let maxScore = 0;
  
  // Basic personal info checks
  const personalInfoFields = [
    'firstName', 'lastName', 'email', 'phoneNumber', 
    'occupation', 'dateOfBirth', 'gender'
  ];
  
  personalInfoFields.forEach(field => {
    maxScore += 10;
    if (trainableData.personalInfo[field]) {
      score += 10;
    }
  });
  
  // Address completeness
  const addressFields = ['line1', 'city', 'state', 'postalCode', 'country'];
  
  addressFields.forEach(field => {
    maxScore += 8;
    if (trainableData.personalInfo.address[field]) {
      score += 8;
    }
  });
  
  // Form field data points
  const formFieldCount = Object.keys(trainableData.formFields).length;
  maxScore += 50;
  score += Math.min(formFieldCount * 5, 50);
  
  // Document data
  const documentCount = trainableData.documentData.length;
  maxScore += 30;
  score += Math.min(documentCount * 10, 30);
  
  return Math.round((score / maxScore) * 100);
} 