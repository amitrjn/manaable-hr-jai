import express, { Request, Response, RequestHandler } from 'express';
import { User, IUser } from '../models/User';
import { generateToken } from '../middleware/auth';

const router = express.Router();

interface RegisterBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department: string;
  role?: 'employee' | 'manager' | 'admin';
}

interface LoginBody {
  email: string;
  password: string;
}

const registerHandler = async (req: Request<{}, any, RegisterBody>, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, department, role } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    const user = new User({
      email,
      password,
      firstName,
      lastName,
      department,
      role: role || 'employee',
    });

    await user.save();
    
    const token = generateToken(user._id.toString());
    
    res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department,
      },
      token,
    });
  } catch (error) {
    res.status(400).json({ error: 'Failed to create user' });
  }
};

const loginHandler = async (req: Request<{}, any, LoginBody>, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid login credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid login credentials' });
      return;
    }

    const token = generateToken(user._id.toString());
    
    res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department,
      },
      token,
    });
  } catch (error) {
    res.status(400).json({ error: 'Login failed' });
  }
};

// Register routes

// Register and login routes
router.post('/register', registerHandler);
router.post('/login', loginHandler);

export default router;
