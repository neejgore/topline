import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendWelcomeEmail } from '@/lib/brevo-service'

const resendSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = resendSchema.parse(body)

    console.log(`📧 Manual welcome email resend for ${email} (${name || 'no name'})`)

    try {
      console.log(`📧 Sending welcome email to ${email}...`)
      const result = await sendWelcomeEmail(email, name)
      console.log(`✅ Welcome email sent successfully to ${email}:`, result.messageId)
      
      return NextResponse.json({
        success: true,
        message: 'Welcome email sent successfully',
        messageId: result.messageId
      })
      
    } catch (emailError) {
      console.error('❌ Welcome email error (manual resend):', emailError)
      console.error('❌ Welcome email error details (manual resend):', {
        email,
        name,
        error: emailError instanceof Error ? emailError.message : String(emailError),
        stack: emailError instanceof Error ? emailError.stack : undefined
      })
      
      return NextResponse.json({
        success: false,
        error: emailError instanceof Error ? emailError.message : 'Unknown error'
      }, { status: 500 })
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Validation error (manual resend):', error.errors)
      return NextResponse.json(
        { message: 'Invalid email address' },
        { status: 400 }
      )
    }

    console.error('❌ Manual welcome email resend error:', error)
    return NextResponse.json(
      { message: 'Failed to send welcome email. Please try again.' },
      { status: 500 }
    )
  }
} 