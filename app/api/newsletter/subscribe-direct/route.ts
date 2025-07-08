import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { addContactToBrevo, sendWelcomeEmail } from '@/lib/brevo-service'

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = subscribeSchema.parse(body)

    console.log(`📧 Direct subscription attempt for ${email} (${name || 'no name'})`)

    // Add directly to Brevo (bypassing database for now)
    let brevoSuccess = false
    let emailSuccess = false
    
    try {
      console.log(`📧 Adding ${email} to Brevo (direct)...`)
      const brevoResult = await addContactToBrevo(email, name, 3) // List ID 3
      brevoSuccess = true
      console.log('✅ Added to Brevo (direct):', brevoResult)
      
    } catch (brevoError) {
      console.error('❌ Brevo error (direct):', brevoError)
      
      // Check if it's a duplicate contact error
      if (brevoError instanceof Error && brevoError.message.includes('duplicate')) {
        console.log(`📧 ${email} already exists in Brevo, proceeding with welcome email`)
        brevoSuccess = true // Allow email to proceed
      } else {
        return NextResponse.json(
          { message: 'Email service error. Please try again later.' },
          { status: 500 }
        )
      }
    }

    try {
      console.log(`📧 Sending welcome email to ${email} (direct)...`)
      const emailResult = await sendWelcomeEmail(email, name)
      emailSuccess = true
      console.log('✅ Welcome email sent (direct):', emailResult)
      
    } catch (emailError) {
      console.error('❌ Welcome email error (direct):', emailError)
      console.error('❌ Welcome email error details (direct):', {
        email,
        name,
        error: emailError instanceof Error ? emailError.message : String(emailError),
        stack: emailError instanceof Error ? emailError.stack : undefined
      })
    }

    console.log(`📧 Direct subscription complete for ${email}: Brevo=${brevoSuccess}, Email=${emailSuccess}`)

    if (brevoSuccess) {
      return NextResponse.json(
        { message: 'Successfully subscribed to The Beacon! Check your email for confirmation.' },
        { status: 201 }
      )
    } else {
      return NextResponse.json(
        { message: 'Subscription failed. Please try again later.' },
        { status: 500 }
      )
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Validation error (direct):', error.errors)
      return NextResponse.json(
        { message: 'Invalid email address' },
        { status: 400 }
      )
    }

    console.error('❌ Newsletter subscription error (direct):', error)
    return NextResponse.json(
      { message: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    )
  }
} 