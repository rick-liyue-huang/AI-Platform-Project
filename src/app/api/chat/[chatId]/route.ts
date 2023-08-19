import { StreamingTextResponse, LangChainStream } from 'ai';
import { auth, currentUser } from '@clerk/nextjs';
import { CallbackManager } from 'langchain/callbacks';
import { NextResponse } from 'next/server';
import { MemoryManager } from '@/lib/memory';
import { ratelimit } from '@/lib/rate-limit';
import prismaDB from '@/lib/prisma-db';
import { Replicate } from 'langchain/llms/replicate';

export async function POST(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { prompt } = await request.json();
    const user = await currentUser();

    if (!user || !user.firstName || !user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const identifier = request.url + '-' + user.id;
    const { success } = await ratelimit(identifier);

    if (!success) {
      return new NextResponse('Rate limit exceed', { status: 429 });
    }

    const figure = await prismaDB.figure.update({
      where: {
        id: params.chatId,
        userId: user.id,
      },
      data: {
        messages: {
          create: {
            content: prompt,
            role: 'user',
            userId: user.id,
          },
        },
      },
    });

    if (!figure) {
      return new NextResponse('Figure not found,', { status: 404 });
    }

    const name = figure.id;
    const figure_file_name = name + '.txt';
    const figureKey = {
      figureName: name,
      userId: user.id,
      modelName: 'llama2-13b',
    };

    const memoryManager = await MemoryManager.getInstance();
    const records = await memoryManager.readLatestHistory(figureKey);

    if (records.length === 0) {
      await memoryManager.seedChatHistory(figure.seed, '\n\n', figureKey);
    }

    await memoryManager.writeHistory('User: ' + prompt + '\n', figureKey);

    const recentChatHistory = await memoryManager.readLatestHistory(figureKey);

    const similarDocs = await memoryManager.vectorSearch(
      recentChatHistory,
      figure_file_name
    );

    let relevantHistory = '';
    if (!!similarDocs && similarDocs.length !== 0) {
      relevantHistory = similarDocs.map((doc) => doc.pageContent).join('\n');
    }

    const { handlers } = LangChainStream();

    const model = new Replicate({
      model:
        'a16z-infra/llama-2-13b-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5',
      input: {
        max_length: 2048,
      },
      apiKey: process.env.REPLICATE_API_TOKEN,
      callbackManager: CallbackManager.fromHandlers(handlers),
    });

    model.verbose = true;

    const resp = String(
      await model
        .call(
          `
        ONLY generate plain sentences without prefix of who is speaking. DO NOT use ${figure.name}: prefix. 

        ${figure.instructions}

        Below are relevant details about ${figure.name}'s past and the conversation you are in.
        ${relevantHistory}


        ${recentChatHistory}\n${figure.name}:`
        )
        .catch(console.error)
    );

    // copied
    const cleaned = resp.replaceAll(',', '');
    const chunks = cleaned.split('\n');
    const response = chunks[0];

    await memoryManager.writeHistory('' + response.trim(), figureKey);
    var Readable = require('stream').Readable;

    let s = new Readable();
    s.push(response);
    s.push(null);
    if (response !== undefined && response.length > 1) {
      memoryManager.writeHistory('' + response.trim(), figureKey);

      await prismaDB.figure.update({
        where: {
          id: params.chatId,
        },
        data: {
          messages: {
            create: {
              content: response.trim(),
              role: 'system',
              userId: user.id,
            },
          },
        },
      });
    }

    return new StreamingTextResponse(s);
  } catch (err) {
    console.log('[Chat post], ', err);
    return new NextResponse('Internal Error, ', { status: 500 });
  }
}
