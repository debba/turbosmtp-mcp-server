// email-service.js
import axios from 'axios';

class EmailService {
  constructor() {
    this.apiUrl = 'https://api.turbo-smtp.com/api/v2';
    this.headers = {
      'Content-Type': 'application/json',
      'consumerKey': process.env.TURBOSMTP_CONSUMER_KEY,
      'consumerSecret': process.env.TURBOSMTP_CONSUMER_SECRET
    };
  }

  async sendEmail({ to, subject, text, html, from }) {
    try {
      const payload = {
        to: (Array.isArray(to) ? to : [to]).join(","),
        subject,
        content: text || '', 
        html_content: html || '', 
        from: from || process.env.TURBOSMTP_FROM_EMAIL || process.env.TURBOSMTP_CONSUMER_KEY
      };

      const response = await axios.post(
        `${this.apiUrl}/mail/send`,
        payload,
        { headers: this.headers }
      );

      return {
        success: true,
        message: 'Email sent successfully',
        data: response.data
      };
    } catch (error) {
      console.error('Error sending email:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || 
        'Error sending email: ' + error.message
      );
    }
  }

  async validateConfiguration() {
    if (!process.env.TURBOSMTP_CONSUMER_KEY || !process.env.TURBOSMTP_CONSUMER_SECRET) {
      throw new Error('TurboSMTP configuration missing: TURBOSMTP_CONSUMER_KEY and TURBOSMTP_CONSUMER_SECRET are required');
    }
  }
}

export default new EmailService();
