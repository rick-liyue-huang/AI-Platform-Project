import { Redis } from '@upstash/redis';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeClient } from '@pinecone-database/pinecone';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { count } from 'console';

export type FigureKey = {
  figureName: string;
  modelName: string;
  userId: string;
};

export class MemoryManager {
  private static instance: MemoryManager;
  private history: Redis;
  private vectorDBClient: PineconeClient;

  public constructor() {
    this.history = Redis.fromEnv();
    this.vectorDBClient = new PineconeClient();
  }

  public async init() {
    if (this.vectorDBClient instanceof PineconeClient) {
      await this.vectorDBClient.init({
        apiKey: process.env.PINECONE_API_KEY!,
        environment: process.env.PINECONE_ENVIRONMENT!,
      });
    }
  }

  public async vectorSearch(recentChatHistory: string, figureFileName: string) {
    const pineconeClient = <PineconeClient>this.vectorDBClient;
    const pineconeIndex = pineconeClient.Index(
      process.env.PINECONE_INDEX! || ''
    );

    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
      {
        pineconeIndex,
      }
    );

    const similarDocs = await vectorStore
      .similaritySearch(recentChatHistory, 3, { fileName: figureFileName })
      .catch((err) => {
        console.log('Fail to get vector search results: ', err);
      });

    return similarDocs;
  }

  public static async getInstance(): Promise<MemoryManager> {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
      await MemoryManager.instance.init();
    }
    return MemoryManager.instance;
  }

  private generateRedisFigureKey(figureKey: FigureKey): string {
    return `${figureKey.figureName}-${figureKey.modelName}-${figureKey.userId}`;
  }

  public async writeHistory(text: string, figureKey: FigureKey) {
    if (!figureKey || typeof figureKey.userId == 'undefined') {
      console.log('figure key set incorrectly');
      return '';
    }

    const key = this.generateRedisFigureKey(figureKey);
    const result = this.history.zadd(key, {
      score: Date.now(),
      member: text,
    });

    return result;
  }

  public async readLatestHistory(figureKey: FigureKey): Promise<string> {
    if (!figureKey || typeof figureKey.userId == 'undefined') {
      console.log('figure key set incorrectly');
      return '';
    }

    const key = this.generateRedisFigureKey(figureKey);
    let result = await this.history.zrange(key, 0, Date.now(), {
      byScore: true,
    });

    result = result.slice(-30).reverse();
    const recentChats = result.reverse().join('\n');
    return recentChats;
  }

  // see the chat history
  public async seedChatHistory(
    seedContent: string,
    figureKey: FigureKey,
    delimiter: string = '\n'
  ) {
    const key = this.generateRedisFigureKey(figureKey);
    if (await this.history.exists(key)) {
      console.log('User already has chat history');
      return;
    }

    const content = seedContent.split(delimiter);
    let counter = 0;
    for (const line of content) {
      await this.history.zadd(key, { score: counter, member: line });
      counter += 1;
    }
  }
}
