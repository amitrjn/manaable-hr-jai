import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaveRecord extends Document {
  user: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  type: 'annual' | 'sick' | 'unpaid' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvalDate?: Date;
  comments?: string;
}

const leaveRecordSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ['annual', 'sick', 'unpaid', 'other'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reason: {
    type: String,
    required: true,
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  approvalDate: Date,
  comments: String,
}, {
  timestamps: true,
});

export const LeaveRecord = mongoose.model<ILeaveRecord>('LeaveRecord', leaveRecordSchema);
