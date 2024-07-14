import { Memory } from "./types";

export class QueueLocalMemory<T> implements Memory<T> {
  private tasks: T[] = [];

  async get(): Promise<T[]> {
    return this.tasks;
  }

  async save(task: T): Promise<T> {
    this.tasks.push(task);
    return new Promise((resolve) => setTimeout(() => resolve(task), 1000));
  }

  async delete(task: T): Promise<T[]> {
    this.tasks = this.tasks.filter(t => JSON.stringify(t) !== JSON.stringify(task));
    return this.tasks
  }
}