import { useMemo } from 'react';
import { Box, Container, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Article } from './types';
import AdaptiveCardPreview from './AdaptiveCardPreview';
import { fillAdaptiveCardTemplate, articleToArticleData, DETAIL_CARD_TEMPLATE } from './adaptiveCardUtils';

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
  /** When true, hide the back button (e.g. in Content Manager preview). */
  hideBackButton?: boolean;
}

export default function ArticleDetail({ article, onBack, hideBackButton }: ArticleDetailProps) {
  const cardJson = useMemo(
    () => fillAdaptiveCardTemplate(DETAIL_CARD_TEMPLATE, articleToArticleData(article)),
    [article]
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {!hideBackButton && (
        <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ mb: 3 }}>
          Back to Newsfeed
        </Button>
      )}

      <Box sx={{ borderRadius: 1, overflow: 'hidden', boxShadow: 2 }}>
        <AdaptiveCardPreview cardJson={cardJson} hideLabel />
      </Box>
    </Container>
  );
}
