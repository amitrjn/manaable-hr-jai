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
    // Initialize transporter asynchronously
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    try {
      // Create test account using Ethereal Email
      const testAccount = await nodemailer.createTestAccount();
      console.log('Ethereal Email test account created:', {
        user: testAccount.user,
        pass: testAccount.pass,
        previewUrl: 'https://ethereal.email'
      });

      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      // Verify connection configuration
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (err) {
      console.error('Failed to create test email account:', err);
      throw err;
    }
  }

  async sendEmail({ to, subject, text, html }: EmailOptions): Promise<void> {
    try {
      if (!this.transporter) {
        await this.initializeTransporter();
      }

      const info = await this.transporter.sendMail({
        from: '"HR System" <hr@manaable.com>',
        to,
        subject,
        text,
        html,
      });

      console.log('Email sent successfully:', {
        to,
        subject,
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info)
      });
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
