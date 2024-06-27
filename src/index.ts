import { syncCategoriesAndServices } from 'handlers/sync-categories-and-services';
import { GoogleSheetDataSource } from './datasources';
import { YogaSchemaDefinition, createYoga } from 'graphql-yoga';
import { drizzle } from 'drizzle-orm/d1';
import { schema } from './schemas';

export interface Env {
  DB: D1Database;
  SHEET_ID: string;
  SHEET_API_KEY: string;
  SYNC_TOKEN: string;
}

export interface YogaInitialContext {
  datasources: {
    googleSheetDataSource: GoogleSheetDataSource;
  };
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    const db = drizzle(env.DB);
    const datasources = {
      googleSheetDataSource: new GoogleSheetDataSource({ db }),
    };

    if (url.pathname === '/sync-categories-and-services' && request.method === 'GET') {
      // Sync Categories and Services
      const token = request.headers.get('Authorization');
      if (!token || token !== env.SYNC_TOKEN) {
        return new Response('Unauthorized', { status: 401 });
      }
      try {
        return await syncCategoriesAndServices({ request, datasources, SHEET_ID: env.SHEET_ID, SHEET_API_KEY: env.SHEET_API_KEY });
      } catch (error) {
        return new Response(`Failed to sync : ${error}`, { status: 500 });
      }
    }

    if (url.pathname === '/graphql') {
      const yoga = createYoga({
        schema: schema as YogaSchemaDefinition<object, YogaInitialContext>,
        landingPage: false,
        graphqlEndpoint: '/graphql',
        context: () => ({
          datasources: {
            googleSheetDataSource: new GoogleSheetDataSource({ db }),
          },
        }),
      });
      return yoga.fetch(request);
    }
    return new Response('Not found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;
