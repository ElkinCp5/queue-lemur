# QueueLemur

`QueueLemur` es una cola de tareas con soporte para ejecución diferida y persistencia.

## Instalación

Para instalar el paquete, utiliza npm:
`npm install queue-lemur`

## Uso

A continuación se muestra un ejemplo básico de cómo utilizar QueueLemur en tu proyecto.

### Importar y crear una instancia de QueueLemur

```typescript
import { QueueLemur, QueueLocalMemory } from "queue-lemur";

// Define las opciones de la cola
const options = {
  callback: async (task: any) => {
    // Procesa la tarea
    console.log("Procesando tarea:", task);
  },
  error: (error: Error) => {
    // Maneja errores
    console.error("Error en la tarea:", error.message);
  },
  memory: new QueueLocalMemory<any>(), // Opcional: Puedes proporcionar tu propia implementación de memoria
};

// Crear una instancia de QueueLemur
const queue = new QueueLemur<any>("miCola", options, 2); // La concurrencia es de 2
```

## Agregar tareas a la cola

```typescript
const task1 = { id: 1, name: "Tarea 1" };
const task2 = { id: 2, name: "Tarea 2" };

// Agregar tarea con una demora de 3 segundos
queue.add("task1", task1, { delay: 3000 });

// Agregar otra tarea con una demora de 5 segundos
queue.add("task2", task2, { delay: 5000 });
```

### Métodos disponibles

`add(key: string, task: T, opts?: TaskOptions<T>): Promise<void>`
Agrega una tarea a la cola con una demora especificada.

- `key`: Clave única para la tarea.
- `task`: La tarea a agregar.
- `opts`: Opciones para la tarea, incluyendo la demora.

### `opts: TaskOptions<T>`

- `callback?`: (task: T) => Promise<void> - The action to be executed for each task.
- `error?`: (e: any) => void - The error handler for tasks.

`getTasks(): Map<string, NodeJS.Timeout>`
Devuelve el mapa de temporizadores que contiene todas las tareas activas.

`getTask(key: string): NodeJS.Timeout | undefined`
Recupera un temporizador de tarea específico basado en su clave.

`getQueue(index: number): T | undefined`
Recupera una tarea de la cola basada en su índice.

`hasQueue(): boolean`
Comprueba si hay tareas actualmente en la cola.

`hasTasks(): boolean`
Comprueba si hay tareas activas (temporizadores) en ejecución.

`getQueueLength(): number`
Devuelve la longitud de la cola.

`getName(): string`
Devuelve el nombre de la cola.

# Posibles Mejoras Adicionales:

- `Logging:` Añadir más logging para monitorizar el estado de la cola y las tareas podría ser útil en un entorno de producción.

- `Documentación:` Añadir comentarios y documentación para mejorar la mantenibilidad y la comprensión del código.
