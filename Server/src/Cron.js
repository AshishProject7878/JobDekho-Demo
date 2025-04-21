import cron from 'node-cron';
import Profile from './Models/ProfileModel.js'; 
import Post from './Models/PostModel.js'; 
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to apply to jobs for a user
const applyToJobsForUser = async (profile) => {
  try {
    const { skills, enabled } = profile.autoJobPrefs;
    const resumeUrl = profile.personal.resumeUrl;
    if (!enabled) {
      console.log(`Auto-apply disabled for user ${profile.user}`);
      return { appliedJobs: [], message: 'Auto-apply disabled' };
    }
    if (!skills || skills.length === 0 || !resumeUrl) {
      console.log(`Skipping auto-apply for user ${profile.user}: Missing skills or resume`);
      return { appliedJobs: [], message: 'Missing skills or resume' };
    }

    const normalizedSkills = [...new Set(skills.map(skill => skill.trim().toLowerCase()))];
    const query = {
      applicationDeadline: { $gte: new Date() },
      skills: { $in: normalizedSkills.map(skill => new RegExp(skill, 'i')) },
    };
    const matchingJobs = await Post.find(query).populate('company', 'name rating');

    const appliedJobs = [];
    const appliedJobIds = profile.autoJobApplications.map(app => app.jobId.toString());

    for (const job of matchingJobs) {
      if (appliedJobIds.includes(job._id.toString())) {
        console.log(`Job ${job._id} already applied for user ${profile.user}, skipping`);
        continue;
      }

      // Send email
      if (job.contactEmail) {
        const mailOptions = {
          from: `"Job Applicant" <${process.env.EMAIL_USER}>`,
          to: job.contactEmail,
          replyTo: profile.user.email || 'no-reply@jobdekho.com',
          subject: `Application for ${job.title} at ${job.company?.name || 'Unknown Company'}`,
          html: `
            <h2>Job Application</h2>
            <p>Dear Hiring Manager,</p>
            <p>I am applying for the <strong>${job.title}</strong> position at <strong>${job.company?.name || 'Unknown Company'}</strong>.</p>
            <p>Please find my resume at: <a href="${resumeUrl}">${resumeUrl}</a></p>
            ${profile.personal.videoResumeUrl ? `<p>Video Resume: <a href="${profile.personal.videoResumeUrl}">${profile.personal.videoResumeUrl}</a></p>` : ''}
            <p>Thank you for considering my application. I look forward to the opportunity to discuss my qualifications further.</p>
            <p>Best regards,<br>${profile.user.email ? profile.user.email.split('@')[0] : 'Job Applicant'}</p>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent for job ${job._id} to ${job.contactEmail}`);
      }

      // Update autoJobApplications
      profile.autoJobApplications.push({
        jobId: job._id,
        appliedAt: new Date(),
        status: 'Applied',
        resumeUrl: resumeUrl,
      });
      appliedJobs.push(job._id);
    }

    await profile.save();
    return {
      appliedJobs,
      message: appliedJobs.length > 0
        ? `Successfully applied to ${appliedJobs.length} job(s)`
        : 'No new jobs found matching skills',
    };
  } catch (error) {
    console.error(`Error applying jobs for user ${profile.user}:`, error);
    return { appliedJobs: [], message: 'Error applying to jobs' };
  }
};

// Schedule auto-apply every 3 days at 2 AM
cron.schedule('0 2 */3 * *', async () => {
  console.log('Running auto-apply job at', new Date().toISOString());
  try {
    const profiles = await Profile.find({ 'autoJobPrefs.enabled': true }).populate('user', 'email');
    console.log(`Found ${profiles.length} profiles with auto-apply enabled`);

    for (const profile of profiles) {
      const result = await applyToJobsForUser(profile);
      console.log(`Auto-apply result for user ${profile.user}:`, result);
    }
  } catch (error) {
    console.error('Error running auto-apply cron job:', error);
  }
});

console.log('Auto-apply cron job scheduled to run every 3 days at 2 AM');