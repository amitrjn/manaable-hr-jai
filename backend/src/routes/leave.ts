import express, { Response, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { auth, AuthRequest } from '../middleware/auth';
import { LeaveRecord, ILeaveRecord } from '../models/LeaveRecord';
import { User } from '../models/User';
import { emailService } from '../utils/emailService';

interface LeaveRequestBody {
  startDate: string;
  endDate: string;
  type: 'annual' | 'sick' | 'unpaid' | 'other';
  reason: string;
}

interface LeaveUpdateBody {
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
}

interface LeaveResponse {
  success: boolean;
  data?: ILeaveRecord | ILeaveRecord[];
  error?: string;
  details?: string;
}

interface LeaveRequestBody {
  startDate: string;
  endDate: string;
  type: 'annual' | 'sick' | 'unpaid' | 'other';
  reason: string;
}

interface LeaveUpdateParams extends ParamsDictionary {
  id: string;
}

interface LeaveUpdateBody {
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
}

const router = express.Router();

// Submit leave request
const createLeaveRequest = async (req: AuthRequest<LeaveRequestBody>, res: Response) => {
  try {
    const { startDate, endDate, type, reason } = req.body;
    const userId = req.user!._id;

    console.log('Creating leave request:', {
      userId,
      startDate,
      endDate,
      type,
      reason
    });

    const leaveRecord = new LeaveRecord({
      user: userId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      type,
      reason,
    });

    const savedRecord = await leaveRecord.save();
    console.log('Leave record saved:', savedRecord);

    // Find manager to notify
    const managers = await User.find({ role: 'manager' });
    console.log('Found managers:', managers);

    if (managers.length > 0) {
      try {
        await emailService.sendLeaveRequestNotification(
          managers[0].email,
          `${req.user!.firstName} ${req.user!.lastName}`,
          new Date(startDate),
          new Date(endDate),
          type
        );
        console.log('Notification sent to manager');
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Continue execution even if email fails
      }
    }

    res.status(201).json(savedRecord);
  } catch (error: any) {
    console.error('Failed to submit leave request:', error);
    res.status(400).json({ 
      error: 'Failed to submit leave request', 
      details: error?.message || 'Unknown error occurred'
    });
  }
};

// Update leave request status (for managers)
const updateLeaveRequest = async (req: AuthRequest<LeaveUpdateBody>, res: Response) => {
  try {
    const { status, comments } = req.body;
    const leaveId = req.params.id;

    // Verify user is a manager
    if (req.user!.role !== 'manager' && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Not authorized to approve/reject leave requests' });
      return;
    }

    const leaveRecord = await LeaveRecord.findById(leaveId).populate('user');
    if (!leaveRecord) {
      res.status(404).json({ error: 'Leave request not found' });
      return;
    }

    leaveRecord.status = status;
    leaveRecord.comments = comments;
    leaveRecord.approvedBy = req.user!._id;
    leaveRecord.approvalDate = new Date();

    await leaveRecord.save();

    // Notify employee of status update
    const employee = await User.findById(leaveRecord.user);
    if (employee) {
      await emailService.sendLeaveStatusUpdateNotification(
        employee.email,
        status,
        leaveRecord.startDate,
        leaveRecord.endDate,
        leaveRecord.type
      );
    }

    res.json(leaveRecord);
  } catch (error: any) {
    console.error('Failed to update leave request:', error);
    res.status(400).json({ 
      error: 'Failed to update leave request',
      details: error?.message || 'Unknown error occurred'
    });
  }
};

const getLeaveRequests = async (req: AuthRequest, res: Response) => {
  try {
    let query = {};
    
    // If employee, show only their requests
    if (req.user!.role === 'employee') {
      query = { user: req.user!._id };
    }

    const leaveRecords = await LeaveRecord.find(query)
      .populate('user', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName');

    res.json(leaveRecords);
  } catch (error: any) {
    console.error('Failed to fetch leave requests:', error);
    res.status(500).json({ 
      error: 'Failed to fetch leave requests',
      details: error?.message || 'Unknown error occurred'
    });
  }
};

// Register routes
router.post('/', auth as RequestHandler, createLeaveRequest);
router.patch('/:id', auth as RequestHandler, updateLeaveRequest);
router.get('/', auth as RequestHandler, getLeaveRequests);

export default router;
