import { Schema, model, Document, Types } from 'mongoose';

export type Priority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'in-progress' | 'done';

export interface ITask extends Document {
  title: string;
  priority: Priority;
  status: TaskStatus;
  completed: boolean;
  dueDate?: Date;
  userId: Types.ObjectId;
  createdAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [1, 'Title must not be empty'],
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: [true, 'Priority is required'],
    },
    status: {
      type: String,
      enum: ['in-progress', 'done'],
      default: 'in-progress',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

export const Task = model<ITask>('Task', TaskSchema);
