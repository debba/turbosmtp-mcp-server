# turbosmtp-mcp-server

A simple Node.js MCP (Model Context Protocol) server for sending emails and view statistics using TurboSMTP, designed for easy integration and testing. This server exposes an MCP-compatible API endpoint to allow other services to send emails via TurboSMTP.

<a href="https://glama.ai/mcp/servers/@debba/turbosmtp-mcp-server">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@debba/turbosmtp-mcp-server/badge" alt="turbosmtp MCP server" />
</a>

## Features

- Send emails and check statistics via TurboSMTP with a simple MCP API
- Easy configuration and setup
- Includes a test script for quick validation

## Requirements

- Node.js (v14 or higher recommended)
- A valid TurboSMTP account and credentials

## Installation

```bash
git clone https://github.com/debba/turbosmtp-mcp-server.git
cd turbosmtp-mcp-server
npm install
```

## Configuration

Set your TurboSMTP credentials in the appropriate configuration section of the code (see `email-service.js`).  
You may want to use environment variables or a configuration file for production use.

## Usage

### Start the MCP server

```bash
node mcp-turbosmtp-server.js
```

The server will start and expose an MCP API endpoint for sending emails.

### Send a test email

You can use the provided test script:

```bash
node test-email.js
```

Edit `test-email.js` to set the recipient and message details.

## Project Structure

- `mcp-turbosmtp-server.js` — Main MCP server file
- `email-service.js` — Email sending logic using TurboSMTP
- `tests.js` — Script to test turboSMTP features via API
- `package.json` — Project dependencies and scripts

## License

MIT