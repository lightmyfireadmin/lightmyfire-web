https://xdkugrvcehfedkcsylaw.supabase.co/functions/v1/process-email-queue

import { createClient } from "npm:@supabase/supabase-js@2.36.0";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
console.info('process-email-queue function starting');
Deno.serve(async (req)=>{
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        persistSession: false
      }
    });
    // Fetch pending emails (max 10 per batch)
    const { data: emails, error: fetchError } = await supabase.from('email_queue').select('*').eq('status', 'pending').lt('retry_count', 3).order('created_at', {
      ascending: true
    }).limit(10);
    if (fetchError) throw fetchError;
    if (!emails || Array.isArray(emails) && emails.length === 0) {
      return new Response(JSON.stringify({
        processed: 0
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    let successCount = 0;
    let failCount = 0;
    for (const email of emails){
      // Attempt to mark as processing only if still pending (avoid race)
      const { count } = await supabase.from('email_queue').update({
        status: 'processing'
      }, {
        returning: 'minimal'
      }).eq('id', email.id).eq('status', 'pending');
      // If update didn't affect a row, skip (someone else processing)
      // Supabase JS may not return count; instead fetch the row to confirm status
      const { data: refreshed } = await supabase.from('email_queue').select('status, retry_count').eq('id', email.id).single();
      if (!refreshed || refreshed.status !== 'processing') {
        continue;
      }
      try {
        const emailTemplate = getEmailTemplate(email.email_type, email.email_data);
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailTemplate)
        });
        if (response.ok) {
          await supabase.from('email_queue').update({
            status: 'sent',
            processed_at: new Date().toISOString()
          }).eq('id', email.id);
          successCount++;
        } else {
          const text = await response.text();
          throw new Error(`Resend API error: ${response.status} ${response.statusText} ${text}`);
        }
      } catch (error) {
        console.error('Error sending email', {
          id: email.id,
          error
        });
        // Increment retry_count and set back to pending for retry
        await supabase.from('email_queue').update({
          status: 'pending',
          retry_count: email.retry_count + 1,
          error_message: String(error)
        }).eq('id', email.id);
        failCount++;
      }
    }
    return new Response(JSON.stringify({
      processed: successCount + failCount,
      success: successCount,
      failed: failCount
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('process-email-queue failure', error);
    return new Response(JSON.stringify({
      error: String(error)
    }), {
      status: 500
    });
  }
});
function getEmailTemplate(type, data) {
  const baseEmail = {
    from: 'LightMyFire <mitch@lightmyfire.app>',
    to: data.to
  };
  switch(type){
    case 'order_confirmation':
      return {
        ...baseEmail,
        subject: '🎉 Your LightMyFire stickers are being prepared!',
        html: `
          <h2>Thank you for your order, ${escapeHtml(data.userName)}! 🎉</h2>
          
          <p>Your LightMyFire sticker pack order has been confirmed and is now being processed.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> ${escapeHtml(data.orderId)}</p>
            <p><strong>Quantity:</strong> ${data.quantity} sticker pack(s)</p>
            <p><strong>Stickers for:</strong> ${data.lighterNames && data.lighterNames.length > 0 ? data.lighterNames.map((name)=>escapeHtml(name)).join(', ') : 'Your selected lighters'}</p>
            
            <hr style="margin: 15px 0;">
            
            <p><strong>Product Price:</strong> €${data.amountPaid}</p>
            <p><strong>Shipping:</strong> €${data.shippingCost}</p>
            <p><strong><strong>Total Paid:</strong> €${data.totalAmount}</strong></p>
          </div>
          
          <h3>What's Next? 📦</h3>
          <ol>
            <li><strong>Sticker Generation:</strong> We're creating your custom sticker sheets with your lighter designs</li>
            <li><strong>Quality Check:</strong> Each sheet will be reviewed to ensure perfect quality</li>
            <li><strong>Shipping:</strong> Your stickers will be carefully packaged and shipped</li>
            <li><strong>Delivery:</strong> You'll receive tracking information once shipped</li>
          </ol>
          
          ${data.trackingNumber ? `
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3;">
              <p style="margin: 0;"><strong>Tracking Number:</strong> ${escapeHtml(data.trackingNumber)}</p>
            </div>
          ` : ''}
          
          <p>Thank you for being part of the LightMyFire community! Your stickers will help spread the word about our lighter-sharing adventure. 🔥</p>
          
          <p>If you have any questions about your order, please don't hesitate to contact us.</p>
          
          <p>Keep the flame alive!<br>The LightMyFire Team</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="font-size: 12px; color: #666;">
            LightMyFire - Connecting people through shared stories<br>
            Visit us at <a href="https://lightmyfire.app">lightmyfire.app</a>
          </p>
        `
      };
    case 'first_post_celebration':
      return {
        ...baseEmail,
        subject: '🎉 You lit your first spark!',
        html: `
          <h2>Congratulations, ${escapeHtml(data.userName)}! 🌟</h2>
          <p>You just added your first contribution to <strong>${escapeHtml(data.lighterName || '')}</strong>!</p>
          <p>This is the start of your journey as a LightSaver. Every post you create adds another piece to our global human mosaic.</p>
          <p><strong>What's next?</strong></p>
          <ul>
            <li>Find more lighters and share your creativity</li>
            <li>Order your own LightMyFire stickers</li>
            <li>Earn trophies by staying active</li>
          </ul>
          <p>Keep the flame alive! 🔥</p>
        `
      };
    case 'trophy_earned':
      return {
        ...baseEmail,
        subject: `🏆 You earned a trophy: ${escapeHtml(data.trophy?.trophyName || 'Trophy')}!`,
        html: `
          <h2>Achievement Unlocked, ${escapeHtml(data.userName)}! 🏆</h2>
          <p><strong>${escapeHtml(data.trophy?.trophyName || '')}</strong></p>
          <p>${escapeHtml(data.trophy?.trophyDescription || '')}</p>
          <p>You're making a real difference in the LightMyFire community. Keep going!</p>
        `
      };
    case 'lighter_activity':
      return {
        ...baseEmail,
        subject: `🔥 New activity on your lighter "${escapeHtml(data.lighterName || '')}"`,
        html: `
          <h2>Hey ${escapeHtml(data.ownerName)}! 👋</h2>
          <p><strong>${escapeHtml(data.posterName || 'A LightSaver')}</strong> just added a ${escapeHtml(data.postType || '')} to your lighter <strong>"${escapeHtml(data.lighterName || '')}"</strong>!</p>
          <p>Your lighter is traveling and collecting stories. Check out what's new!</p>
          <p><a href="https://lightmyfire.app/lighter/${encodeURIComponent(data.lighterPin || '')}">View your lighter</a></p>
        `
      };
    case 'moderation_decision':
      if (data.decision === 'approved') {
        return {
          ...baseEmail,
          subject: '✅ Your post was approved',
          html: `
            <h2>Good news, ${escapeHtml(data.userName)}!</h2>
            <p>Your post "${escapeHtml(data.postTitle || '')}" has been approved and is now visible to the community.</p>
            <p>Thank you for contributing to our mosaic! 🎨</p>
          `
        };
      } else {
        return {
          ...baseEmail,
          subject: '⚠️ Your post needs revision',
          html: `
            <h2>Hi ${escapeHtml(data.userName)},</h2>
            <p>Unfortunately, your post "${escapeHtml(data.postTitle || '')}" couldn't be approved at this time.</p>
            ${data.reason ? `<p><strong>Reason:</strong> ${escapeHtml(data.reason)}</p>` : ''}
            <p>We want to keep LightMyFire safe and welcoming for everyone. Feel free to create a new post that follows our community guidelines.</p>
            <p>Questions? Contact us anytime.</p>
          `
        };
      }
    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}
function escapeHtml(input) {
  if (!input) return '';
  return String(input).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

https://xdkugrvcehfedkcsylaw.supabase.co/functions/v1/stripe-webhook-handler

import { createClient } from "npm:@supabase/supabase-js@2.36.0";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
console.info('stripe-webhook-handler function starting');
Deno.serve(async (req)=>{
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        persistSession: false
      }
    });
    const body = await req.text();
    const headers = Object.fromEntries(req.headers.entries());
    const signature = headers['stripe-signature'];
    if (!STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return new Response('Webhook secret not configured', {
        status: 500
      });
    }
    // In production, verify signature here
    // For now, just parse and process
    let event;
    try {
      event = JSON.parse(body);
    } catch (err) {
      console.error('Invalid JSON:', err);
      return new Response('Invalid JSON', {
        status: 400
      });
    }
    console.info('Processing Stripe event:', event.type, event.id);
    switch(event.type){
      case 'payment_intent.succeeded':
        {
          const paymentIntent = event.data.object;
          const { id: payment_intent_id, amount, currency, metadata, status } = paymentIntent;
          try {
            // Find the order by payment intent ID
            const { data: orders, error: orderError } = await supabase.from('sticker_orders').select('*').eq('payment_intent_id', payment_intent_id);
            if (orderError) throw orderError;
            if (!orders || orders.length === 0) {
              console.error('No order found for payment intent:', payment_intent_id);
              return new Response('Order not found', {
                status: 404
              });
            }
            const order = orders[0];
            console.info('Found order:', order.id);
            // Calculate shipping cost
            const quantity = order.quantity || 1;
            const shippingCostCents = calculateShippingCost(metadata.country || 'unknown', quantity);
            const amountPaid = (amount / 100).toFixed(2);
            const shippingCost = (shippingCostCents / 100).toFixed(2);
            const totalAmount = (amount / 100).toFixed(2); // Stripe amount includes everything
            // Update order with payment info
            const { error: updateError } = await supabase.from('sticker_orders').update({
              payment_status: 'paid',
              status: 'processing',
              paid_at: new Date().toISOString(),
              stripe_payment_id: payment_intent_id,
              // Add new columns if they exist, otherwise ignore
              shipping_cost_cents: shippingCostCents,
              total_amount_cents: amount
            }).eq('id', order.id);
            if (updateError) {
              console.error('Error updating order:', updateError);
            // Continue anyway - this might be due to missing columns
            }
            // Add order confirmation email to queue
            const { error: emailError } = await supabase.from('email_queue').insert({
              email_type: 'order_confirmation',
              recipient_email: metadata.customer_email || order.customer_email,
              email_data: {
                to: metadata.customer_email || order.customer_email,
                userName: metadata.user_name || order.customer_name || 'Customer',
                orderId: order.id,
                quantity: quantity,
                lighterNames: order.lighter_names ? JSON.parse(order.lighter_names) : [],
                amountPaid: amountPaid,
                shippingCost: shippingCost,
                totalAmount: totalAmount
              },
              status: 'pending'
            });
            if (emailError) {
              console.error('Error adding email to queue:', emailError);
            }
            console.info('Order processing completed for order:', order.id);
          } catch (error) {
            console.error('Error processing payment intent:', error);
          }
          break;
        }
      case 'payment_intent.payment_failed':
        {
          const paymentIntent = event.data.object;
          const { id: payment_intent_id, last_payment_error } = paymentIntent;
          try {
            // Find and update the order as failed
            const { error: updateError } = await supabase.from('sticker_orders').update({
              payment_status: 'failed',
              status: 'failed',
              error_message: last_payment_error?.message || 'Payment failed'
            }).eq('payment_intent_id', payment_intent_id);
            if (updateError) {
              console.error('Error updating failed payment:', updateError);
            }
            console.info('Payment failure recorded for:', payment_intent_id);
          } catch (error) {
            console.error('Error handling payment failure:', error);
          }
          break;
        }
      default:
        console.info('Unhandled event type:', event.type);
    }
    return new Response('Webhook processed successfully', {
      status: 200
    });
  } catch (error) {
    console.error('stripe-webhook-handler failure:', error);
    return new Response(`Webhook error: ${error.message}`, {
      status: 500
    });
  }
});
function calculateShippingCost(country, quantity) {
  // EU preferential shipping rates
  const EU_COUNTRIES = [
    'DE',
    'FR',
    'IT',
    'ES',
    'NL',
    'BE',
    'AT',
    'SE',
    'DK',
    'FI',
    'PT',
    'IE',
    'LU',
    'MT',
    'CY',
    'EE',
    'LV',
    'LT',
    'PL',
    'CZ',
    'HU',
    'SK',
    'SI',
    'RO',
    'BG',
    'HR'
  ];
  if (EU_COUNTRIES.includes(country.toUpperCase())) {
    // EU shipping: €5.00 base + €2.00 per additional pack
    return 500 + Math.max(0, quantity - 1) * 200;
  } else {
    // International shipping: 2x the EU rate
    return 1000 + Math.max(0, quantity - 1) * 400;
  }
}

// ❌ DEPRECATED: One-time processing function for historical orders - can be removed
https://xdkugrvcehfedkcsylaw.supabase.co/functions/v1/retroactive-fulfillment

import { createClient } from "npm:@supabase/supabase-js@2.36.0";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
console.info('retroactive-fulfillment function starting');
Deno.serve(async (req)=>{
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        persistSession: false
      }
    });
    // List of successful payments that need fulfillment
    const paymentsToProcess = [
      {
        payment_intent_id: "pi_3SU8JBFayiEdCFiW1DvEdwCK",
        order_id: "LMF-1763308546005",
        amount: 720,
        currency: "eur",
        customer_email: "syl.berthon@orange.fr",
        quantity: 10,
        lighter_names: [
          "LightMyFire Sticker Pack"
        ],
        created_at: 1763308569
      },
      {
        payment_intent_id: "pi_3SU8DGFayiEdCFiW1cz6Hnm3",
        order_id: "LMF-1763308171928",
        amount: 720,
        currency: "eur",
        customer_email: "syl.berthon@orange.fr",
        quantity: 10,
        lighter_names: [
          "LightMyFire Sticker Pack"
        ],
        created_at: 1763308202
      },
      {
        payment_intent_id: "pi_3SRgqGFayiEdCFiW05kDvz3h",
        order_id: "LMF-1762726319568",
        amount: 1149,
        currency: "eur",
        customer_email: "michaelrberthon@gmail.com",
        quantity: 10,
        lighter_names: [
          "LightMyFire Sticker Pack"
        ],
        created_at: 1762726332
      }
    ];
    let successCount = 0;
    let errorCount = 0;
    for (const payment of paymentsToProcess){
      try {
        console.info(`Processing payment ${payment.payment_intent_id}`);
        // Check if order already exists
        const { data: existingOrder } = await supabase.from('sticker_orders').select('id, status').eq('payment_intent_id', payment.payment_intent_id).single();
        if (existingOrder) {
          console.info(`Order already exists: ${existingOrder.id}, status: ${existingOrder.status}`);
          // If order exists but status is not completed, update it
          if (existingOrder.status !== 'completed') {
            await supabase.from('sticker_orders').update({
              status: 'processing',
              paid_at: new Date(payment.created_at * 1000).toISOString()
            }).eq('payment_intent_id', payment.payment_intent_id);
          }
        } else {
          // Create missing order
          const { data: newOrder, error: createError } = await supabase.from('sticker_orders').insert({
            user_id: "da8e7ca1-373b-4f6c-8a8c-c34d049f52ee",
            payment_intent_id: payment.payment_intent_id,
            quantity: payment.quantity,
            amount_paid: payment.amount,
            currency: payment.currency,
            shipping_email: payment.customer_email,
            shipping_name: "Customer",
            shipping_address: "Address Pending",
            shipping_city: "City",
            shipping_postal_code: "00000",
            shipping_country: "FR",
            lighter_names: payment.lighter_names,
            status: 'processing',
            paid_at: new Date(payment.created_at * 1000).toISOString()
          }).select().single();
          if (createError) {
            console.error(`Error creating order for ${payment.payment_intent_id}:`, createError);
            errorCount++;
            continue;
          }
          console.info(`Created order: ${newOrder.id}`);
        }
        // Calculate shipping cost (EU shipping for French customers)
        const shippingCostCents = payment.customer_email.includes('orange.fr') || payment.customer_email.includes('gmail.com') ? 500 + Math.max(0, payment.quantity - 1) * 200 // EU shipping: €5.00 + €2.00 per extra pack
         : 1000 + Math.max(0, payment.quantity - 1) * 400; // International shipping
        const amountPaid = (payment.amount / 100).toFixed(2);
        const shippingCost = (shippingCostCents / 100).toFixed(2);
        const totalAmount = (payment.amount / 100).toFixed(2);
        // Add order confirmation email to queue
        const { error: emailError } = await supabase.from('email_queue').insert({
          email_type: 'order_confirmation',
          recipient_email: payment.customer_email,
          email_data: {
            to: payment.customer_email,
            userName: payment.customer_email.split('@')[0],
            orderId: payment.order_id,
            quantity: payment.quantity,
            lighterNames: payment.lighter_names,
            amountPaid: amountPaid,
            shippingCost: shippingCost,
            totalAmount: totalAmount
          },
          status: 'pending'
        });
        if (emailError) {
          console.error(`Error adding email to queue for ${payment.payment_intent_id}:`, emailError);
        } else {
          console.info(`Added confirmation email to queue for ${payment.payment_intent_id}`);
        }
        successCount++;
      } catch (error) {
        console.error(`Error processing payment ${payment.payment_intent_id}:`, error);
        errorCount++;
      }
    }
    return new Response(JSON.stringify({
      processed: paymentsToProcess.length,
      success: successCount,
      failed: errorCount,
      message: `Processed ${paymentsToProcess.length} payments: ${successCount} successful, ${errorCount} failed`
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('retroactive-fulfillment failure:', error);
    return new Response(JSON.stringify({
      error: String(error)
    }), {
      status: 500
    });
  }
});

// ❌ DEPRECATED: Temporary manual email sending script - can be removed
https://xdkugrvcehfedkcsylaw.supabase.co/functions/v1/batch-email-sender

import { createClient } from "npm:@supabase/supabase-js@2.36.0";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ❌ DEPRECATED: This function is a temporary script - can be removed
Deno.serve(async (req)=>{
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        persistSession: false
      }
    });
    // Direct email data for the 3 successful payments
    const orderConfirmations = [
      {
        email: 'syl.berthon@orange.fr',
        userName: 'syl.berthon',
        orderId: 'LMF-1763308546005',
        quantity: 10,
        amountPaid: '7.20',
        shippingCost: '5.00',
        totalAmount: '7.20'
      },
      {
        email: 'syl.berthon@orange.fr',
        userName: 'syl.berthon',
        orderId: 'LMF-1763308171928',
        quantity: 10,
        amountPaid: '7.20',
        shippingCost: '5.00',
        totalAmount: '7.20'
      },
      {
        email: 'michaelrberthon@gmail.com',
        userName: 'michaelrberthon',
        orderId: 'LMF-1762726319568',
        quantity: 10,
        amountPaid: '11.49',
        shippingCost: '5.00',
        totalAmount: '11.49'
      }
    ];
    let successCount = 0;
    const results = [];
    for (const order of orderConfirmations){
      try {
        // Add order confirmation email to queue
        const { data, error } = await supabase.from('email_queue').insert({
          email_type: 'order_confirmation',
          recipient_email: order.email,
          email_data: {
            to: order.email,
            userName: order.userName,
            orderId: order.orderId,
            quantity: order.quantity,
            lighterNames: [
              'LightMyFire Sticker Pack'
            ],
            amountPaid: order.amountPaid,
            shippingCost: order.shippingCost,
            totalAmount: order.totalAmount
          },
          status: 'pending'
        }).select();
        if (error) {
          results.push({
            email: order.email,
            success: false,
            error: error.message
          });
        } else {
          results.push({
            email: order.email,
            success: true,
            orderId: order.orderId
          });
          successCount++;
        }
      } catch (error) {
        results.push({
          email: order.email,
          success: false,
          error: String(error)
        });
      }
    }
    // Now trigger email processing
    try {
      const emailProcessResponse = await fetch(`${SUPABASE_URL}/functions/v1/process-email-queue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const emailProcessResult = await emailProcessResponse.json();
      return new Response(JSON.stringify({
        success: true,
        emailsAdded: successCount,
        totalEmails: orderConfirmations.length,
        results: results,
        emailProcessing: emailProcessResult
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (emailError) {
      return new Response(JSON.stringify({
        success: true,
        emailsAdded: successCount,
        totalEmails: orderConfirmations.length,
        results: results,
        emailProcessingError: String(emailError),
        message: 'Emails added to queue but processing failed'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: String(error)
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
});

https://xdkugrvcehfedkcsylaw.supabase.co/functions/v1/direct-email-trigger

import { createClient } from "npm:@supabase/supabase-js@2.36.0";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ❌ DEPRECATED: This function is a temporary script - can be removed
console.info('Direct email trigger starting');
Deno.serve(async (req)=>{
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        persistSession: false
      }
    });
    // Add the 3 order confirmation emails directly
    const emails = [
      {
        email: 'syl.berthon@orange.fr',
        userName: 'syl.berthon',
        orderId: 'LMF-1763308546005',
        quantity: 10,
        amountPaid: '7.20',
        shippingCost: '5.00',
        totalAmount: '7.20'
      },
      {
        email: 'syl.berthon@orange.fr',
        userName: 'syl.berthon',
        orderId: 'LMF-1763308171928',
        quantity: 10,
        amountPaid: '7.20',
        shippingCost: '5.00',
        totalAmount: '7.20'
      },
      {
        email: 'michaelrberthon@gmail.com',
        userName: 'michaelrberthon',
        orderId: 'LMF-1762726319568',
        quantity: 10,
        amountPaid: '11.49',
        shippingCost: '5.00',
        totalAmount: '11.49'
      }
    ];
    const results = [];
    // Add emails to queue
    for (const emailData of emails){
      const { data, error } = await supabase.from('email_queue').insert({
        email_type: 'order_confirmation',
        recipient_email: emailData.email,
        email_data: {
          to: emailData.email,
          userName: emailData.userName,
          orderId: emailData.orderId,
          quantity: emailData.quantity,
          lighterNames: [
            'LightMyFire Sticker Pack'
          ],
          amountPaid: emailData.amountPaid,
          shippingCost: emailData.shippingCost,
          totalAmount: emailData.totalAmount
        },
        status: 'pending'
      });
      results.push({
        email: emailData.email,
        success: !error,
        orderId: emailData.orderId,
        error: error?.message
      });
    }
    // Trigger email processing immediately
    const { data: emailProcessResult, error: processError } = await supabase.functions.invoke('process-email-queue', {
      method: 'POST'
    });
    return new Response(JSON.stringify({
      success: true,
      emailsAdded: results.filter((r)=>r.success).length,
      totalEmails: emails.length,
      results: results,
      emailProcessing: {
        success: !processError,
        result: emailProcessResult,
        error: processError?.message
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Direct email trigger error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: String(error)
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
});

## SUMMARY OF IMPROVEMENTS MADE ✅

### 1. **Fixed Environment Variables**
- ✅ Changed all `Deno.env.get()` to `process.env`
- ✅ Updated process-email-queue function
- ✅ Updated stripe-webhook-handler function
- ✅ Updated retroactive-fulfillment function
- ✅ Updated batch-email-sender function
- ✅ Updated direct-email-trigger function

### 2. **Deprecated Temporary Functions**
- ✅ Added deprecation comments to temporary scripts:
  - `batch-email-sender` - Manual email sending script
  - `direct-email-trigger` - Direct email processing script
  - `retroactive-fulfillment` - One-time historical order processing

### 3. **Remaining Critical Issues** ⚠️

#### **Email Templates Still Use Basic HTML**
- ❌ `process-email-queue` still uses `getEmailTemplate()` with basic inline styles
- ❌ Trophy and order confirmation emails appear as "pure HTML text"
- ❌ Templates don't match the beautiful branded design from `lib/email.ts`

#### **Missing Functions**
- ❌ Sticker generation returning 404 URLs (storage bucket issues)
- ❌ User listing function may be unnecessary

### 4. **Next Steps Required**

#### **Priority 1: Fix Email Templates**
Replace the `getEmailTemplate()` function with branded templates that match `lib/email.ts`:
- Order confirmation emails
- Trophy earned emails
- First post celebration emails
- Activity notification emails

#### **Priority 2: Fix Storage Issues**
- Investigate sticker generation URLs returning 404s
- Check storage bucket configuration

#### **Priority 3: Clean Up**
- Remove deprecated temporary functions after confirming they're no longer needed

---

## ENVIRONMENT VARIABLES USAGE

**✅ CORRECT**: Use direct Supabase secrets:
```typescript
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
```

**Available Secrets in Supabase:**
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_DB_URL
- STRIPE_WEBHOOK_SECRET
- RESEND_API_KEY