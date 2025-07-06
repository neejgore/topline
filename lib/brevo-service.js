const BREVO_API_URL = 'https://api.brevo.com/v3'

/**
 * Add a contact to Brevo mailing list
 * @param {string} email - Contact email
 * @param {string} name - Contact name (optional)
 * @param {number} listId - Brevo list ID (optional, defaults to 1)
 */
async function addContactToBrevo(email, name = '', listId = 3) {
  try {
    const response = await fetch(`${BREVO_API_URL}/contacts`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        email: email,
        attributes: {
          FIRSTNAME: name || email.split('@')[0], // Use email prefix if no name
          LASTNAME: ''
        },
        listIds: [listId], // Add to default list
        updateEnabled: true // Update if contact already exists
      })
    })

    const data = await response.json()

    if (!response.ok) {
      // If contact already exists, that's okay
      if (data.code === 'duplicate_parameter') {
        console.log(`Contact ${email} already exists in Brevo`)
        return { success: true, message: 'Contact already exists' }
      }
      throw new Error(`Brevo API error: ${data.message || 'Unknown error'}`)
    }

    console.log(`✅ Added ${email} to Brevo contact list`)
    return { success: true, contactId: data.id }

  } catch (error) {
    console.error('Error adding contact to Brevo:', error)
    throw error
  }
}

/**
 * Send welcome email via Brevo
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 */
async function sendWelcomeEmail(email, name = '') {
  try {
    const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        sender: {
          name: 'Topline Sales Intelligence',
          email: 'hello@topline.zetaglobal.com'
        },
        to: [{
          email: email,
          name: name || email.split('@')[0]
        }],
        subject: 'Welcome to Topline - Your Daily Sales Intelligence',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Welcome to Topline</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px;">Your daily sales intelligence starts now</p>
            </div>
            
            <div style="padding: 40px 20px; background: white;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0;">Hi ${name || 'there'}! 👋</h2>
              
              <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for subscribing to Topline! You're now part of a community of sales professionals who stay ahead with curated insights, metrics, and industry developments.
              </p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin: 0 0 15px 0;">What you'll receive:</h3>
                <ul style="color: #4b5563; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li><strong>Key insights</strong> from 18+ premium industry sources</li>
                  <li><strong>Daily metrics</strong> with AI-powered explanations</li>
                  <li><strong>Talk tracks</strong> to power your sales conversations</li>
                  <li><strong>Industry developments</strong> across technology, retail, healthcare & financial services</li>
                </ul>
              </div>
              
              <p style="color: #4b5563; line-height: 1.6; margin: 20px 0;">
                Your content refreshes Monday-Friday at 6:00 AM PDT, so you'll always have fresh intelligence to start your day.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://topline-tlwi.vercel.app/" 
                   style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Visit Topline →
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin: 30px 0 0 0; text-align: center;">
                Questions? Reply to this email - we're here to help!<br/>
                <a href="https://topline-tlwi.vercel.app/" style="color: #2563eb;">topline-tlwi.vercel.app</a>
              </p>
            </div>
          </div>
        `,
        textContent: `
Hi ${name || 'there'}!

Thank you for subscribing to Topline! You're now part of a community of sales professionals who stay ahead with curated insights, metrics, and industry developments.

What you'll receive:
• Key insights from 18+ premium industry sources
• Daily metrics with AI-powered explanations  
• Talk tracks to power your sales conversations
• Industry developments across technology, retail, healthcare & financial services

Your content refreshes Monday-Friday at 6:00 AM PDT, so you'll always have fresh intelligence to start your day.

Visit Topline: https://topline-tlwi.vercel.app/

Questions? Reply to this email - we're here to help!
        `
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(`Brevo email API error: ${data.message || 'Unknown error'}`)
    }

    console.log(`✅ Sent welcome email to ${email}`)
    return { success: true, messageId: data.messageId }

  } catch (error) {
    console.error('Error sending welcome email via Brevo:', error)
    throw error
  }
}

module.exports = {
  addContactToBrevo,
  sendWelcomeEmail
} 