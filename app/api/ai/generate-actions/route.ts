import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { dom, fields, userProfile, mode } = body;

    if (!fields || !Array.isArray(fields)) {
      return NextResponse.json({ error: "Invalid fields data" }, { status: 400 });
    }

    // Generate actions based on fields and user profile
    const actions = generateFormActions(fields, userProfile);

    return NextResponse.json({
      success: true,
      actions: actions
    });

  } catch (error) {
    console.error("AI generate actions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function generateFormActions(fields: any[], userProfile: any) {
  const actions = [];
  
  // Field mapping for common form fields
  const fieldMappings = {
    email: ['email', 'e-mail', 'mail'],
    firstName: ['firstname', 'first-name', 'fname', 'givenname', 'first'],
    lastName: ['lastname', 'last-name', 'lname', 'surname', 'familyname', 'last'],
    phoneNumber: ['phone', 'mobile', 'tel', 'contactnumber', 'telephone'],
    addressLine1: ['address', 'street', 'streetaddress'],
    city: ['city', 'town'],
    state: ['state', 'province', 'region'],
    postalCode: ['zip', 'postal', 'postcode', 'zipcode'],
    country: ['country', 'nation'],
    occupation: ['job', 'work', 'profession', 'title'],
    company: ['company', 'organization', 'employer']
  };

  for (const field of fields) {
    const fieldLabel = (field.label || '').toLowerCase();
    const fieldName = (field.name || '').toLowerCase();
    const fieldId = (field.id || '').toLowerCase();

    // Find matching user profile field
    let matchedValue = null;
    let matchedKey = null;

    for (const [profileKey, searchTerms] of Object.entries(fieldMappings)) {
      const allSearchTerms = [profileKey, ...searchTerms];
      
      if (allSearchTerms.some(term => 
        fieldLabel.includes(term) || 
        fieldName.includes(term) || 
        fieldId.includes(term)
      )) {
        matchedKey = profileKey;
        matchedValue = userProfile[profileKey];
        break;
      }
    }

    // Also check custom fields
    if (!matchedValue && userProfile.customFields) {
      for (const [customKey, customValue] of Object.entries(userProfile.customFields)) {
        if (fieldLabel.includes(customKey.toLowerCase()) || 
            fieldName.includes(customKey.toLowerCase())) {
          matchedValue = customValue;
          matchedKey = customKey;
          break;
        }
      }
    }

    // Generate action if we found a match
    if (matchedValue && matchedValue.toString().trim()) {
      actions.push({
        type: 'TYPE',
        selector: field.selector,
        value: matchedValue.toString(),
        field: matchedKey,
        label: field.label
      });
    }
  }

  // Add some intelligent actions based on form context
  if (actions.length > 0) {
    // Add a small delay between actions for better UX
    const actionsWithDelays = [];
    for (let i = 0; i < actions.length; i++) {
      actionsWithDelays.push(actions[i]);
      if (i < actions.length - 1) {
        actionsWithDelays.push({
          type: 'DELAY',
          duration: 200
        });
      }
    }
    return actionsWithDelays;
  }

  return actions;
} 