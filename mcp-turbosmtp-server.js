// mcp-turbosmtp-server.js
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import EmailService from './email-service.js';

class TurboSMTPMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'turbosmtp-email-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // Handler for the list of available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'send_email',
            description: 'Send an email via TurboSMTP',
            inputSchema: {
              type: 'object',
              properties: {
                to: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'List of recipient email addresses'
                },
                subject: {
                  type: 'string',
                  description: 'Email subject'
                },
                text: {
                  type: 'string',
                  description: 'Text content of the email'
                },
                html: {
                  type: 'string',
                  description: 'HTML content of the email (optional)'
                },
                from: {
                  type: 'string',
                  description: 'Sender email address (optional, uses configured one if not specified)'
                }
              },
              required: ['to', 'subject', 'text']
            }
          },
          {
            name: 'get_analytics_data',
            description: 'Retrieve analytics data from TurboSMTP for a specific date range',
            inputSchema: {
              type: 'object',
              properties: {
                from: {
                  type: 'string',
                  description: 'Start date for analytics (format: YYYY-MM-DD)',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$'
                },
                to: {
                  type: 'string',
                  description: 'End date for analytics (format: YYYY-MM-DD)',
                  pattern: '^\\d{4}-\\d{2}-\\d{2}$'
                },
                page: {
                  type: 'number',
                  description: 'Page number (optional)',
                  minimum: 1
                },
                limit: {
                  type: 'number',
                  description: 'Number of results per page (optional)',
                  minimum: 1,
                  maximum: 100
                },
                tz: {
                  type: 'string',
                  description: 'Timezone (optional, e.g., "Europe/Rome", "America/New_York")'
                },
                filter: {
                  type: 'string',
                  description: 'Filter for analytics data (optional)'
                }
              },
              required: ['from', 'to']
            }
          },
          {
            name: 'get_analytics_data_by_id',
            description: 'Retrieve analytics data from TurboSMTP by specific message ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'Message ID'
                }
              },
              required: ['id']
            }
          }
        ]
      };
    });

    // Handler for tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'send_email':
            return await this.handleSendEmail(args);
          case 'get_analytics_data':
            return await this.handleGetAnalyticsData(args);

          case 'get_analytics_data_by_id':
            return await this.handleGetAnalyticsDataById(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  async handleSendEmail(args) {
    const { to, subject, text, html, from } = args;

    // Input validation
    if (!to || !Array.isArray(to) || to.length === 0) {
      throw new Error('The "to" field must be a non-empty array of email addresses');
    }

    if (!subject || typeof subject !== 'string') {
      throw new Error('The "subject" field is required and must be a string');
    }

    if (!text || typeof text !== 'string') {
      throw new Error('The "text" field is required and must be a string');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of to) {
      if (!emailRegex.test(email)) {
        throw new Error(`Invalid email address: ${email}`);
      }
    }

    if (from && !emailRegex.test(from)) {
      throw new Error(`Invalid sender email address: ${from}`);
    }

    try {
      const result = await EmailService.sendEmail({
        to,
        subject,
        text,
        html,
        from
      });

      return {
        content: [
          {
            type: 'text',
            text: `✅ Email sent successfully!\n\nRecipients: ${to.join(', ')}\nSubject: ${subject}\n\nDetails: ${JSON.stringify(result.data, null, 2)}`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error sending email: ${error.message}`);
    }
  }

  async handleGetAnalyticsDataById(args) {
    const { id } = args;

    if (!id) {
      throw new Error('The "id" parameter is required');
    }

    try {
      const result = await EmailService.getAnalyticsDataById(id);

      // Format the analytics data for better readability
      let formattedOutput = `📊 Analytics Data Retrieved Successfully!\n\n`;
      formattedOutput += `\n📈 Analytics Summary:\n`;
      formattedOutput += `${JSON.stringify(result.data, null, 2)}`;

      return {
        content: [
          {
            type: 'text',
            text: formattedOutput
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error retrieving analytics data: ${error.message}`);
    }
  }

  async handleGetAnalyticsData(args) {
    const { from, to, page, limit, tz, filter } = args;

    // Date format validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    
    if (!from || !dateRegex.test(from)) {
      throw new Error('The "from" parameter is required and must be in YYYY-MM-DD format');
    }

    if (!to || !dateRegex.test(to)) {
      throw new Error('The "to" parameter is required and must be in YYYY-MM-DD format');
    }

    // Validate date logic
    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    if (fromDate > toDate) {
      throw new Error('The "from" date must be before or equal to the "to" date');
    }

    // Validate optional parameters
    if (page !== undefined && (!Number.isInteger(page) || page < 1)) {
      throw new Error('The "page" parameter must be a positive integer');
    }

    if (limit !== undefined && (!Number.isInteger(limit) || limit < 1 || limit > 100)) {
      throw new Error('The "limit" parameter must be an integer between 1 and 100');
    }

    try {
      const result = await EmailService.getAnalyticsData({
        from,
        to,
        page,
        limit,
        tz,
        filter
      });

      // Format the analytics data for better readability
      let formattedOutput = `📊 Analytics Data Retrieved Successfully!\n\n`;
      formattedOutput += `Date Range: ${from} to ${to}\n`;
      
      if (page) formattedOutput += `Page: ${page}\n`;
      if (limit) formattedOutput += `Results per page: ${limit}\n`;
      if (tz) formattedOutput += `Timezone: ${tz}\n`;
      if (filter) formattedOutput += `Filter: ${filter}\n`;
      
      formattedOutput += `\n📈 Analytics Summary:\n`;
      formattedOutput += `${JSON.stringify(result.data, null, 2)}`;

      return {
        content: [
          {
            type: 'text',
            text: formattedOutput
          }
        ]
      };
    } catch (error) {
      throw new Error(`Error retrieving analytics data: ${error.message}`);
    }
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('TurboSMTP MCP Server started');
  }
}

const server = new TurboSMTPMCPServer();
server.start().catch(console.error);

export default TurboSMTPMCPServer;
