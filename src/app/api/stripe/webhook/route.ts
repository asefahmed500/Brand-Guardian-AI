
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import connectDB from '@/lib/mongodb';
import { stripe } from '@/lib/stripe';
import UserModel from '@/models/user';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  
  if (event.type === 'checkout.session.completed') {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );
    
    const userId = subscription.metadata.userId;
    if (!userId) {
      return new NextResponse('Webhook Error: Missing user ID in metadata', {
        status: 400,
      });
    }

    try {
      await connectDB();
      const user = await UserModel.findById(userId);

      if (!user) {
        return new NextResponse('Webhook Error: User not found', { status: 404 });
      }

      // User is subscribing for the first time or re-subscribing
      user.subscriptionPlan = 'pro';
      user.stripeCustomerId = subscription.customer as string;
      user.stripeSubscriptionId = subscription.id;
      user.stripePriceId = subscription.items.data[0].price.id;
      user.stripeCurrentPeriodEnd = new Date(
        subscription.current_period_end * 1000
      );
      
      await user.save();
      
    } catch (error) {
       console.error('Webhook database error on checkout completion:', error);
       return new NextResponse('Webhook database error on checkout completion', { status: 500 });
    }
  }

  // Handle subscription updates or cancellations from billing portal
  if (event.type === 'invoice.payment_succeeded') {
    const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
    );
     try {
        await connectDB();
        await UserModel.findOneAndUpdate({
            stripeSubscriptionId: subscription.id,
        }, {
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            subscriptionPlan: 'pro', // Ensure plan is active
        });
     } catch (error) {
        console.error('Webhook database error on payment succeeded:', error);
        return new NextResponse('Webhook database error on payment succeeded', { status: 500 });
     }
  }


  return new NextResponse(null, { status: 200 });
}
