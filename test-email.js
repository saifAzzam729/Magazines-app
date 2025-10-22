#!/usr/bin/env node

/**
 * Email Test Script
 * اختبار إرسال البريد الإلكتروني باستخدام Ethereal
 */

// Set minimal environment variables for testing
process.env.NODE_ENV = "development";
process.env.JWT_SECRET = "test-secret-for-email-testing";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.EMAIL_FROM = "test@example.com";

import nodemailer from "nodemailer";

async function testEmail() {
  console.log("🧪 Testing email functionality...");

  try {
    // Create transporter directly with Ethereal credentials
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: "bernie90@ethereal.email",
        pass: "RXwCT65GmPMtvCguWs",
      },
    });

    // Test 1: Simple email
    console.log("📧 Test 1: Sending simple email...");
    const simpleResult = await transporter.sendMail({
      from: "test@example.com",
      to: "test@example.com",
      subject: "Test Email - Simple Template",
      html: "<h2>Test Email</h2><p>This is a test email from Magazine Subscriptions API</p>",
    });
    console.log("✅ Simple email sent:", simpleResult.messageId);

    // Test 2: HTML template
    console.log("📧 Test 2: Sending HTML template email...");
    const templateHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Subscription Active</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .button { display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Subscription Activated!</h1>
          </div>
          <div class="content">
            <h2>Welcome to Tech Weekly</h2>
            <p>Hello Test User,</p>
            <p>Your subscription to <strong>Tech Weekly</strong> is now active.</p>
            <p><a href="http://localhost:3000/magazines/1" class="button">Access Magazine</a></p>
            <p>Thank you for subscribing!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const templateResult = await transporter.sendMail({
      from: "test@example.com",
      to: "test@example.com",
      subject: "Test Email - HTML Template",
      html: templateHtml,
    });
    console.log("✅ Template email sent:", templateResult.messageId);

    console.log("🎉 All email tests completed successfully!");
    console.log("📬 Check your Ethereal inbox at: https://ethereal.email/");
    console.log("🔗 Preview URLs:");
    if (simpleResult.previewUrl)
      console.log("  Simple email:", simpleResult.previewUrl);
    if (templateResult.previewUrl)
      console.log("  Template email:", templateResult.previewUrl);
  } catch (error) {
    console.error("❌ Email test failed:", error);
    process.exit(1);
  }
}

// Run the test
testEmail();
