import { QueueLocalMemory } from "./QueueLocalMemory";
import { Memory, Options } from "./types";

// /**
//  * Task queue with support for delayed execution and persistence.
//  * @template T - The type of tasks managed by the queue.
//  */
// export class QueueLemur<T> {
//     private queue: T[] = [];
//     private processing = false;
//     private timers: Map<string, NodeJS.Timeout> = new Map();
//     private memory: Memory<T> = new QueueLocalMemory<T>();

//     /**
//      * Creates an instance of QueueLemur.
//      * @param {string} name - The name of the queue.
//      * @param {Options<T>} opts - The options for the queue, including action, error handler, and optional memory persistence.
//      */
//     constructor(
//         private readonly name: string,
//         private readonly opts: Options<T>,
//     ) {
//         this.run = this.run.bind(this);
//         this.getTasks = this.getTasks.bind(this);
//         this.getTask = this.getTask.bind(this);
//         this.getQueue = this.getQueue.bind(this);
//         this.hasQueue = this.hasQueue.bind(this);
//         this.hasTasks = this.hasTasks.bind(this);
//         this.initialize();
//     }

//     /**
//      * Initializes the queue by loading persistent tasks and starts processing if needed.
//      */
//     private async initialize() {
//         this.queue = await (this.opts?.memory || this.memory).get();
//         if (this.hasItem(this.queue)) {
//             this.run();
//         }
//     }

//     /**
//      * Adds a task to the queue with a specified delay.
//      * @param {string} key - Unique key for the task.
//      * @param {T} task - The task to be added.
//      * @param {number} [ms=1000] - Delay in milliseconds before adding the task to the queue.
//      * @returns {Promise<void>}
//      */
//     public async add(key: string, task: T, ms: number = 1000): Promise<void> {

//         if (this.timers.has(key)) {
//             clearTimeout(this.timers.get(key));
//             this.timers.delete(key);
//         }

//         this.timers.set(key, setTimeout(async () => {
//             await (this.opts?.memory || this.memory).save(task);
//             this.queue.push(task);
//             this.timers.delete(key);
//             if (!this.processing) {
//                 this.processing = true;
//                 this.run();
//             }
//         }, ms));

//         return new Promise((resolve) => setTimeout(resolve, 500));
//     }

//     /**
//      * Processes tasks in the queue one by one.
//      */
//     private async run(): Promise<void> {
//         if (!this.hasItem(this.queue)) {
//             this.processing = false;
//             return;
//         }

//         const task = this.queue.shift();
//         if (!task) {
//             this.processing = false;
//             return;
//         }
//         this.processing = true;

//         try {
//             this.queue = this.queue.filter((i) => this.compare(i, task))
//             await this.opts.action(task);
//             await (this.opts?.memory || this.memory).delete(task);
//         } catch (e: any) {
//             e.message = `${this.name} - ${e.message}`;
//             this.opts.error(e);
//         } finally {
//             this.run();
//         }
//     }

//     /**
//      * Checks if the queue has elements.
//      * @param {any} arg - The argument to check.
//      * @returns {boolean} `true` if the argument is a non-empty array, `false` otherwise.
//      */
//     private hasItem(arg: any): arg is Array<any> {
//         return Array.isArray(arg) && arg.length > 0;
//     }

//     private clean(val: any) {
//         return JSON.stringify(val)
//             .replace(/[^a-zA-Z0-9-]/g, '')
//             .replace(/\s+/g, '');
//     }

//     private compare(search: any, compare: any): boolean {
//         return this.clean(search) == this.clean(compare);
//     }

//     /**
//      * Returns the timers map containing all tasks keyed by their identifiers.
//      * @returns A Map object containing all active timers.
//      */
//     public getTasks(): Map<string, NodeJS.Timeout> {
//         return this.timers;
//     }

//     /**
//      * Retrieves a specific task timer based on its key.
//      * @param key - The identifier of the task timer to retrieve.
//      * @returns The NodeJS.Timeout object associated with the provided key, or undefined if not found.
//      */
//     public getTask(key: string): NodeJS.Timeout | undefined {
//         return this.timers.get(key);
//     }

//     /**
//      * Retrieves a task from the queue based on its index.
//      * @param index - The index of the task in the queue.
//      * @returns The task object at the specified index in the queue, or undefined if the index is out of bounds.
//      */
//     public getQueue(index: number): T | undefined {
//         return this.queue[index];
//     }

//     /**
//      * Checks if there are tasks currently queued.
//      * @returns true if there are tasks in the queue, false otherwise.
//      */
//     public hasQueue(): boolean {
//         return this.hasItem(this.queue);
//     }

//     /**
//      * Checks if there are any active tasks (timers) currently running.
//      * @returns true if there are active tasks (timers), false otherwise.
//      */
//     public hasTasks(): boolean {
//         return this.timers.size > 0;
//     }

// }

/**
 * Task queue with support for delayed execution and persistence.
 * @template T - The type of tasks managed by the queue.
 */
export class QueueLemur<T> {
    private queue: T[] = [];
    private processingCount = 0;
    private timers: Map<string, NodeJS.Timeout> = new Map();
    private memory: Memory<T> = new QueueLocalMemory<T>();

    /**
     * Creates an instance of QueueLemur.
     * @param {string} name - The name of the queue.
     * @param {Options<T>} opts - The options for the queue, including action, error handler, and optional memory persistence.
     * @param {number} concurrency - The maximum number of concurrent tasks to process.
     */
    constructor(
        private readonly name: string,
        private readonly opts: Options<T>,
        private readonly concurrency: number = 1 // Default to 1 for no concurrency
    ) {
        this.run = this.run.bind(this);
        this.getTasks = this.getTasks.bind(this);
        this.getTask = this.getTask.bind(this);
        this.getQueue = this.getQueue.bind(this);
        this.hasQueue = this.hasQueue.bind(this);
        this.hasTasks = this.hasTasks.bind(this);
        this.initialize();
    }

    /**
     * Initializes the queue by loading persistent tasks and starts processing if needed.
     */
    private async initialize() {
        this.queue = await (this.opts?.memory || this.memory).get();
        if (this.hasItem(this.queue)) {
            this.run();
        }
    }

    /**
     * Adds a task to the queue with a specified delay.
     * @param {string} key - Unique key for the task.
     * @param {T} task - The task to be added.
     * @param {number} [ms=1000] - Delay in milliseconds before adding the task to the queue.
     * @returns {Promise<void>}
     */
    public async add(key: string, task: T, ms: number = 1000): Promise<void> {

        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
            this.timers.delete(key);
        }

        this.timers.set(key, setTimeout(async () => {
            await (this.opts?.memory || this.memory).save(task);
            this.queue.push(task);
            this.timers.delete(key);
            if (this.processingCount < this.concurrency) {
                this.processingCount++;
                this.run();
            }
        }, ms));

        return new Promise((resolve) => setTimeout(resolve, 500));
    }

    /**
     * Processes tasks in the queue up to the concurrency limit.
     */
    private async run(): Promise<void> {
        if (!this.hasItem(this.queue)) {
            this.processingCount--;
            return;
        }

        const task = this.queue.shift();
        if (!task) {
            this.processingCount--;
            return;
        }

        try {
            this.queue = this.queue.filter((i) => this.compare(i, task))
            await this.opts.action(task);
            await (this.opts?.memory || this.memory).delete(task);
        } catch (e: any) {
            e.message = `${this.name} - ${e.message}`;
            this.opts.error(e);
        } finally {
            this.run();
        }
    }

    /**
     * Checks if the queue has elements.
     * @param {any} arg - The argument to check.
     * @returns {boolean} `true` if the argument is a non-empty array, `false` otherwise.
     */
    private hasItem(arg: any): arg is Array<any> {
        return Array.isArray(arg) && arg.length > 0;
    }

    private clean(val: any) {
        return JSON.stringify(val)
            .replace(/[^a-zA-Z0-9-]/g, '')
            .replace(/\s+/g, '');
    }

    private compare(search: any, compare: any): boolean {
        return this.clean(search) == this.clean(compare);
    }

    /**
     * Returns the timers map containing all tasks keyed by their identifiers.
     * @returns A Map object containing all active timers.
     */
    public getTasks(): Map<string, NodeJS.Timeout> {
        return this.timers;
    }

    /**
     * Retrieves a specific task timer based on its key.
     * @param key - The identifier of the task timer to retrieve.
     * @returns The NodeJS.Timeout object associated with the provided key, or undefined if not found.
     */
    public getTask(key: string): NodeJS.Timeout | undefined {
        return this.timers.get(key);
    }

    /**
     * Retrieves a task from the queue based on its index.
     * @param index - The index of the task in the queue.
     * @returns The task object at the specified index in the queue, or undefined if the index is out of bounds.
     */
    public getQueue(index: number): T | undefined {
        return this.queue[index];
    }

    /**
     * Checks if there are tasks currently queued.
     * @returns true if there are tasks in the queue, false otherwise.
     */
    public hasQueue(): boolean {
        return this.hasItem(this.queue);
    }

    /**
     * Checks if there are any active tasks (timers) currently running.
     * @returns true if there are active tasks (timers), false otherwise.
     */
    public hasTasks(): boolean {
        return this.timers.size > 0;
    }

    /**
     * Returns the length of the queue.
     * @returns The number of tasks in the queue.
     */
    public getQueueLength(): number {
        return this.queue.length;
    }

    /**
     * Returns the name of the queue.
     * @returns The name of the queue.
     */
    public getName(): string {
        return this.name;
    }
}


export type QueueMemory<T> = Memory<T>;
export type QueueOptions<T> = Options<T>;