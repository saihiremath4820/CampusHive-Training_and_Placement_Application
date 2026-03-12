const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false, // true for port 465, false for 587 (STARTTLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a password reset email.
 * @param {string} to       - Recipient email address
 * @param {string} resetLink - Full reset URL
 */
const sendPasswordResetEmail = async (to, resetLink) => {
  const mailOptions = {
    from: `"OpportuneX" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Password Reset Request — OpportuneX",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 32px 40px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">OpportuneX</h1>
          <p style="color: #93c5fd; margin: 6px 0 0; font-size: 13px;">Campus Placement Platform</p>
        </div>
        <!-- Body -->
        <div style="padding: 40px; background: #ffffff;">
          <h2 style="color: #1e293b; margin: 0 0 12px; font-size: 20px;">Password Reset Request</h2>
          <p style="color: #475569; line-height: 1.6; margin: 0 0 24px;">
            We received a request to reset the password for your OpportuneX account associated with this email address.
            Click the button below to reset your password. This link will expire in <strong>15 minutes</strong>.
          </p>
          <!-- CTA Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}"
               style="display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8);
                      color: #ffffff; text-decoration: none; padding: 14px 36px;
                      border-radius: 8px; font-size: 16px; font-weight: 600;
                      letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(37,99,235,0.35);">
              Reset My Password
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 24px 0 0;">
            If the button above doesn't work, copy and paste this link into your browser:<br/>
            <a href="${resetLink}" style="color: #2563eb; word-break: break-all;">${resetLink}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;"/>
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            If you did not request a password reset, you can safely ignore this email.
            Your password will remain unchanged.
          </p>
        </div>
        <!-- Footer -->
        <div style="background: #f1f5f9; padding: 20px 40px; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} OpportuneX — Campus Placement Platform
          </p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { transporter, sendPasswordResetEmail };
