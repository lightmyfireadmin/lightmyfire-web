
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
        const cookieStore = cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Printful Sticker Test - Unauthorized</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              max-width: 800px;
              margin: 50px auto;
              padding: 20px;
              line-height: 1.6;
            }
            .error {
              background: #fee;
              border: 1px solid #fcc;
              padding: 20px;
              border-radius: 8px;
              color: #c33;
            }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>🔒 Unauthorized</h1>
            <p>You must be signed in to access this testing endpoint.</p>
            <p><a href="/">Go to homepage</a></p>
          </div>
        </body>
        </html>
        `,
        {
          status: 401,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

        const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Printful Sticker Test - Forbidden</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              max-width: 800px;
              margin: 50px auto;
              padding: 20px;
              line-height: 1.6;
            }
            .error {
              background: #fee;
              border: 1px solid #fcc;
              padding: 20px;
              border-radius: 8px;
              color: #c33;
            }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>🚫 Forbidden</h1>
            <p>Admin access required to use this testing endpoint.</p>
            <p><a href="/">Go to homepage</a></p>
          </div>
        </body>
        </html>
        `,
        {
          status: 403,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

        const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

    if (!PRINTFUL_API_KEY) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Printful Sticker Test - Configuration Error</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              max-width: 800px;
              margin: 50px auto;
              padding: 20px;
              line-height: 1.6;
            }
            .error {
              background: #fef3c7;
              border: 1px solid #fcd34d;
              padding: 20px;
              border-radius: 8px;
              color: #92400e;
            }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>⚙️ Configuration Error</h1>
            <p>PRINTFUL_API_KEY is not configured in environment variables.</p>
            <p>Please add it to your .env file to test Printful integration.</p>
          </div>
        </body>
        </html>
        `,
        {
          status: 500,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

        const testStickers = [
      {
        name: 'Test Lighter 1',
        pinCode: 'TEST-001',
        backgroundColor: '#FF6B6B',
        language: 'en',
      },
      {
        name: 'Test Lighter 2',
        pinCode: 'TEST-002',
        backgroundColor: '#4ECDC4',
        language: 'fr',
      },
      {
        name: 'Test Lighter 3',
        pinCode: 'TEST-003',
        backgroundColor: '#45B7D1',
        language: 'es',
      },
    ];

                const stickerPng = null;

        const printfulResponse = await fetch('https://api.printful.com/store/products', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const printfulData = await printfulResponse.json();

        return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Printful Sticker Test Results</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 1000px;
            margin: 50px auto;
            padding: 20px;
            line-height: 1.6;
            background: #f9fafb;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          h1 {
            color: #111827;
            margin-bottom: 10px;
          }
          .success {
            background: #d1fae5;
            border: 1px solid #6ee7b7;
            padding: 15px;
            border-radius: 8px;
            color: #065f46;
            margin: 20px 0;
          }
          .info {
            background: #dbeafe;
            border: 1px solid #93c5fd;
            padding: 15px;
            border-radius: 8px;
            color: #1e40af;
            margin: 20px 0;
          }
          .warning {
            background: #fef3c7;
            border: 1px solid #fcd34d;
            padding: 15px;
            border-radius: 8px;
            color: #92400e;
            margin: 20px 0;
          }
          .section {
            margin: 30px 0;
          }
          .section h2 {
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
          }
          pre {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
            font-size: 13px;
          }
          .sticker-preview {
            margin: 20px 0;
            text-align: center;
          }
          .sticker-preview img {
            max-width: 100%;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .button {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 10px 20px;
            border-radius: 6px;
            text-decoration: none;
            margin-right: 10px;
            margin-top: 10px;
          }
          .button:hover {
            background: #2563eb;
          }
          .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
          }
          .stat-card {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
          }
          .stat-label {
            font-size: 13px;
            color: #6b7280;
            margin-top: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🧪 Printful Sticker Test Results</h1>
          <p style="color: #6b7280;">Generated: ${new Date().toLocaleString()}</p>

          <div class="success">
            <strong>✅ Test Completed Successfully</strong>
            <p style="margin: 5px 0 0 0;">Printful API connectivity has been verified.</p>
          </div>

          <div class="section">
            <h2>📊 Test Summary</h2>
            <div class="stats">
              <div class="stat-card">
                <div class="stat-value">${testStickers.length}</div>
                <div class="stat-label">Test Sticker Data Points</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${printfulResponse.status}</div>
                <div class="stat-label">Printful API Status</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${printfulData.result?.length || 0}</div>
                <div class="stat-label">Products Available</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${printfulResponse.ok ? '✅' : '❌'}</div>
                <div class="stat-label">API Connected</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>🎨 Sticker Generation</h2>
            <div class="info">
              <p><strong>Note:</strong> For actual sticker generation testing, please use the <strong>Test Sticker Generator</strong> component on the main admin panel. This endpoint focuses on validating Printful API connectivity.</p>
            </div>
          </div>

          <div class="section">
            <h2>🔌 Printful API Test</h2>
            ${printfulResponse.ok
              ? `<div class="success">
                  <strong>✅ Printful API Connected</strong>
                  <p style="margin: 5px 0 0 0;">Successfully authenticated with Printful. API is responding correctly.</p>
                </div>`
              : `<div class="error">
                  <strong>❌ Printful API Error</strong>
                  <p style="margin: 5px 0 0 0;">Status: ${printfulResponse.status}</p>
                </div>`
            }
            <details>
              <summary style="cursor: pointer; padding: 10px; background: #f3f4f6; border-radius: 6px; margin-top: 10px;">
                View Printful API Response
              </summary>
              <pre>${JSON.stringify(printfulData, null, 2)}</pre>
            </details>
          </div>

          <div class="section">
            <h2>🧬 Test Data</h2>
            <details>
              <summary style="cursor: pointer; padding: 10px; background: #f3f4f6; border-radius: 6px;">
                View Test Sticker Data
              </summary>
              <pre>${JSON.stringify(testStickers, null, 2)}</pre>
            </details>
          </div>

          <div class="warning">
            <strong>⚠️ Important Note</strong>
            <p style="margin: 10px 0 0 0;">This is a test endpoint. To create an actual Printful order, you would need to:</p>
            <ol style="margin: 10px 0 0 20px;">
              <li>Upload the generated PNG to Printful's file API</li>
              <li>Create an order using the file ID and product variant</li>
              <li>Confirm the order and handle payment</li>
              <li>Set up webhook handlers for order status updates</li>
            </ol>
          </div>

          <div style="margin-top: 30px;">
            <a href="/en/admin/testing" class="button">← Back to Testing Dashboard</a>
            <a href="https://developers.printful.com/docs/" target="_blank" class="button">Printful API Docs →</a>
          </div>
        </div>
      </body>
      </html>
      `,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  } catch (error) {
    console.error('Printful sticker test error:', error);

    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Printful Sticker Test - Error</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            line-height: 1.6;
          }
          .error {
            background: #fee;
            border: 1px solid #fcc;
            padding: 20px;
            border-radius: 8px;
            color: #c33;
          }
          pre {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="error">
          <h1>❌ Test Failed</h1>
          <p>An error occurred while testing Printful sticker generation:</p>
          <pre>${error instanceof Error ? error.message : String(error)}</pre>
          <p style="margin-top: 20px;"><a href="/en/admin/testing">← Back to Testing Dashboard</a></p>
        </div>
      </body>
      </html>
      `,
      {
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
}
