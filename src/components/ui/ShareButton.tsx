import React, { useState } from 'react';
import { Button } from './Button';
import type { SearchParams } from '../../types/flight';

interface ShareButtonProps {
  searchParams: SearchParams | null;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ searchParams }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!searchParams) return;

    const params = new URLSearchParams();
    params.set('origin', searchParams.origin);
    params.set('destination', searchParams.destination);
    params.set('departureDate', searchParams.departureDate);
    if (searchParams.returnDate) params.set('returnDate', searchParams.returnDate);
    params.set('adults', String(searchParams.adults));
    if (searchParams.children) params.set('children', String(searchParams.children));
    if (searchParams.infants) params.set('infants', String(searchParams.infants));
    if (searchParams.travelClass) params.set('travelClass', searchParams.travelClass);
    if (searchParams.nonStop) params.set('nonStop', 'true');

    const shareableLink = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Flight Search',
          text: `Check out these flights from ${searchParams.origin} to ${searchParams.destination}`,
          url: shareableLink,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareableLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleShare}
      disabled={!searchParams}
      className="flex items-center gap-2"
    >
      {copied ? '✓ Copied!' : '🔗 Share'}
    </Button>
  );
};
