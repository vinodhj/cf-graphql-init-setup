/* eslint-disable @typescript-eslint/naming-convention */

import { DrizzleD1Database } from 'drizzle-orm/d1';

export class GoogleSheetDataSource {
  private db: DrizzleD1Database;
  constructor({ db }: { db: DrizzleD1Database }) {
    this.db = db;
  }
}
