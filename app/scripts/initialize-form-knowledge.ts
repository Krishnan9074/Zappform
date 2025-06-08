import { buildCommonFormFieldKnowledge } from '../lib/form-field-vectordb';
import { generateEmbedding } from '../lib/google-ai';

async function main() {
  try {
    console.log('Starting form field knowledge base initialization...');
    
    // Initialize common form fields
    const fieldCount = await buildCommonFormFieldKnowledge();
    console.log(`Successfully added ${fieldCount} common form fields to the knowledge base.`);
    
    // Test the embedding model
    console.log('Testing embedding model...');
    const testEmbedding = await generateEmbedding('Test embedding for form fields');
    console.log(`Successfully generated test embedding with ${testEmbedding.length} dimensions.`);
    
    console.log('Knowledge base initialization complete!');
  } catch (error) {
    console.error('Error initializing form field knowledge base:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error); 