import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/app/lib/prisma';
import { aiMatchFormFields, formatAiFieldMatches } from '@/app/lib/form-ai';

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request data
    const data = await req.json();
    const { url, domain, fields } = data;
    
    if (!fields || !Array.isArray(fields)) {
      return NextResponse.json({ error: 'Invalid fields data' }, { status: 400 });
    }

    // Get user data with profile and custom fields
    const user: any = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        userData: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse custom fields
    const customFields = typeof user.customFields === 'string'
      ? JSON.parse(user.customFields)
      : user.customFields || {};

    // Create a comprehensive user data object
    const userData: Record<string, any> = {
      // User fields
      email: user.email,
      name: user.name,
    };
    
    // Add profile fields if they exist
    if (user.profile) {
      userData.firstName = user.profile.firstName;
      userData.lastName = user.profile.lastName;
      userData.phoneNumber = user.profile.phoneNumber;
      userData.dateOfBirth = user.profile.dateOfBirth;
      userData.gender = user.profile.gender;
      userData.occupation = user.profile.occupation;
      userData.addressLine1 = user.profile.addressLine1;
      userData.addressLine2 = user.profile.addressLine2;
      userData.city = user.profile.city;
      userData.state = user.profile.state;
      userData.postalCode = user.profile.postalCode;
      userData.country = user.profile.country;
      
      // Also add with alternate keys for better matching
      userData.first_name = user.profile.firstName;
      userData.last_name = user.profile.lastName;
      userData.phone = user.profile.phoneNumber;
      userData.dob = user.profile.dateOfBirth;
      userData.address = user.profile.addressLine1;
      userData.zip = user.profile.postalCode;
    }
    
    // Add user data items
    if (user.userData && user.userData.length > 0) {
      user.userData.forEach((item: { key: string, value: string }) => {
        userData[item.key] = item.value;
      });
    }
    
    // Add custom fields
    Object.entries(customFields).forEach(([key, value]) => {
      userData[key] = value;
      
      // Also add with underscores for better matching
      const underscoreKey = key.replace(/\s+/g, '_').toLowerCase();
      if (!userData[underscoreKey]) {
        userData[underscoreKey] = value;
      }
    });

    let formValues: Record<string, string> = {};

    try {
      // Use AI to match form fields
      console.log('Using AI to match form fields');
      const aiMatches = await aiMatchFormFields(fields, userData, session.user.id);
      formValues = formatAiFieldMatches(aiMatches, fields);
      
      console.log('AI field matches:', aiMatches);
    } catch (error) {
      console.error('Error in AI matching, falling back to rule-based matching:', error);
      
      // Fall back to the original rule-based matching logic
      fields.forEach((field: any) => {
        // Get field identifiers
        const name = field.name?.toLowerCase() || '';
        const id = field.id?.toLowerCase() || '';
        const label = field.label?.toLowerCase() || '';
        const type = field.type?.toLowerCase() || '';
  
        // Skip submit, hidden, and button fields
        if (type === 'submit' || type === 'hidden' || type === 'button' || type === 'reset') {
          return;
        }
  
        // Try to find a match in our user data
        let value: any = null;
  
        // Check by name
        if (name && userData[name] !== undefined) {
          value = userData[name];
        } 
        // Check by id
        else if (id && userData[id] !== undefined) {
          value = userData[id];
        } 
        // Check by label
        else if (label && userData[label] !== undefined) {
          value = userData[label];
        }
        // Direct match with custom fields (case insensitive)
        else {
          const customFieldKeys = Object.keys(customFields);
          const matchingKey = customFieldKeys.find(key => 
            key.toLowerCase() === name || 
            key.toLowerCase() === id || 
            key.toLowerCase() === label ||
            key.toLowerCase().replace(/\s+/g, '_') === name || 
            key.toLowerCase().replace(/\s+/g, '_') === id ||
            name.includes(key.toLowerCase()) ||
            id.includes(key.toLowerCase()) ||
            label.includes(key.toLowerCase())
          );
          
          if (matchingKey) {
            value = customFields[matchingKey];
          }
        }
  
        // If we found a value, set it in our form values
        if (value !== null && value !== undefined) {
          // Use the original field name for the form values
          formValues[field.name || field.id] = typeof value === 'object' 
            ? JSON.stringify(value) 
            : String(value);
        }
      });
    }

    // Log the suggestion for debugging
    console.log('Form field suggestions:', {
      url,
      domain,
      fieldCount: fields.length,
      valueCount: Object.keys(formValues).length
    });

    return NextResponse.json({
      success: true,
      values: formValues
    });
  } catch (error) {
    console.error('Error suggesting form values:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 

