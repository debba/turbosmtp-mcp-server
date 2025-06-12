import 'dotenv/config';
import EmailService from './email-service.js';

async function testEmail() {
  try {
    console.log('🧪 Testing email sending...');

    const result = await EmailService.sendEmail({
      to: ['andrea@emailchef.com'],
      subject: 'MCP Server',
      text: 'This is a test of the MCP server for TurboSMTP',
      html: '<h1>Test Email</h1><p>This is a <strong>test</strong> of the MCP server for TurboSMTP</p>'
    });

    console.log('✅ Test completed:', result);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}



async function getAnalyticsData() {
  try {
    console.log('🧪 Testing get Analytics Data..');

    const result = await EmailService.getAnalyticsData({
      'from': '2025-06-01',
      'to': '2025-06-12'
    });

    console.log('✅ Test completed:', result);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function getAnalyticsDataById() {
  try {
    console.log('🧪 Testing get Analytics Data By Id');

    const result = await EmailService.getAnalyticsDataById('xxx');

    console.log('✅ Test completed:', result);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}