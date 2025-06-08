import { generateText } from './google-ai';
import { retrieveRelevantFieldKnowledge, FormFieldKnowledge } from './form-field-vectordb';

/**
 * Uses AI to match form fields with user profile data
 */
export async function aiMatchFormFields(
  fields: Array<{
    name?: string;
    id?: string;
    label?: string;
    type?: string;
    options?: Array<{ value: string; label: string }>;
  }>,
  userData: Record<string, any>,
  userId?: string
) {
  try {
    // For each field, retrieve relevant knowledge from the vector database
    const fieldsWithKnowledge = await Promise.all(
      fields.map(async (field) => {
        const relevantKnowledge = await retrieveRelevantFieldKnowledge(field, userId);
        return {
          ...field,
          knowledge: relevantKnowledge
        };
      })
    );

    // Build the prompt for Gemini AI
    const prompt = `
You are an AI assistant that helps fill out forms accurately. Given the form fields below and the user's data, 
provide the best matching value for each field.

# Form Fields (with vector search knowledge):
${fieldsWithKnowledge.map((field, index) => `
Field ${index + 1}:
- Name: ${field.name || 'N/A'}
- ID: ${field.id || 'N/A'}
- Label: ${field.label || 'N/A'}
- Type: ${field.type || 'N/A'}
${field.options ? `- Options: ${JSON.stringify(field.options)}` : ''}
- Knowledge: ${field.knowledge.map(k => `
  • Category: ${k.category}
  • Description: ${k.description}
  • Field Name: ${k.fieldName}
  • Common Variations: ${k.commonVariations.join(', ')}
  • Match Score: ${k.score}
`).join('')}
`).join('\n')}

# User Data:
${Object.entries(userData).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

# Instructions:
1. For each form field, determine the best matching value from the user data
2. Use the vector search knowledge to understand what each field is requesting
3. Return your response in strict JSON format with no additional comments
4. If there's no good match for a field, return null for that field

Response Format:
{
  "fieldMatches": [
    {
      "fieldName": "field_name_or_id",
      "value": "matched_value",
      "confidence": 0.95,
      "reasoning": "Brief explanation of why this is the best match"
    }
  ]
}
`;

    // Call Gemini AI
    const aiResponse = await generateText(prompt);
    
    // Parse the response
    let parsedResponse;
    try {
      // Find JSON in the response
      const jsonMatch = aiResponse.match(/{[\s\S]*}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in AI response");
      }
    } catch (error) {
      console.error("Error parsing AI response:", error);
      console.log("Raw AI response:", aiResponse);
      throw new Error("Failed to parse AI response");
    }
    
    return parsedResponse;
  } catch (error) {
    console.error("Error in AI form field matching:", error);
    throw error;
  }
}

/**
 * Formats and optimizes AI field matches into a usable format
 */
export function formatAiFieldMatches(
  aiMatches: {
    fieldMatches: Array<{
      fieldName: string;
      value: string;
      confidence: number;
      reasoning: string;
    }>;
  },
  fields: Array<{
    name?: string;
    id?: string;
    type?: string;
  }>
): Record<string, string> {
  const formValues: Record<string, string> = {};
  
  // Process each AI match
  aiMatches.fieldMatches.forEach(match => {
    const { fieldName, value, confidence } = match;
    
    // Only use matches with confidence above threshold
    if (confidence >= 0.7 && value !== null) {
      // Find the corresponding field
      const field = fields.find(f => 
        f.name === fieldName || 
        f.id === fieldName
      );
      
      if (field) {
        // Use the field's name or id as the key
        const key = field.name || field.id || fieldName;
        formValues[key] = value;
      } else {
        // If no field match found, still include it by fieldName
        formValues[fieldName] = value;
      }
    }
  });
  
  return formValues;
} 