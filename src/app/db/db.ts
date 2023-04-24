import { Injectable } from '@nestjs/common';
import { type Db, MongoClient } from 'mongodb';

@Injectable()
export class MongoService {
  private db: Db | undefined;

  async getDb(): Promise<Db> {
    if (!this.db) {
      const url = 'mongodb://localhost:27017';
      const client = new MongoClient(url);
      await client.connect();
      this.db = client.db('mydb');
    }
    return this.db;
  }
}
