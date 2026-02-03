import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { GET_ARTICLES } from '../graphql/queries';
import { CREATE_ARTICLE, UPDATE_ARTICLE, DELETE_ARTICLE } from '../graphql/mutations';
import { Article } from './types';

export default function ContentManager() {
  const [selectedTab, setSelectedTab] = useState<'articles' | 'create'>('articles');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    articleId: '',
    language: 'eng',
    uri: '',
    sourceUri: '',
    imageUri: '',
  });

  const { data: articlesData, loading: articlesLoading, error: articlesError, refetch: refetchArticles } = useQuery<{ articles: Article[] }>(GET_ARTICLES);

  const [createArticle, { loading: creating }] = useMutation(CREATE_ARTICLE, {
    onCompleted: () => {
      refetchArticles();
      setSelectedTab('articles');
      setSelectedArticle(null);
      setFormData({ title: '', body: '', articleId: '', language: 'eng', uri: '', sourceUri: '', imageUri: '' });
    },
  });

  const [updateArticle] = useMutation(UPDATE_ARTICLE, {
    onCompleted: () => {
      refetchArticles();
      setSelectedArticle(null);
      setFormData({ title: '', body: '', articleId: '', language: 'eng', uri: '', sourceUri: '', imageUri: '' });
    },
  });

  const [deleteArticle] = useMutation(DELETE_ARTICLE, {
    onCompleted: () => {
      refetchArticles();
    },
  });

  const handleCreate = async () => {
    try {
      await createArticle({
        variables: {
          data: {
            ...formData,
            datetime: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error('Error creating article:', error);
      alert('Failed to create article. Check console for details.');
    }
  };

  const handleUpdate = async () => {
    if (!selectedArticle) return;
    try {
      await updateArticle({
        variables: {
          documentId: selectedArticle.documentId,
          data: formData,
        },
      });
    } catch (error) {
      console.error('Error updating article:', error);
      alert('Failed to update article. Check console for details.');
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await deleteArticle({
        variables: { documentId },
      });
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Failed to delete article. Check console for details.');
    }
  };

  const handleEdit = (article: Article) => {
    setSelectedArticle(article);
    setFormData({
      title: article.title || '',
      body: article.body || '',
      articleId: article.articleId,
      language: article.language,
      uri: article.uri || '',
      sourceUri: article.sourceUri || '',
      imageUri: article.imageUri || '',
    });
    setSelectedTab('create');
  };

  const articles: Article[] = (articlesData?.articles as Article[]) || [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={(_, newValue) => {
          setSelectedTab(newValue);
          if (newValue === 'articles') {
            setSelectedArticle(null);
            setFormData({ title: '', body: '', articleId: '', language: 'eng', uri: '', sourceUri: '', imageUri: '' });
          }
        }}>
          <Tab label={`Articles (${articles.length})`} value="articles" />
          <Tab label={selectedArticle ? 'Edit Article' : 'Create Article'} value="create" />
        </Tabs>
      </Box>

      {selectedTab === 'articles' && (
        <Box>
          {articlesLoading && (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          )}
          {articlesError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              Error loading articles: {articlesError.message}
              <Typography variant="body2" sx={{ mt: 1 }}>
                Note: The GraphQL endpoint may require authentication.
              </Typography>
            </Alert>
          )}
          {!articlesLoading && !articlesError && articles.length === 0 && (
            <Alert severity="info">No articles found.</Alert>
          )}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {articles.map((article) => (
              <Box key={article.documentId} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' } }}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {article.imageUri && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={article.imageUri}
                      alt={article.title || 'Article'}
                      sx={{ objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {article.title || 'Untitled'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      <Chip label={`ID: ${article.articleId}`} size="small" variant="outlined" />
                      <Chip label={article.language.toUpperCase()} size="small" variant="outlined" />
                      {article.datetime && (
                        <Chip
                          label={new Date(article.datetime).toLocaleDateString()}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                    {article.body && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {article.body}
                      </Typography>
                    )}
                    {article.categories && article.categories.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        {article.categories.map((c, idx) => (
                          <Chip
                            key={idx}
                            label={c.uri || c.documentId}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    )}
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
                  <CardActions>
                    <IconButton
                      color="primary"
                      onClick={() => handleEdit(article)}
                      size="small"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(article.documentId)}
                      size="small"
                    >
                      <Delete />
                    </IconButton>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {selectedTab === 'create' && (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            {selectedArticle ? 'Edit Article' : 'Create New Article'}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              required
              label="Article ID"
              value={formData.articleId}
              onChange={(e) => setFormData({ ...formData, articleId: e.target.value })}
              placeholder="unique-article-id"
            />
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Article title"
            />
            <TextField
              fullWidth
              multiline
              rows={10}
              label="Body"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Article content"
            />
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <FormControl sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                <InputLabel>Language</InputLabel>
                <Select
                  value={formData.language}
                  label="Language"
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                >
                  <MenuItem value="eng">English</MenuItem>
                  <MenuItem value="spa">Spanish</MenuItem>
                  <MenuItem value="fra">French</MenuItem>
                </Select>
              </FormControl>
              <TextField
                sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}
                fullWidth
                label="URI"
                value={formData.uri}
                onChange={(e) => setFormData({ ...formData, uri: e.target.value })}
                placeholder="/article/uri"
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}
                fullWidth
                label="Source URI"
                value={formData.sourceUri}
                onChange={(e) => setFormData({ ...formData, sourceUri: e.target.value })}
                placeholder="https://source.com/article"
              />
              <TextField
                sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}
                fullWidth
                label="Image URI"
                value={formData.imageUri}
                onChange={(e) => setFormData({ ...formData, imageUri: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={selectedArticle ? handleUpdate : handleCreate}
                disabled={creating || !formData.articleId}
                size="large"
              >
                {creating ? 'Saving...' : selectedArticle ? 'Update Article' : 'Create Article'}
              </Button>
              {selectedArticle && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSelectedArticle(null);
                    setFormData({ title: '', body: '', articleId: '', language: 'eng', uri: '', sourceUri: '', imageUri: '' });
                  }}
                >
                  Cancel
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      )}
    </Container>
  );
}
