import { QueueLocalMemory, QueueLemur, QueueOptions } from '../../';

// Mock para una implementación de memoria simple para pruebas.
class MockMemory<T> extends QueueLocalMemory<T> { }
const mockAction = jest.fn();
const mockError = jest.fn();

describe('QueueLemur {Add tasks}', () => {
  let queue: QueueLemur<string>;
  const options: QueueOptions<string> = {
    action: mockAction,
    error: mockError,
    memory: new MockMemory<string>()
  };

  beforeEach(() => {
    queue = new QueueLemur<string>('testQueue', options);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should add tasks to the queue and process them', async () => {
    await queue.add('key1', 'task1', 1000);
    await queue.add('key2', 'task2', 1000);
    expect(queue.hasTasks()).toBe(true);

    // Simulate processing loop (runs tasks until queue is empty).
    await new Promise(resolve => setTimeout(resolve, 3000)); // Allow time for tasks to process.

    expect(mockAction.mock.calls).toHaveLength(3); // Both tasks should have been processed.
    expect(mockError).not.toHaveBeenCalled(); // No errors should have been reported.
  });

  test('should handle errors', async () => {
    mockAction.mockRejectedValueOnce(new Error('Failed to process task'));

    await queue.add('key1', 'task1', 1000);
    expect(queue.hasTasks()).toBe(true);
    // Simulate processing loop (runs tasks until queue is empty).
    await new Promise(resolve => setTimeout(resolve, 3000)); // Allow time for tasks to process.

    expect(mockAction.mock.calls).toHaveLength(2); // Action should have been called once.
    expect(mockError.mock.calls).toHaveLength(1); // Error handler should have been called.
    expect(mockError).toHaveBeenCalledWith(expect.any(Error)); // Error handler should receive an Error object.
  });
});

