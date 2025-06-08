import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

let googleAiInstance: GoogleGenerativeAI | null = null;
let generationModel: GenerativeModel | null = null;
let embeddingModel: GenerativeModel | null = null;

export function getGoogleAiClient() {
  if (!googleAiInstance) {
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY is not set in environment variables');
    }
    googleAiInstance = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  }
  return googleAiInstance;
}

export function getGenerationModel() {
  if (!generationModel) {
    const client = getGoogleAiClient();
    generationModel = client.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });
  }
  return generationModel;
}

export function getEmbeddingModel() {
  if (!embeddingModel) {
    const client = getGoogleAiClient();
    embeddingModel = client.getGenerativeModel({ model: "embedding-001" });
  }
  return embeddingModel;
}

function parseStringToJson(inputString: string) {
  console.log("Raw response:", inputString);
  
  try {
    // First, try to find a JSON object in the string
    const jsonRegex = /{[\s\S]*?}/g;
    const matches = inputString.match(jsonRegex);
    
    if (matches && matches.length > 0) {
      // Use the first match that can be parsed as valid JSON
      for (const match of matches) {
        try {
          return JSON.parse(match);
        } catch (e) {
          console.log("Failed to parse match:", match);
        }
      }
    }
    
    // If no valid JSON object found, try to clean up markdown and parse
    let cleanedString = inputString;
    
    // Remove markdown code blocks
    cleanedString = cleanedString.replace(/```json\n?|\n?```/g, "");
    
    // Remove any non-JSON lines that might be before or after the JSON object
    const jsonStartIndex = cleanedString.indexOf('{');
    const jsonEndIndex = cleanedString.lastIndexOf('}') + 1;
    
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
      cleanedString = cleanedString.substring(jsonStartIndex, jsonEndIndex);
    }
    
    // Try to parse the cleaned string
    return JSON.parse(cleanedString);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    throw new Error("Failed to parse AI response as JSON");
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const model = getEmbeddingModel();
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error("Failed to generate embedding");
  }
}

export async function generateText(prompt: string): Promise<string> {
  try {
    const model = getGenerationModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating text:", error);
    throw new Error("Failed to generate text");
  }
}

export async function analyzeFormFields(
  fields: Array<{
    name: string;
    label?: string;
    type: string;
    id?: string;
    options?: Array<{ value: string; label: string }>;
    required?: boolean;
    validation?: {
      pattern?: string;
      min?: number;
      max?: number;
      minLength?: number;
      maxLength?: number;
    };
    multiple?: boolean;
    accept?: string;
  }>,
  userFiles?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    category?: string;
    metadata?: Record<string, any>;
  }>
) {
  try {
    const model = getGenerationModel();
    
    const prompt = `
    Analyze the following form fields and determine what information they're requesting:
    ${JSON.stringify(fields, null, 2)}
    
    ${userFiles ? `Available user files:
    ${JSON.stringify(userFiles, null, 2)}` : ''}
    
    For each field, provide:
    1. The expected data type (text, number, date, email, etc.)
    2. The category of information (personal, contact, address, professional, payment, etc.)
    3. The specific data point it's requesting (first name, last name, email, address, etc.)
    4. For select/radio/checkbox fields, analyze the options and suggest appropriate values
    5. For file upload fields:
       - Determine the expected file types from the accept attribute
       - Analyze the field label and name for context
       - Suggest the most appropriate file from the user's database
       - Consider file type, size, and metadata
    6. For validation rules, suggest appropriate values that would pass validation
    
    IMPORTANT: Format your response as a valid JSON object with exactly this structure:
    {
      "fieldName": {
        "type": "expected data type",
        "category": "information category",
        "dataPoint": "specific data point",
        "suggestedValue": "appropriate value",
        "validationRules": {
          "pattern": "regex pattern if applicable",
          "min": "minimum value if applicable",
          "max": "maximum value if applicable",
          "minLength": "minimum length if applicable",
          "maxLength": "maximum length if applicable"
        },
        "options": [
          {
            "value": "option value",
            "label": "option label",
            "isRecommended": true/false
          }
        ],
        "fileUpload": {
          "expectedTypes": ["expected file types"],
          "suggestedFileId": "ID of the most appropriate file",
          "reason": "explanation for why this file was chosen"
        }
      }
    }
    
    Do not include any explanations or additional text outside of this JSON structure.
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the response as JSON
    const parsedResponse = parseStringToJson(text);
    
    if (!parsedResponse || typeof parsedResponse !== 'object') {
      throw new Error("Invalid response format from AI");
    }
    
    return parsedResponse;
  } catch (error) {
    console.error("Error analyzing form fields:", error);
    throw new Error("Failed to analyze form fields");
  }
} 