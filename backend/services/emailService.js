const nodemailer = require('nodemailer');

// 1. Create SMTP transporter using environment variables
const emailHost = process.env.EMAIL_HOST || 'sandbox.smtp.mailtrap.io';
const emailPort = parseInt(process.env.EMAIL_PORT || '2525', 10);
const emailUser = process.env.EMAIL_USER || '';
const rawPass = process.env.EMAIL_PASS || '';

// Clean password by stripping spaces for Gmail App Passwords
const isGmail = emailHost.includes('gmail.com') || emailUser.includes('gmail.com');
const emailPass = isGmail ? rawPass.replace(/\s+/g, '') : rawPass.trim();

const transporter = nodemailer.createTransport({
  host: emailHost,
  port: emailPort,
  secure: emailPort === 465, // true for port 465, false for other ports (like 587)
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

// Verify connection configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email SMTP server connection failed:', error.stack || error.message);
  } else {
    console.log('✅ Email SMTP server is ready to take messages');
  }
});

// Helper wrapper for layout styling consistent with modern UI/UX design (dark gradient)
const wrapTemplate = (title, content) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #0f172a;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #f1f5f9;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .header {
          padding: 30px 40px;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          text-align: center;
        }
        .logo {
          font-size: 24px;
          font-weight: 800;
          color: #61dafb;
          text-decoration: none;
          letter-spacing: -0.02em;
        }
        .body {
          padding: 40px;
          line-height: 1.6;
        }
        .footer {
          padding: 24px 40px;
          background-color: rgba(15, 23, 42, 0.5);
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
        }
        h1 {
          font-size: 22px;
          font-weight: 700;
          margin-top: 0;
          color: #ffffff;
        }
        p {
          margin: 0 0 20px 0;
          font-size: 15px;
          color: #cbd5e1;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #61dafb;
          color: #0f172a !important;
          border-radius: 8px;
          font-weight: 700;
          text-decoration: none;
          margin: 10px 0 20px 0;
          box-shadow: 0 4px 12px rgba(97, 218, 251, 0.2);
          text-align: center;
        }
        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background-color: rgba(15, 23, 42, 0.3);
          border-radius: 8px;
          overflow: hidden;
        }
        .details-table td {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          font-size: 14px;
        }
        .details-table td.label {
          font-weight: 700;
          color: #94a3b8;
          width: 30%;
        }
        .details-table td.value {
          color: #ffffff;
        }
        .details-table tr:last-child td {
          border-bottom: none;
        }
        .message-box {
          background-color: rgba(15, 23, 42, 0.4);
          border-left: 3px solid #61dafb;
          padding: 16px;
          border-radius: 0 8px 8px 0;
          margin: 20px 0;
          font-style: italic;
          color: #e2e8f0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🔍 Lost & Found</div>
        </div>
        <div class="body">
          ${content}
        </div>
        <div class="footer">
          <p style="margin: 0;">© ${new Date().getFullYear()} Lost & Found Management System. All rights reserved.</p>
          <p style="margin: 5px 0 0 0; font-size: 11px;">You received this email because you are registered on our platform.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generic Send Email Function
const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Lost & Found Support" <no-reply@lostandfound.com>',
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email successfully dispatched: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email dispatch failed:', error);
    // Silent fail in production or resolve error gracefully depending on service constraints
    throw new Error(`Email delivery error: ${error.message}`);
  }
};

// Welcome Onboarding Email
const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to Lost & Found!';
  const content = `
    <h1>Hello, ${user.name}!</h1>
    <p>Thank you for creating an account on the Lost & Found Management System. We are thrilled to welcome you to our community!</p>
    <p>Our platform helps users report lost belongings, log found items, and match claims with other users to securely return items.</p>
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">Go to Dashboard</a>
    </div>
    <p>If you have any questions or require help navigating the platform, please do not hesitate to contact our team.</p>
    <p>Best regards,<br>The Lost & Found Team</p>
  `;
  return sendEmail({ to: user.email, subject, html: wrapTemplate(subject, content) });
};

// Claim Request Received Email
const sendClaimRequestEmail = async (owner, claimer, itemTitle, claimMessage, dashboardLink) => {
  const subject = 'New Claim Request Received';
  const content = `
    <h1>Hello, ${owner.name}!</h1>
    <p>Another user has submitted a claim request for your reported item: <strong>"${itemTitle}"</strong>.</p>
    
    <table class="details-table">
      <tr>
        <td class="label">Claimer Name</td>
        <td class="value">${claimer.name}</td>
      </tr>
      <tr>
        <td class="label">Claimer Email</td>
        <td class="value">${claimer.email}</td>
      </tr>
    </table>

    <p><strong>Claimer Proof/Message:</strong></p>
    <div class="message-box">
      "${claimMessage}"
    </div>

    <p>Please review this claim request from your received claims dashboard and determine if you would like to approve or reject it. You can also chat with them directly to ask for additional details.</p>
    
    <div style="text-align: center;">
      <a href="${dashboardLink}" class="button">Review Claim Request</a>
    </div>
  `;
  return sendEmail({ to: owner.email, subject, html: wrapTemplate(subject, content) });
};

// Claim Approval or Rejection Status Update Email
const sendClaimStatusEmail = async (claimer, itemTitle, status, dashboardLink) => {
  const isApproved = status === 'approved';
  const subject = isApproved ? 'Your Claim Request has been APPROVED! 🎉' : 'Update regarding your Claim Request';
  
  const content = isApproved ? `
    <h1>Congratulations, ${claimer.name}!</h1>
    <p>Your claim request for the item <strong>"${itemTitle}"</strong> has been <strong>approved</strong> by the item reporter.</p>
    <p>You can now coordinate pickup details, exchange contact info, or discuss delivery options through the chat room associated with this claim request.</p>
    <div style="text-align: center;">
      <a href="${dashboardLink}" class="button">Open Chat Room</a>
    </div>
    <p>Thank you for using our platform!</p>
  ` : `
    <h1>Hello, ${claimer.name},</h1>
    <p>We are writing to inform you that your claim request for the item <strong>"${itemTitle}"</strong> has been <strong>rejected</strong>.</p>
    <p>This may be because the reporter approved a claim from another user, or the details did not match. Feel free to browse other matching reports or contact support if you believe this was an error.</p>
    <div style="text-align: center;">
      <a href="${dashboardLink}" class="button">Go to Dashboard</a>
    </div>
  `;

  return sendEmail({ to: claimer.email, subject, html: wrapTemplate(subject, content) });
};

// Password Recovery Email
const sendPasswordResetEmail = async (user, resetUrl) => {
  const subject = 'Password Reset Request';
  const content = `
    <h1>Hello, ${user.name},</h1>
    <p>We received a request to reset your password for your account on the Lost & Found Management System.</p>
    <p>You can reset your password by clicking the button below. This link is valid for <strong>10 minutes</strong>.</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </div>
    <p>If you did not make this request, you can safely ignore this email. Your password will remain unchanged.</p>
    <p>Please do not share this link with anyone.</p>
  `;
  return sendEmail({ to: user.email, subject, html: wrapTemplate(subject, content) });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendClaimRequestEmail,
  sendClaimStatusEmail,
  sendPasswordResetEmail,
};
