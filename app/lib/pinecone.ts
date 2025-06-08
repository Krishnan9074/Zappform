import { Pinecone } from "@pinecone-database/pinecone";

let pineconeInstance: Pinecone | null = null;

export function getPineconeClient() {
  if (!pineconeInstance) {
    pineconeInstance = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  
  return pineconeInstance;
}

export async function getIndex() {
  const pinecone = getPineconeClient();
  const indexName = process.env.PINECONE_INDEX!;
  
  return pinecone.index(indexName);
}

export async function storeEmbedding(
  id: string,
  vector: number[],
  metadata: Record<string, any>
) {
  const index = await getIndex();
  
  await index.upsert([
    {
      id,
      values: vector,
      metadata,
    },
  ]);
}

export async function queryEmbeddings(
  vector: number[],
  topK: number = 5,
  filter?: Record<string, any>
) {
  const index = await getIndex();
  
  const queryResponse = await index.query({
    vector,
    topK,
    includeMetadata: true,
    filter,
  });
  
  return queryResponse.matches || [];
} 