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
            name: 'validate_email_config',
            description: 'Validate TurboSMTP configuration',
            inputSchema: {
              type: 'object',
              properties: {},
              additionalProperties: false
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
          
          case 'validate_email_config':
            return await this.handleValidateConfig();
          
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

  async handleValidateConfig() {
    try {
      await EmailService.validateConfiguration();
      
      return {
        content: [
          {
            type: 'text',
            text: '✅ TurboSMTP configuration is valid!\n\nConfigured variables:\n- TURBOSMTP_CONSUMER_KEY: ✓\n- TURBOSMTP_CONSUMER_SECRET: ✓'
          }
        ]
      };
    } catch (error) {
      throw new Error(`Invalid configuration: ${error.message}`);
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
