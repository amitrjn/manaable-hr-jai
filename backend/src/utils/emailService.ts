import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

class EmailService {
  private transporter!: nodemailer.Transporter;

  constructor() {
    // Initialize transporter with environment variables or fallback to Ethereal
    if (process.env.NODE_ENV === 'production') {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // For development, create an Ethereal test account synchronously
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: 'test@ethereal.email',
          pass: 'testpass123',
        },
      });
    }
  }

  async sendEmail({ to, subject, text, html }: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        text,
        html,
      });
      console.log(`Email sent successfully to ${to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  // Template for leave request notification
  async sendLeaveRequestNotification(
    managerEmail: string,
    employeeName: string,
    startDate: Date,
    endDate: Date,
    type: string
  ): Promise<void> {
    const subject = `New Leave Request from ${employeeName}`;
    const text = `
      A new leave request has been submitted:
      
      Employee: ${employeeName}
      Leave Type: ${type}
      Start Date: ${startDate.toLocaleDateString()}
      End Date: ${endDate.toLocaleDateString()}
      
      Please login to the HR system to approve or reject this request.
    `;
    
    await this.sendEmail({ to: managerEmail, subject, text });
  }

  // Template for leave request status update
  async sendLeaveStatusUpdateNotification(
    employeeEmail: string,
    status: string,
    startDate: Date,
    endDate: Date,
    type: string
  ): Promise<void> {
    const subject = `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    const text = `
      Your leave request has been ${status}:
      
      Leave Type: ${type}
      Start Date: ${startDate.toLocaleDateString()}
      End Date: ${endDate.toLocaleDateString()}
      
      Please login to the HR system for more details.
    `;
    
    await this.sendEmail({ to: employeeEmail, subject, text });
  }
}

export const emailService = new EmailService();
