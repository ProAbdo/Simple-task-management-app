import {
  Schema,
  model,
  type HydratedDocument,
  type InferSchemaType,
} from "mongoose";

import {
  TASK_PRIORITY_VALUES,
  TASK_STATUS_VALUES,
} from "./task.enums.js";

const taskAttachmentSchema = new Schema(
  {
    originalName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    storedName: {
      type: String,
      required: true,
      select: false,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
      min: 1,
    },
    uploadedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    _id: true,
    versionKey: false,
  },
);

const taskSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 2_000,
    },
    status: {
      type: String,
      required: true,
      enum: TASK_STATUS_VALUES,
    },
    priority: {
      type: String,
      required: true,
      enum: TASK_PRIORITY_VALUES,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    attachments: {
      type: [taskAttachmentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

taskSchema.index({ owner: 1, createdAt: -1 });
taskSchema.index({
  owner: 1,
  status: 1,
  priority: 1,
  createdAt: -1,
});

export type Task = InferSchemaType<typeof taskSchema>;
export type TaskDocument = HydratedDocument<Task>;

export const TaskModel = model<Task>("Task", taskSchema);
