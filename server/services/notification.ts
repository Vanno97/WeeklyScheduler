import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

export async function sendNotificationEmail(
  email: string,
  appointmentTitle: string,
  startTime: Date
): Promise<void> {
  const formattedTime = startTime.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const mailOptions = {
    from: process.env.SMTP_USER || process.env.EMAIL_USER || 'noreply@weeklyagenda.com',
    to: email,
    subject: `Reminder: ${appointmentTitle} in 30 minutes`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #1976D2; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">📅 Appointment Reminder</h1>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef;">
          <h2 style="color: #1976D2; margin-top: 0;">${appointmentTitle}</h2>
          <p style="font-size: 16px; color: #333;">
            <strong>⏰ Time:</strong> ${formattedTime}
          </p>
          <p style="font-size: 14px; color: #666;">
            This is a friendly reminder that your appointment is starting in 30 minutes. Please make sure you're prepared and ready to attend.
          </p>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #e3f2fd; border-radius: 4px; border-left: 4px solid #1976D2;">
            <p style="margin: 0; font-size: 14px; color: #1976D2;">
              <strong>💡 Tip:</strong> You can manage your appointments in the Weekly Agenda app.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>This is an automated reminder from Weekly Agenda</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Notification email sent to ${email} for appointment: ${appointmentTitle}`);
  } catch (error) {
    console.error('Failed to send notification email:', error);
    throw error;
  }
}
