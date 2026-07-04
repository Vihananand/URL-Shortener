import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

export async function sendEmailOTP(email: string, otp: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'URL Shortener <onboarding@resend.dev>', // Update this when deploying to a domain
      to: [email],
      subject: 'Your 2FA Login Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Your Verification Code</h2>
          <p>Please use the following code to complete your login:</p>
          <div style="font-size: 24px; font-weight: bold; padding: 10px; background-color: #f4f4f4; border-radius: 5px; width: fit-content; letter-spacing: 2px;">
            ${otp}
          </div>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in sendEmailOTP:', error);
    return false;
  }
}
