import { auth, currentUser } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import prismaDB from '@/lib/prisma-db';
import { stripe } from '@/lib/stripe';
import { absoluteUrl } from '@/lib/utils';
import { use } from 'react';

const settingUrl = absoluteUrl('/settings');

export async function GET() {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse('unauthorized', { status: 401 });
    }

    const userSubscription = await prismaDB.userSubscription.findUnique({
      where: {
        userId,
      },
    });

    if (userSubscription && userSubscription.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: settingUrl,
      });

      return new NextResponse(JSON.stringify({ url: stripeSession.url }));
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: settingUrl,
      cancel_url: settingUrl,
      payment_method_types: ['card'],
      mode: 'subscription',
      billing_address_collection: 'auto',
      customer_email: user.emailAddresses[0].emailAddress,
      line_items: [
        {
          price_data: {
            currency: 'AUD',
            product_data: {
              name: 'Figure Pro',
              description: 'Figure Pro Subscription',
            },
            unit_amount: 999,
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

    return new NextResponse(JSON.stringify({ url: stripeSession.url }));
  } catch (err) {
    console.log('[Stripe GET] Error:', err);
    return new NextResponse('internal server error', { status: 500 });
  }
}
