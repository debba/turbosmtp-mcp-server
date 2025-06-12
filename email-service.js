// email-service.js
import axios from 'axios';

class EmailService {
    constructor() {
        // Base URL for the TurboSMTP analytics API.
        this.apiUrl = 'https://pro.api.serversmtp.com/api/v2';
        // Base URL for sending emails via TurboSMTP.
        this.sendApiUrl = 'https://api.turbo-smtp.com/api/v2';
        // Common headers for all API requests, including authentication secrets.
        this.headers = {
            'Content-Type': 'application/json',
            'consumerKey': process.env.TURBOSMTP_CONSUMER_KEY,
            'consumerSecret': process.env.TURBOSMTP_CONSUMER_SECRET
        };
    }

    // Method for sending emails via the TurboSMTP API.
    async sendEmail({to, subject, text, html, from}) {
        try {
            const payload = {
                to: (Array.isArray(to) ? to : [to]).join(","),
                subject,
                content: text || '',
                html_content: html || '',
                from: from || process.env.TURBOSMTP_FROM_EMAIL
            };

            const response = await axios.post(
                `${this.sendApiUrl}/mail/send`,
                payload,
                {headers: this.headers}
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

    /**
     * Retrieves analytics data from TurboSMTP.
     * @param {object} params - The request parameters.
     * @param {string} params.from - Start date for analytics (format YYYY-MM-DD).
     * @param {string} params.to - End date for analytics (format YYYY-MM-DD).
     * @param {number} [params.page] - Page number (optional).
     * @param {number} [params.limit] - Number of results per page (optional).
     * @param {string} [params.tz] - Timezone (optional).
     * @param {string} [params.filter] - Filter for analytics data (optional).
     * @returns {Promise<object>} - A Promise that resolves with the response JSON data.
     * @throws {Error} If 'from' or 'to' parameters are not valid or if an error occurs during the request.
     */
    async getAnalyticsData({from, to, page, limit, tz, filter}) {
        // Utility function to validate date format.
        const isValidDate = (dateString) => /^\d{4}-\d{2}-\d{2}$/.test(dateString);

        // Validation of 'from' and 'to' parameters.
        if (!from || !isValidDate(from)) {
            throw new Error('The "from" parameter is required and must be in YYYY-MM-DD format.');
        }
        if (!to || !isValidDate(to)) {
            throw new Error('The "to" parameter is required and must be in YYYY-MM-DD format.');
        }

        try {
            // Construction of query parameters.
            const queryParams = new URLSearchParams({from, to});
            if (page) queryParams.append('page', page);
            if (limit) queryParams.append('limit', limit);
            if (tz) queryParams.append('tz', tz);
            if (filter) queryParams.append('filter', filter);

            // Execution of the GET request to the /analytics endpoint.
            // The API key is included in the 'Authorization' header.
            const response = await axios.get(
                `${this.apiUrl}/analytics?${queryParams.toString()}`,
                {
                    headers: this.headers
                }
            );

            // Returning response data on success.
            return {
                success: true,
                message: 'Analytics data successfully retrieved',
                data: response.data
            };
        } catch (error) {
            // Handling HTTP request errors.
            console.error('Error retrieving analytics data:', error.response?.data || error.message);
            throw new Error(
                error.response?.data?.message ||
                'Error retrieving analytics data: ' + error.message
            );
        }
    }


    /**
     * Retrieves analytics data from TurboSMTP by Message ID.
     * @param {string} id - The message ID
     * @throws {Error} If 'from' or 'to' parameters are not valid or if an error occurs during the request.
     */
    async getAnalyticsDataById(id) {

        // Validation of 'id' parameter.
        if (!id) {
            throw new Error('The "id" parameter is required');
        }

        console.log(id);

        try {
            const response = await axios.get(
                `${this.apiUrl}/analytics/${id}`,
                {
                    headers: this.headers
                }
            );

            // Returning response data on success.
            return {
                success: true,
                message: 'Analytics data successfully retrieved',
                data: response.data
            };
        } catch (error) {
            // Handling HTTP request errors.
            console.error('Error retrieving analytics data:', error.response?.data || error.message);
            throw new Error(
                error.response?.data?.message ||
                'Error retrieving analytics data: ' + error.message
            );
        }
    }
}

export default new EmailService();
