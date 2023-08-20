'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useProModal } from '@/lib/zustand-store';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

export default function ProModal() {
  const proModal = useProModal();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  const handleSubscribe = async () => {
    try {
      setLoading(true);

      const response = await axios.get('/api/stripe');
      window.location.href = response.data.url;
    } catch (err) {
      toast({
        variant: 'destructive',
        description: 'something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={proModal.isOpen} onOpenChange={proModal.onOpen}>
      <DialogContent>
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-center">Upgrade to Pro</DialogTitle>
          <DialogDescription className="text-center space-y-2">
            Create{' '}
            <span className="text-sky-300 mx-1 font-medium">Custom AI</span>{' '}
            Figure
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="flex justify-between">
          <p className="text-2xl font-medium ">
            $10
            <span className="text-sm font-normal">.99 / mo</span>
          </p>
          <Button
            disabled={loading}
            variant={'premium'}
            onClick={handleSubscribe}
          >
            Subscribe
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
