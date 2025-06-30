import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = subscribeSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      if (existingUser.isActive) {
        return NextResponse.json(
          { message: 'You are already subscribed to Topline!' },
          { status: 400 }
        )
      } else {
        // Reactivate existing user
        await prisma.user.update({
          where: { email },
          data: { isActive: true }
        })
        
        return NextResponse.json(
          { message: 'Welcome back! Your subscription has been reactivated.' },
          { status: 200 }
        )
      }
    }

    // Create new user
    await prisma.user.create({
      data: {
        email,
        role: 'SUBSCRIBER',
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