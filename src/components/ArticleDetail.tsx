import { Box, Container, Typography, Paper, Chip, Avatar, Divider, Button, CardMedia } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Article } from './types';

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
}

export default function ArticleDetail({ article, onBack }: ArticleDetailProps) {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={onBack}
        sx={{ mb: 3 }}
      >
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
            onError={(e) => {
              // Hide image if it fails to load
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}

        <Box sx={{ p: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
            {article.title || 'Untitled Article'}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {article.categories && article.categories.map((category, index) => (
              <Chip
                key={index}
                label={category.uri || 'Category'}
                color="primary"
                variant="outlined"
              />
            ))}
            <Chip
              label={article.language.toUpperCase()}
              variant="outlined"
            />
            {article.datetime && (
              <Chip
                label={new Date(article.datetime).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                variant="outlined"
              />
            )}
          </Box>

          {article.authors && article.authors.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ width: 40, height: 40 }}>
                {article.authors[0].givenName?.[0] || article.authors[0].authorId[0]}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {[article.authors[0].givenName, article.authors[0].familyName].filter(Boolean).join(' ') || article.authors[0].authorId}
                </Typography>
                {article.authors.length > 1 && (
                  <Typography variant="caption" color="text.secondary">
                    and {article.authors.length - 1} other{article.authors.length > 2 ? 's' : ''}
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {article.body && (
            <Box
              sx={{
                '& p': {
                  mb: 2,
                  lineHeight: 1.8,
                },
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                  mt: 3,
                  mb: 2,
                  fontWeight: 600,
                },
                '& h1': { fontSize: '2rem' },
                '& h2': { fontSize: '1.75rem' },
                '& h3': { fontSize: '1.5rem' },
                '& ul, & ol': {
                  mb: 2,
                  pl: 3,
                },
                '& li': {
                  mb: 1,
                },
                '& code': {
                  bgcolor: 'grey.100',
                  px: 0.5,
              py: 0.25,
              borderRadius: 0.5,
              fontFamily: 'monospace',
              fontSize: '0.9em',
            },
            '& pre': {
              bgcolor: 'grey.100',
              p: 2,
              borderRadius: 1,
              overflow: 'auto',
              mb: 2,
              '& code': {
                bgcolor: 'transparent',
                p: 0,
              },
            },
            '& blockquote': {
              borderLeft: 3,
              borderColor: 'primary.main',
              pl: 2,
              ml: 0,
              fontStyle: 'italic',
              color: 'text.secondary',
              mb: 2,
            },
            '& a': {
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              borderRadius: 1,
              mb: 2,
            },
            '& table': {
              width: '100%',
              borderCollapse: 'collapse',
              mb: 2,
            },
            '& th, & td': {
              border: 1,
              borderColor: 'divider',
              px: 2,
              py: 1,
            },
            '& th': {
              bgcolor: 'grey.100',
              fontWeight: 600,
            },
            mb: 3,
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {article.body}
          </ReactMarkdown>
        </Box>
      )}

          {article.sourceUri && (
            <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Source
              </Typography>
              <Button
                href={article.sourceUri}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                size="small"
              >
                View Original Article
              </Button>
            </Box>
          )}

          {article.uri && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                URI
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {article.uri}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
