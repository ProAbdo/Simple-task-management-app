import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { Check, Circle, Clock3, type LucideIcon } from 'lucide-react';

import { TaskCard } from '@/features/tasks/components/task-card';
import { TASK_STATUS_VALUES, TaskStatus } from '@/features/tasks/task.enums';
import type { Task } from '@/features/tasks/task.types';

interface TaskBoardProps {
  isStatusUpdatePending: boolean;
  onAttachments: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  statusUpdatingTaskId: string | undefined;
  tasks: Task[];
}

interface BoardColumn {
  status: TaskStatus;
  label: string;
  description: string;
  icon: LucideIcon;
  tone: string;
  countTone: string;
}

const boardColumns: BoardColumn[] = [
  {
    status: TaskStatus.Todo,
    label: 'To do',
    description: 'Ready to begin',
    icon: Circle,
    tone: 'text-slate-600',
    countTone: 'bg-slate-200 text-slate-700',
  },
  {
    status: TaskStatus.InProgress,
    label: 'In progress',
    description: 'Actively moving',
    icon: Clock3,
    tone: 'text-amber-600',
    countTone: 'bg-amber-100 text-amber-700',
  },
  {
    status: TaskStatus.Done,
    label: 'Done',
    description: 'Work delivered',
    icon: Check,
    tone: 'text-emerald-600',
    countTone: 'bg-emerald-100 text-emerald-700',
  },
];

export function TaskBoard({
  isStatusUpdatePending,
  onAttachments,
  onDeleteTask,
  onEditTask,
  onStatusChange,
  statusUpdatingTaskId,
  tasks,
}: TaskBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || !TASK_STATUS_VALUES.includes(over.id as TaskStatus)) {
      return;
    }

    const task = active.data.current?.task as Task | undefined;
    const nextStatus = over.id as TaskStatus;

    if (task && task.status !== nextStatus) {
      onStatusChange(task, nextStatus);
    }
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <div className="grid gap-4 xl:grid-cols-3">
        {boardColumns.map((column) => (
          <TaskColumn
            column={column}
            isStatusUpdatePending={isStatusUpdatePending}
            key={column.status}
            onAttachments={onAttachments}
            onDeleteTask={onDeleteTask}
            onEditTask={onEditTask}
            onStatusChange={onStatusChange}
            statusUpdatingTaskId={statusUpdatingTaskId}
            tasks={tasks.filter((task) => task.status === column.status)}
          />
        ))}
      </div>
    </DndContext>
  );
}

function TaskColumn({
  column,
  isStatusUpdatePending,
  onAttachments,
  onDeleteTask,
  onEditTask,
  onStatusChange,
  statusUpdatingTaskId,
  tasks,
}: {
  column: BoardColumn;
  isStatusUpdatePending: boolean;
  onAttachments: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  statusUpdatingTaskId: string | undefined;
  tasks: Task[];
}) {
  const { isOver, setNodeRef } = useDroppable({ id: column.status });
  const Icon = column.icon;

  return (
    <section
      aria-label={`${column.label} tasks`}
      className={`h-full rounded-[1.4rem] border p-3 transition duration-200 ${
        isOver
          ? 'border-indigo-300 bg-indigo-50/80 shadow-lg shadow-indigo-950/[0.05]'
          : 'border-slate-200/80 bg-slate-100/65'
      }`}
      ref={setNodeRef}
    >
      <header className="flex items-center gap-3 px-2 py-2">
        <span
          className={`grid size-9 place-items-center rounded-xl bg-white shadow-sm ${column.tone}`}
        >
          <Icon aria-hidden="true" size={17} strokeWidth={2.5} />
        </span>
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">
            {column.label}
          </h3>
          <p className="text-[0.7rem] font-semibold text-slate-400">
            {column.description}
          </p>
        </div>
        <span
          className={`ml-auto rounded-full px-2.5 py-1 text-xs font-extrabold ${column.countTone}`}
        >
          {tasks.length}
        </span>
      </header>

      <div className="mt-2 min-h-40 space-y-3">
        {tasks.length === 0 ? (
          <div
            className={`grid min-h-40 place-items-center rounded-2xl border border-dashed px-4 text-center text-xs font-bold transition ${
              isOver
                ? 'border-indigo-300 bg-white text-indigo-600'
                : 'border-slate-300 bg-white/55 text-slate-400'
            }`}
          >
            {isOver ? `Move task to ${column.label}` : 'Drop tasks here'}
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              isStatusDisabled={isStatusUpdatePending}
              isUpdatingStatus={
                isStatusUpdatePending && statusUpdatingTaskId === task.id
              }
              key={task.id}
              onAttachments={onAttachments}
              onDelete={onDeleteTask}
              onEdit={onEditTask}
              onStatusChange={onStatusChange}
              task={task}
            />
          ))
        )}
      </div>
    </section>
  );
}
