import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, Container, Typography, Paper, Chip, Divider, Button, CardMedia, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { ArrowBack, TextFields, Code, Html } from '@mui/icons-material';
import { Article } from './types';
import { fullArticleToText } from '../utils/blocks';

export type BodyFormat = 'plain' | 'markdown' | 'html';

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
}

export default function ArticleDetail({ article, onBack }: ArticleDetailProps) {
  const [bodyFormat, setBodyFormat] = useState<BodyFormat>('plain');
  const bodyContent = fullArticleToText(article.fullArticle);

  const handleFormatChange = (_: React.MouseEvent<HTMLElement>, newFormat: BodyFormat | null) => {
    if (newFormat !== null) setBodyFormat(newFormat);
  };

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
            <Chip
              label={article.language.toUpperCase()}
              variant="outlined"
            />
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

          {bodyContent && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Render body as:
                </Typography>
                <ToggleButtonGroup
                  value={bodyFormat}
                  exclusive
                  onChange={handleFormatChange}
                  size="small"
                  aria-label="body render format"
                >
                  <ToggleButton value="plain" aria-label="plain text">
                    <TextFields sx={{ mr: 0.5 }} fontSize="small" />
                    Plain text
                  </ToggleButton>
                  <ToggleButton value="markdown" aria-label="markdown">
                    <Code sx={{ mr: 0.5 }} fontSize="small" />
                    Markdown
                  </ToggleButton>
                  <ToggleButton value="html" aria-label="html">
                    <Html sx={{ mr: 0.5 }} fontSize="small" />
                    HTML
                  </ToggleButton>
                </ToggleButtonGroup>
                <Typography variant="caption" color="text.secondary" sx={{ width: '100%' }}>
                  Only articles with body content in the selected format will render correctly.
                </Typography>
              </Box>
              <Box
                className="article-body"
                sx={{
                  lineHeight: 1.8,
                  fontSize: '1.1rem',
                  mb: 3,
                  '& .article-body-plain': { whiteSpace: 'pre-wrap' },
                  '& .article-body-markdown p': { mb: 1.5 },
                  '& .article-body-markdown ul, & .article-body-markdown ol': { pl: 3, mb: 1.5 },
                  '& .article-body-markdown h1': { fontSize: '1.5rem', mt: 2, mb: 1 },
                  '& .article-body-markdown h2': { fontSize: '1.25rem', mt: 1.5, mb: 0.75 },
                  '& .article-body-html a': { color: 'primary.main' },
                }}
              >
                {bodyFormat === 'plain' && (
                  <Typography variant="body1" className="article-body-plain" component="div">
                    {bodyContent}
                  </Typography>
                )}
                {bodyFormat === 'markdown' && (
                  <Box className="article-body-markdown">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{bodyContent}</ReactMarkdown>
                  </Box>
                )}
                {bodyFormat === 'html' && (
                  <Box
                    className="article-body-html"
                    dangerouslySetInnerHTML={{ __html: bodyContent }}
                  />
                )}
              </Box>
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
