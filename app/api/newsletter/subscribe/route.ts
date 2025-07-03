import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
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
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email }
    })

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json(
          { message: 'You are already subscribed to Topline!' },
          { status: 400 }
        )
      } else {
        // Reactivate existing subscriber
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: { 
            isActive: true,
            unsubscribedAt: null,
            name: name || existingSubscriber.name
          }
        })
        
        return NextResponse.json(
          { message: 'Welcome back! Your subscription has been reactivated.' },
          { status: 200 }
        )
      }
    }

    // Create new subscriber
    await prisma.newsletterSubscriber.create({
      data: {
        email,
        name,
        isActive: true,
      }
    })

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