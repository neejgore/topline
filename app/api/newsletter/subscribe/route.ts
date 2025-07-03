import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { z } from 'zod'

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = subscribeSchema.parse(body)

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
        return NextResponse.json(
          { message: 'You are already subscribed to Topline!' },
          { status: 400 }
        )
      } else {
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
        
        return NextResponse.json(
          { message: 'Welcome back! Your subscription has been reactivated.' },
          { status: 200 }
        )
      }
    }

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

    // TODO: Send welcome email
    // await sendWelcomeEmail(email)

    return NextResponse.json(
      { message: 'Successfully subscribed to Topline!' },
      { status: 201 }
    )

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