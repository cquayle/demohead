import { useQuery } from '@apollo/client/react';
import { GET_ARTICLES } from '../graphql/queries';
import {
  Box,
  Container,
  Card,
  CardContent,
  CardMedia,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  CardActionArea,
} from '@mui/material';
import { Article } from './types';

interface NewsfeedProps {
  onArticleClick: (article: Article) => void;
}

export default function Newsfeed({ onArticleClick }: NewsfeedProps) {
  const { data: articlesData, loading, error } = useQuery<{ articles: Article[] }>(GET_ARTICLES);

  const articles: Article[] = (articlesData?.articles as Article[]) || [];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Error loading articles: {error.message}
          <Typography variant="body2" sx={{ mt: 1 }}>
            Note: The GraphQL endpoint may require authentication.
          </Typography>
        </Alert>
      </Container>
    );
  }

  if (articles.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info">No articles found.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        Newsfeed
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {articles.map((article) => (
          <Box key={article.documentId} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' } }}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardActionArea onClick={() => onArticleClick(article)} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                {article.imageUri && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={article.imageUri}
                    alt={article.title || 'Article image'}
                    sx={{ objectFit: 'cover' }}
                    onError={(e) => {
                      // Hide image if it fails to load
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                    {article.title || 'Untitled Article'}
                  </Typography>
                  {article.body && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        flexGrow: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {article.body}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 'auto' }}>
                    {article.categories && article.categories.length > 0 && (
                      <Chip
                        label={article.categories[0].uri || 'Category'}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    <Chip
                      label={article.language.toUpperCase()}
                      size="small"
                      variant="outlined"
                    />
                    {article.datetime && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', alignSelf: 'center' }}>
                        {new Date(article.datetime).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                  {article.authors && article.authors.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                        {article.authors[0].givenName?.[0] || article.authors[0].authorId[0]}
                      </Avatar>
                      <Typography variant="caption" color="text.secondary">
                        {[article.authors[0].givenName, article.authors[0].familyName].filter(Boolean).join(' ') || article.authors[0].authorId}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>
        ))}
      </Box>
    </Container>
  );
}
