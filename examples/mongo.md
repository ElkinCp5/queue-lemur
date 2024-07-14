```typescript
// Example 1
import { MongoClient } from "mongodb";
import { QueueLemur, QueueMemory, QueueOptions } from "queue-lemur";

export class MongoMemory<T> implements QueueMemory<T> {
  private client: MongoClient;
  private dbName: string = "taskQueueDB";
  private collectionName: string = "tasks";

  constructor(uri: string) {
    this.client = new MongoClient(uri);
  }

  async connect() {
    await this.client.connect();
  }

  async save(task: T): Promise<T> {
    const db = this.client.db(this.dbName);
    const collection = db.collection(this.collectionName);
    return await collection.insertOne(task);
  }

  async get(): Promise<T[]> {
    const db = this.client.db(this.dbName);
    const collection = db.collection(this.collectionName);
    return collection.find().toArray() as Promise<T[]>;
  }

  async delete(task: T & { _id: any }): Promise<T[]> {
    const db = this.client.db(this.dbName);
    const collection = db.collection(this.collectionName);
    await collection.deleteOne({ _id: task._id });
    return collection.find().toArray() as Promise<T[]>;
  }
}

const memory = new MongoMemory<any>("mongodb://localhost:27017");
await memory.connect();

const options: QueueOptions<any> = {
  action: mockAction,
  error: mockError,
  memory: memory,
};

const queue = new QueueLemur<any>("testQueue", options);
```
