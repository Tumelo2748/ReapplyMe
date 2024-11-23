import sgMail from '@sendgrid/mail';

sgMail.setApiKey(import.meta.env.VITE_SENDGRID_API_KEY);

export const sendJobApplication = async ({ to, subject, coverLetter, resume }) => {
  const msg = {
    to,
    from: 'your-verified-sender@yourdomain.com', // Must be verified in SendGrid
    subject,
    text: coverLetter,
    attachments: [
      {
        content: resume,
        filename: 'resume.pdf',
        type: 'application/pdf',
        disposition: 'attachment'
      }
    ]
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};
