import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
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

    console.log(`📧 New subscription attempt: ${email} (${name || 'no name'})`)

    // Check if subscriber already exists
    const { data: existingSubscriber, error: findError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('email', email)
      .single()

    if (findError && findError.code !== 'PGRST116') {
      // PGRST116 means "no rows returned", which is fine
      console.error('Error checking existing subscriber:', findError)
      return NextResponse.json(
        { message: 'Failed to check subscription status. Please try again.' },
        { status: 500 }
      )
    }

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        console.log(`📧 ${email} already subscribed and active`)
        return NextResponse.json(
          { message: 'You are already subscribed to The Beacon!' },
          { status: 400 }
        )
      } else {
        console.log(`📧 Reactivating subscription for ${email}`)
        // Reactivate existing subscriber
        const { error: updateError } = await supabase
          .from('newsletter_subscribers')
          .update({ 
            isActive: true,
            unsubscribedAt: null,
            name: name || existingSubscriber.name
          })
          .eq('email', email)

        if (updateError) {
          console.error('Error reactivating subscriber:', updateError)
          return NextResponse.json(
            { message: 'Failed to reactivate subscription. Please try again.' },
            { status: 500 }
          )
        }

        // Add to Brevo and send welcome email with detailed logging
        let brevoSuccess = false
        let emailSuccess = false
        
        try {
          console.log(`📧 Adding ${email} to Brevo...`)
          await addContactToBrevo(email, name || existingSubscriber.name)
          brevoSuccess = true
          console.log(`✅ Successfully added ${email} to Brevo`)
        } catch (brevoError) {
          console.error('❌ Brevo contact add error (reactivation):', brevoError)
        }

        try {
          console.log(`📧 Sending welcome email to ${email}...`)
          const result = await sendWelcomeEmail(email, name || existingSubscriber.name)
          emailSuccess = true
          console.log(`✅ Welcome email sent successfully to ${email}:`, result.messageId)
        } catch (emailError) {
          console.error('❌ Welcome email error (reactivation):', emailError)
          // Log the specific error details
          console.error('❌ Welcome email error details:', {
            email,
            name: name || existingSubscriber.name,
            error: emailError instanceof Error ? emailError.message : String(emailError),
            stack: emailError instanceof Error ? emailError.stack : undefined
          })
        }

        console.log(`📧 Reactivation complete for ${email}: Brevo=${brevoSuccess}, Email=${emailSuccess}`)
        
        return NextResponse.json(
          { message: 'Welcome back! Your subscription has been reactivated.' },
          { status: 200 }
        )
      }
    }

    console.log(`📧 Creating new subscription for ${email}`)
    // Create new subscriber
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email,
        name,
        isActive: true,
        subscribedAt: new Date().toISOString()
      })

    if (insertError) {
      console.error('Error creating subscriber:', insertError)
      return NextResponse.json(
        { message: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      )
    }

    console.log(`✅ Database subscription created for ${email}`)

    // Add to Brevo and send welcome email with detailed logging
    let brevoSuccess = false
    let emailSuccess = false
    
    try {
      console.log(`📧 Adding ${email} to Brevo...`)
      await addContactToBrevo(email, name)
      brevoSuccess = true
      console.log(`✅ Successfully added ${email} to Brevo`)
    } catch (brevoError) {
      console.error('❌ Brevo contact add error (new subscription):', brevoError)
    }

    try {
      console.log(`📧 Sending welcome email to ${email}...`)
      const result = await sendWelcomeEmail(email, name)
      emailSuccess = true
      console.log(`✅ Welcome email sent successfully to ${email}:`, result.messageId)
    } catch (emailError) {
      console.error('❌ Welcome email error (new subscription):', emailError)
      // Log the specific error details
      console.error('❌ Welcome email error details:', {
        email,
        name,
        error: emailError instanceof Error ? emailError.message : String(emailError),
        stack: emailError instanceof Error ? emailError.stack : undefined
      })
    }

    console.log(`📧 New subscription complete for ${email}: Brevo=${brevoSuccess}, Email=${emailSuccess}`)

    return NextResponse.json(
      { message: 'Successfully subscribed to The Beacon!' },
      { status: 201 }
    )

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Validation error:', error.errors)
      return NextResponse.json(
        { message: 'Invalid email address' },
        { status: 400 }
      )
    }

    console.error('❌ Newsletter subscription error:', error)
    return NextResponse.json(
      { message: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    )
  }
} 