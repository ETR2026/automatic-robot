const sgMail = require('@sendgrid/mail');

exports.handler = async (event, context) => {
  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Parse body: Netlify posts as application/x-www-form-urlencoded from forms
  const contentType = (event.headers['content-type'] || event.headers['Content-Type'] || '').toLowerCase();
  let params = {};

  try {
    if (contentType.includes('application/json')) {
      params = JSON.parse(event.body);
    } else {
      const parsed = new URLSearchParams(event.body);
      for (const [k, v] of parsed.entries()) params[k] = v;
    }
  } catch (err) {
    console.error('Failed to parse form body', err);
    return { statusCode: 400, body: 'Bad Request' };
  }

  // Honeypot check
  if (params['bot-field']) {
    // Silently accept spam/honeypot submissions
    return { statusCode: 200, body: 'OK' };
  }

  const name = params.name || '—';
  const email = params.email || '—';
  const type = params.type || '—';
  const location = params.location || '—';
  const details = params.details || '—';

  // Require SendGrid env vars to be configured in Netlify site settings
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const EMAIL_TO = process.env.EMAIL_TO;
  const EMAIL_FROM = process.env.EMAIL_FROM;

  if (!SENDGRID_API_KEY || !EMAIL_TO || !EMAIL_FROM) {
    console.error('Missing SendGrid environment variables');
    return { statusCode: 500, body: 'Server misconfiguration' };
  }

  sgMail.setApiKey(SENDGRID_API_KEY);

  const subject = `VoltHire contact: ${type} — ${name}`;
  const text = `New contact submission\n\nName: ${name}\nEmail: ${email}\nType: ${type}\nLocation: ${location}\n\nDetails:\n${details}\n`;
  const html = `
    <h2>New contact submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Type:</strong> ${type}</p>
    <p><strong>Location:</strong> ${location}</p>
    <h3>Details</h3>
    <p>${(details || '').replace(/\n/g, '<br/>')}</p>
  `;

  const msg = {
    to: EMAIL_TO,
    from: EMAIL_FROM,
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
    // Redirect to a friendly URL on success (Netlify supports 302 Location)
    return {
      statusCode: 302,
      headers: { Location: '/?submitted=true' },
      body: ''
    };
  } catch (err) {
    console.error('SendGrid send error', err);
    return { statusCode: 500, body: 'Server error' };
  }
};
