import nodemailer from 'nodemailer';

async function testEmail() {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ashishroy78782@gmail.com', // Replace with your Gmail address
        pass: 'nrle bjbn oeex qfqw', // Replace with your Gmail App Password
      },
    });

    const mailOptions = {
      from: `"Test Sender" <your-email@gmail.com>`, // Replace with your Gmail address
      to: 'mysticvoltage0524@gmail.com',
      replyTo: 'no-reply@jobdekho.com',
      subject: 'Test Email from JobDekho',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email from JobDekho.</p>
        <p>Resume: <a href="https://example.com/resume.pdf">Resume</a></p>
        <p>Best regards,<br>Test User</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Email error:', error);
  }
}

testEmail();