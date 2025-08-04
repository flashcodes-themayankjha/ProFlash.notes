
// supabaseTasks.ts
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { scheduleNotification, cancelNotification } from './notifications';

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  due_date?: string | null;
  reminder?: string | null;
  tags?: string[] | null;
  repetition?: string | null;
  completed: boolean;
  inserted_at: string;
  updated_at: string;
};

// --- Existing CRUD functions ---

export async function insertTask(
  task: Omit<Task, 'id' | 'inserted_at' | 'updated_at' | 'completed'>
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert([{ ...task, completed: false }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getTasks(user_id: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select()
    .eq('user_id', user_id)
    .order('inserted_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateTask(
  task_id: string,
  updates: Partial<Task>
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', task_id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTask(task_id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', task_id);
  if (error) throw error;
}

// --- State management hook ---

type UseTasksReturn = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'inserted_at' | 'updated_at' | 'completed'>) => Promise<void>;
  updateTaskById: (task_id: string, updates: Partial<Task>) => Promise<void>;
  deleteTaskById: (task_id: string) => Promise<void>;
};

export function useTasks(user_id: string | null): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!user_id) {
      setTasks([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getTasks(user_id);
      setTasks(data);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [user_id]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'inserted_at' | 'updated_at' | 'completed'>) => {
    if (!user_id) {
      setError('User not authenticated.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const newTask = await insertTask({ ...task, user_id });
      setTasks((prev) => [newTask, ...prev]);
      await scheduleNotification(newTask);
    } catch (err: any) {
      setError(err.message ?? 'Failed to add task.');
    } finally {
      setLoading(false);
    }
  }, [user_id]);

  const updateTaskById = useCallback(
    async (task_id: string, updates: Partial<Task>) => {
      setLoading(true);
      setError(null);
      try {
        const updatedTask = await updateTask(task_id, updates);
        setTasks((prev) =>
          prev.map((task) => (task.id === task_id ? updatedTask : task))
        );
        await scheduleNotification(updatedTask);
      } catch (err: any) {
        setError(err.message ?? 'Failed to update task.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteTaskById = useCallback(async (task_id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteTask(task_id);
      setTasks((prev) => prev.filter((task) => task.id !== task_id));
      await cancelNotification(task_id);
    } catch (err: any) {
      setError(err.message ?? 'Failed to delete task.');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    tasks,
    loading,
    error,
    refresh: fetchTasks,
    addTask,
    updateTaskById,
    deleteTaskById,
  };
}
