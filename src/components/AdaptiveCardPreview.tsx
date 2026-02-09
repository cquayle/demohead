import { useEffect, useRef } from 'react';
import * as AdaptiveCards from 'adaptivecards';
import 'adaptivecards/lib/adaptivecards.css';
import { Box, Typography } from '@mui/material';

interface AdaptiveCardPreviewProps {
  cardJson: string;
}

export default function AdaptiveCardPreview({ cardJson }: AdaptiveCardPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.innerHTML = '';

    let cardPayload: object;
    try {
      cardPayload = JSON.parse(cardJson);
    } catch {
      return;
    }

    if (!cardPayload || typeof (cardPayload as any).type !== 'string') return;

    try {
      const card = new AdaptiveCards.AdaptiveCard();
      card.hostConfig = new AdaptiveCards.HostConfig({
        fontFamily: 'Segoe UI, Helvetica Neue, sans-serif',
      });
      card.parse(cardPayload);
      card.render(el);
    } catch (err) {
      console.warn('Adaptive card render error:', err);
      el.innerHTML = '';
      const msg = document.createElement('p');
      msg.style.color = '#d32f2f';
      msg.textContent = 'Could not render card. Check JSON.';
      el.appendChild(msg);
    }

    return () => {
      el.innerHTML = '';
    };
  }, [cardJson]);

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Rendered preview
      </Typography>
      <Box
        ref={containerRef}
        className="ac-adaptiveCard"
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 2,
          minHeight: 80,
          '& .ac-adaptiveCard': { boxShadow: 'none' },
        }}
      />
    </Box>
  );
}
