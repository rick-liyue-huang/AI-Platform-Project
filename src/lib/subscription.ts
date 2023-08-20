import { auth } from '@clerk/nextjs';
import prismaDB from './prisma-db';

const DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;

export const checkSubscription = async () => {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

  const userSubscription = await prismaDB.userSubscription.findFirst({
    where: {
      userId,
    },
    select: {
      stripeCurrentPeriodEnd: true,
      stripeCustomerId: true,
      stripePriceId: true,
      stripeSubscriptionId: true,
    },
  });

  if (!userSubscription) {
    return false;
  }

  const isValid =
    userSubscription.stripePriceId &&
    userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MILLISECONDS >
      Date.now();

  return !!isValid;
};
