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

    console.log(`📧 Direct subscription attempt for ${email}`)

    // Add directly to Brevo (bypassing database for now)
    try {
      const brevoResult = await addContactToBrevo(email, name, 3) // List ID 3
      console.log('✅ Added to Brevo:', brevoResult)
      
      // Send welcome email
      const emailResult = await sendWelcomeEmail(email, name)
      console.log('✅ Welcome email sent:', emailResult)
      
      return NextResponse.json(
        { message: 'Successfully subscribed to The Beacon! Check your email for confirmation.' },
        { status: 201 }
      )
      
    } catch (brevoError) {
      console.error('❌ Brevo error:', brevoError)
      
      // Check if it's a duplicate contact error
      if (brevoError instanceof Error && brevoError.message.includes('duplicate')) {
        return NextResponse.json(
          { message: 'You are already subscribed to The Beacon!' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { message: 'Email service error. Please try again later.' },
        { status: 500 }
      )
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid email address' },
        { status: 400 }
      )
    }

    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { message: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    )
  }
} 