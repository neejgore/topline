// Simple email alerting service for Topline system
const nodemailer = require('nodemailer')

class AlertService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: 'gmail', // or your preferred email service
      auth: {
        user: process.env.ALERT_EMAIL_USER,
        pass: process.env.ALERT_EMAIL_PASS
      }
    })
    this.adminEmail = process.env.ADMIN_EMAIL || 'your-email@example.com'
  }

  async sendAlert(subject, message, severity = 'ERROR') {
    try {
      const emailContent = {
        from: process.env.ALERT_EMAIL_USER,
        to: this.adminEmail,
        subject: `🚨 Topline Alert: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: ${severity === 'ERROR' ? '#dc2626' : '#f59e0b'}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
              <h2 style="margin: 0;">${severity === 'ERROR' ? '🚨' : '⚠️'} Topline System Alert</h2>
            </div>
            <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
              <h3 style="color: #1f2937; margin-top: 0;">${subject}</h3>
              <p style="color: #4b5563; line-height: 1.5;">${message}</p>
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px;">
                  <strong>Time:</strong> ${new Date().toLocaleString()}<br>
                  <strong>System:</strong> Topline Sales Intelligence Platform<br>
                  <strong>Environment:</strong> ${process.env.NODE_ENV || 'production'}
                </p>
              </div>
            </div>
          </div>
        `
      }

      await this.transporter.sendMail(emailContent)
      console.log(`✅ Alert sent: ${subject}`)
      
    } catch (error) {
      console.error('❌ Failed to send alert:', error)
      // Don't throw - we don't want alert failures to break the main system
    }
  }

  // Specific alert types
  async alertContentRefreshFailed(details) {
    await this.sendAlert(
      'Content Refresh Failed',
      `The daily content refresh has failed. Details: ${details}. Please check the system logs and RSS feed sources.`,
      'ERROR'
    )
  }

  async alertMetricsPoolLow(poolSize) {
    await this.sendAlert(
      'Metrics Pool Running Low',
      `The metrics pool has dropped to ${poolSize} available metrics. Consider running the metrics population script or adding new metrics to prevent content gaps.`,
      'WARNING'
    )
  }

  async alertDatabaseError(error) {
    await this.sendAlert(
      'Database Connection Error',
      `Database operation failed: ${error.message}. This may affect content display and user experience.`,
      'ERROR'
    )
  }

  async alertCronJobFailed(jobName, error) {
    await this.sendAlert(
      `Cron Job Failed: ${jobName}`,
      `The scheduled ${jobName} job has failed with error: ${error.message}. Content may not be refreshing as expected.`,
      'ERROR'
    )
  }

  async alertApiError(endpoint, error) {
    await this.sendAlert(
      `API Endpoint Error: ${endpoint}`,
      `The ${endpoint} API is returning errors: ${error.message}. This may affect website functionality.`,
      'ERROR'
    )
  }
}

module.exports = new AlertService() 