/**
 * Interface for task persistence.
 * @template T - The type of tasks managed by the queue.
 */
declare interface Memory<T> {
    /**
     * Retrieve all tasks from the persistence.
     * @returns {Promise<Array<T>>}
     */
    get(): Promise<T[]>;

    /**
     * Save a task to the persistence.
     * @param {T} task - The task to be saved.
     * @returns {Promise<T>}
     */
    save(task: T): Promise<T>;

    /**
     * Delete a task from the persistence.
     * @param {V} task - The task to be deleted.
     * @returns {Promise<void>}
     */
    delete(task: T): Promise<T[]>;
}

/**
 * Options for the task queue.
 * @template Value - The type of tasks managed by the queue.
 */
declare interface Options<Value extends any> {
    /**
     * The action to be executed for each task.
     * @param {T} task - The task to be executed.
     * @returns {Promise<void>}
     */
    callback: (task: T) => Promise<void>;

    /**
     * The error handler for tasks.
     * @param {any} e - The error encountered during task execution.
     */
    error: (e: any) => void;

    /**
     * Optional memory persistence implementation.
     */
    memory?: Memory<Value>;
}

declare interface TaskOptions<T> extends Omit<Options<T>, 'memory'> {
    /**
     * The action to be executed for each task.
     * @param {T} task - The task to be executed.
     * @returns {Promise<void>}
     */
    callback?: (task: T) => Promise<void>;

    /**
     * The error handler for tasks.
     * @param {any} e - The error encountered during task execution.
     */
    error?: (e: any) => void;
    /**
     * Delay in milliseconds before adding the task to the queue.
     */
    delay: number = 1000
}

export { Options, TaskOptions, Memory }