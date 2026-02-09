import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
} from '@mui/material';
import { Article } from './types';

/** Presentational article card matching Newsfeed layout (no click/navigation). */
interface ArticleCardPreviewProps {
  article: Article;
  compact?: boolean;
}

export default function ArticleCardPreview({ article, compact = false }: ArticleCardPreviewProps) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
    >
      {article.imageUri && (
        <CardMedia
          component="img"
          height={compact ? 200 : 320}
          image={article.imageUri}
          alt={article.title || 'Article'}
          sx={{ objectFit: 'cover' }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant={compact ? 'h6' : 'h5'}
          component="h2"
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          {article.title || 'Untitled Article'}
        </Typography>
        {(article.summary || article.fullStory) && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              flexGrow: 1,
              display: '-webkit-box',
              WebkitLineClamp: compact ? 3 : 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {article.summary || article.fullStory}
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 'auto' }}>
          <Chip label={(article.lang || '').toUpperCase()} size="small" variant="outlined" />
          {article.datetimePub && (
            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', alignSelf: 'center' }}>
              {new Date(article.datetimePub).toLocaleDateString()}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
