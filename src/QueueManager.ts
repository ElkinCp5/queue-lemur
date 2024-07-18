import { QueueLemur } from './QueueLemur';
import { Options, TaskOptions } from "./types";
/**
 * ConcurrentQueueManager class to manage multiple instances of QueueLemur for concurrent task processing.
 * @template T - The type of tasks managed by the queue.
 */
export class QueueManager<T> {
    private queues: QueueLemur<T>[];

    /**
     * Creates an instance of ConcurrentQueueManager.
     * @param {number} numberOfQueues - The number of QueueLemur instances to manage.
     * @param {Options<T>} opts - The options for each QueueLemur instance.
     * @param {number} concurrency - The maximum number of concurrent tasks per queue.
     */
    constructor(
        private readonly numberOfQueues: number,
        private readonly opts: Options<T>,
        private readonly concurrency: number = 1 // Default to 1 for no concurrency per queue
    ) {
        this.queues = Array.from({ length: this.numberOfQueues }, (_, index) =>
            new QueueLemur<T>(`Queue-${index + 1}`, this.opts, this.concurrency)
        );
    }

    /**
     * Adds a task to the least loaded queue.
     * @param {string} key - Unique key for the task.
     * @param {T} task - The task to be added.
     * @param {number} [ms=1000] - Delay in milliseconds before adding the task to the queue.
     * @returns {Promise<void>}
     */
    public async addTask(key: string, task: T, opts?: TaskOptions<T>): Promise<void> {
        const leastLoadedQueue = this.queues.reduce((prev, curr) =>
            prev.getQueueLength() < curr.getQueueLength() ? prev : curr
        );
        await leastLoadedQueue.add(key, task, opts);
    }

    /**
     * Gets the total number of tasks in all queues.
     * @returns The total number of tasks.
     */
    public getTotalTasks(): number {
        return this.queues.reduce((total, queue) => total + queue.getQueueLength(), 0);
    }

    /**
     * Gets the status of all queues.
     * @returns An array of queue statuses.
     */
    public getQueueStatuses(): { name: string; length: number }[] {
        return this.queues.map(queue => ({
            name: queue.getName(),
            length: queue.getQueueLength()
        }));
    }
}
