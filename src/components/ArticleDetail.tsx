import { Box, Container, Typography, Paper, Chip, Divider, Button, CardMedia } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Article } from './types';

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
}

export default function ArticleDetail({ article, onBack }: ArticleDetailProps) {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ mb: 3 }}>
        Back to Newsfeed
      </Button>

      <Paper elevation={2} sx={{ overflow: 'hidden' }}>
        {article.imageUri && (
          <CardMedia
            component="img"
            height="400"
            image={article.imageUri}
            alt={article.title || 'Article image'}
            sx={{ objectFit: 'cover', width: '100%' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}

        <Box sx={{ p: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
            {article.title || 'Untitled Article'}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            <Chip label={(article.lang || '').toUpperCase()} variant="outlined" />
            {article.datetimePub && (
              <Chip
                label={new Date(article.datetimePub).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                variant="outlined"
              />
            )}
          </Box>

          {article.summary && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
              {article.summary}
            </Typography>
          )}

          <Divider sx={{ my: 3 }} />

          {article.fullStory && (
            <Typography
              variant="body1"
              component="div"
              sx={{ lineHeight: 1.8, fontSize: '1.1rem', mb: 3, whiteSpace: 'pre-wrap' }}
            >
              {article.fullStory}
            </Typography>
          )}

          {article.sourceUri && (
            <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom></Typography>
              <Button href={article.uri || ''} target="_blank" rel="noopener noreferrer" variant="outlined" size="small">
                View Original Article
              </Button>
            </Box>
          )}

          {article.sourceUri && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Source: </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{article.sourceUri}</Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
