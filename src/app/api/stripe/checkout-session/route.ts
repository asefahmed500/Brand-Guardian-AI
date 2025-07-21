'use server';

import {NextResponse} from 'next/server';
import {auth} from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/user';
import {stripe} from '@/lib/stripe';

const absoluteUrl = (path: string) => {
  const baseUrl = process.env.AUTH_URL || 'http://localhost:9002';
  return `${baseUrl}${path}`;
};

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return new NextResponse('Unauthorized', {status: 401});
    }

    await connectDB();
    const user = await User.findById(userId);

    if (!user) {
      return new NextResponse('User not found', {status: 404});
    }

    if (user.subscriptionPlan === 'pro') {
      // Logic for billing portal for existing pro users
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId!,
        return_url: absoluteUrl('/dashboard/settings'),
      });
      return NextResponse.json({url: stripeSession.url});
    }

    // Logic for new pro subscription
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: absoluteUrl('/dashboard/settings?success=true'),
      cancel_url: absoluteUrl('/dashboard/settings?canceled=true'),
      payment_method_types: ['card'],
      mode: 'subscription',
      billing_address_collection: 'auto',
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'USD',
            product_data: {
              name: 'Brand Guardian Pro Plan',
              description: 'Unlock advanced AI features and higher usage limits.',
            },
            unit_amount: 2500, // $25.00
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
    });

    return NextResponse.json({url: stripeSession.url});
  } catch (error) {
    console.error('[STRIPE_POST]', error);
    return new NextResponse('Internal Server Error', {status: 500});
  }
}
