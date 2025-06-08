import { getPineconeClient, getIndex, storeEmbedding, queryEmbeddings } from './pinecone';
import { generateEmbedding } from './google-ai';

// Types
export interface FormFieldKnowledge {
  fieldName: string;
  fieldId: string;
  label: string;
  type: string;
  possibleValues: string[];
  description: string;
  category: string;
  commonVariations: string[];
  userSpecificId?: string;
}

type FilterObject = {
  type: string;
  userSpecificId?: string;
};

/**
 * Stores form field knowledge in the vector database
 */
export async function storeFormFieldKnowledge(knowledge: FormFieldKnowledge) {
  try {
    // Generate embeddings for the field name, label, and description
    const textToEmbed = `${knowledge.fieldName} ${knowledge.label} ${knowledge.description} ${knowledge.commonVariations.join(' ')}`;
    const embedding = await generateEmbedding(textToEmbed);
    
    // Create a unique ID for this knowledge entry
    const id = `field_${knowledge.fieldName}_${Date.now()}`;
    
    // Store in Pinecone
    await storeEmbedding(id, embedding, {
      fieldType: 'form_field', // Use fieldType instead of type to avoid collision
      ...knowledge
    });
    
    return id;
  } catch (error) {
    console.error('Error storing form field knowledge:', error);
    throw error;
  }
}

/**
 * Retrieves relevant form field knowledge based on a form field
 */
export async function retrieveRelevantFieldKnowledge(
  field: {
    name?: string;
    id?: string;
    label?: string;
    type?: string;
  },
  userId?: string
) {
  try {
    // Create a query string from the field properties
    const queryText = `${field.name || ''} ${field.id || ''} ${field.label || ''} ${field.type || ''}`;
    
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(queryText);
    
    // Define filter to only get form field type entries
    const filter: FilterObject = {
      type: 'form_field'
    };
    
    // If userId is provided, also filter for user-specific entries
    if (userId) {
      filter.userSpecificId = userId;
    }
    
    // Query the vector database
    const results = await queryEmbeddings(queryEmbedding, 5, filter);
    
    return results.map(match => {
      // Cast metadata to FormFieldKnowledge with a type assertion
      const metadata = match.metadata as unknown as FormFieldKnowledge;
      return {
        ...metadata,
        score: match.score
      };
    });
  } catch (error) {
    console.error('Error retrieving form field knowledge:', error);
    throw error;
  }
}

/**
 * Builds a knowledge base of common form fields and their variations
 */
export async function buildCommonFormFieldKnowledge() {
  const commonFields = [
    {
      fieldName: 'first_name',
      fieldId: 'fname',
      label: 'First Name',
      type: 'text',
      possibleValues: [],
      description: 'The person\'s first or given name',
      category: 'personal',
      commonVariations: ['firstName', 'first', 'givenName', 'given_name', 'given-name']
    },
    {
      fieldName: 'last_name',
      fieldId: 'lname',
      label: 'Last Name',
      type: 'text',
      possibleValues: [],
      description: 'The person\'s last name, family name, or surname',
      category: 'personal',
      commonVariations: ['lastName', 'last', 'surname', 'family_name', 'family-name']
    },
    {
      fieldName: 'email',
      fieldId: 'email',
      label: 'Email Address',
      type: 'email',
      possibleValues: [],
      description: 'Email address used for communication',
      category: 'contact',
      commonVariations: ['email_address', 'emailAddress', 'e-mail', 'e_mail']
    },
    // Add more common fields as needed
  ];
  
  // Store each field in the vector database
  for (const field of commonFields) {
    await storeFormFieldKnowledge(field as FormFieldKnowledge);
  }
  
  return commonFields.length;
} 