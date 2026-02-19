import { useMemo } from 'react';
import { Box, Container, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Article } from './types';
import AdaptiveCardPreview from './AdaptiveCardPreview';
import { fillAdaptiveCardTemplate, articleToArticleData } from './adaptiveCardUtils';
import { useCardTemplates } from '../context/CardTemplatesContext';

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
  /** When true, hide the back button (e.g. in Content Manager preview). */
  hideBackButton?: boolean;
}

export default function ArticleDetail({ article, onBack, hideBackButton }: ArticleDetailProps) {
  const { getTemplate } = useCardTemplates();
  const fullArticleTemplate = getTemplate('fullArticle');
  const cardJson = useMemo(
    () => fillAdaptiveCardTemplate(fullArticleTemplate, articleToArticleData(article)),
    [article, fullArticleTemplate]
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
