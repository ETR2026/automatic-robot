PR Title: feat(netlify): add serverless function to forward contact form via SendGrid

PR Body:
This PR adds a Netlify serverless function to handle contact form submissions and forward them to an email address using SendGrid.

Files added:
- netlify/functions/submit-contact.js  — Node.js Netlify function that accepts POSTs, validates a honeypot, and sends email via SendGrid.
- netlify/functions/package.json     — Function dependencies (@sendgrid/mail).

Notes and setup
1. Environment variables (set in Netlify site settings -> Site settings -> Build & deploy -> Environment -> Environment variables):
   - SENDGRID_API_KEY  (your SendGrid API key)
   - EMAIL_TO          (recipient address, e.g. hr@volthire.example.com)
   - EMAIL_FROM        (verified sender address configured in SendGrid)

2. The contact form in index.html already posts to the function at /.netlify/functions/submit-contact and includes Netlify Forms attributes & a honeypot.

3. On successful send the function redirects to /?submitted=true — update to a custom thank-you page if desired.

4. To install dependencies, Netlify will detect the package.json in the functions folder and install @sendgrid/mail automatically during deploy.

Testing locally
- Deploy to Netlify and test the live form.
- Alternatively, use Netlify CLI for local function testing:
  - npm i -g netlify-cli
  - netlify dev

Security and deliverability
- Configure SPF/DKIM for your sending domain in SendGrid to improve deliverability.
- Monitor form submissions and add rate-limiting or CAPTCHA if spam becomes an issue.

Please review and merge. After merging, set the environment variables in Netlify and deploy.
