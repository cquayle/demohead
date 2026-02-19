import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  Box,
  Button,
  Container,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Divider,
} from '@mui/material';
import { Edit, Delete, Send, Settings } from '@mui/icons-material';
import { GET_ARTICLES } from '../graphql/queries';
import { CREATE_ARTICLE, UPDATE_ARTICLE, DELETE_ARTICLE } from '../graphql/mutations';
import { Article, sortArticlesByLatestFirst } from './types';
import {
  formDataToArticleData,
  fillAdaptiveCardTemplate,
  NEWSFEED_CARD_TEMPLATE,
  type CardTemplateKind,
} from './adaptiveCardUtils';
import { useCardTemplates } from '../context/CardTemplatesContext';
import CardTemplatesEditor from './CardTemplatesEditor';

const STORAGE_WEBHOOK_URL = 'powerAutomateWebhookUrl';
const STORAGE_CARD_TEMPLATE = 'adaptiveCardTemplateJson';

const initialForm = {
  title: '',
  body: '',
  summary: '',
  articleId: '',
  lang: 'eng',
  uri: '',
  sourceUri: '',
  imageUri: '',
};

function getStoredWebhookUrl(): string {
  try {
    return localStorage.getItem(STORAGE_WEBHOOK_URL) || '';
  } catch {
    return '';
  }
}

function getStoredCardTemplate(): string {
  try {
    const stored = localStorage.getItem(STORAGE_CARD_TEMPLATE);
    if (stored) return stored;
  } catch {}
  return NEWSFEED_CARD_TEMPLATE;
}

function setStoredWebhookUrl(url: string) {
  try {
    localStorage.setItem(STORAGE_WEBHOOK_URL, url);
  } catch {}
}

function setStoredCardTemplate(template: string) {
  try {
    localStorage.setItem(STORAGE_CARD_TEMPLATE, template);
  } catch {}
}

export default function ContentManager() {
  const { getTemplate, setTemplate, resetToDefault } = useCardTemplates();
  const [selectedTab, setSelectedTab] = useState<'articles' | 'create' | 'templates'>('articles');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState(initialForm);
  const [webhookUrl, setWebhookUrl] = useState(getStoredWebhookUrl);
  const [cardTemplate, setCardTemplate] = useState(getStoredCardTemplate);
  const [showWebhookSettings, setShowWebhookSettings] = useState(false);
  const [sendingWebhook, setSendingWebhook] = useState(false);
  const [webhookError, setWebhookError] = useState<string | null>(null);

  // Card template editor state (for "Card templates" tab)
  const [selectedTemplateKind, setSelectedTemplateKind] = useState<CardTemplateKind>('newsfeedHero');
  const [templateEditorValue, setTemplateEditorValue] = useState('');

  const { data: articlesData, loading: articlesLoading, error: articlesError, refetch: refetchArticles } = useQuery<{ articles: Article[] }>(GET_ARTICLES);
  const [createArticle, { loading: creating }] = useMutation(CREATE_ARTICLE, {
    onCompleted: () => {
      refetchArticles();
      setSelectedTab('articles');
      setSelectedArticle(null);
      setFormData(initialForm);
    },
  });
  const [updateArticle] = useMutation(UPDATE_ARTICLE, {
    onCompleted: () => {
      refetchArticles();
      setSelectedArticle(null);
      setFormData(initialForm);
    },
  });
  const [deleteArticle] = useMutation(DELETE_ARTICLE, { onCompleted: () => refetchArticles() });

  /** Article data from form for preview. */
  const formArticleData = useMemo(() => {
    return formDataToArticleData({
      ...formData,
      datetimePub: selectedArticle?.datetimePub,
    });
  }, [formData, selectedArticle?.datetimePub]);

  /** Filled adaptive card JSON for current form (for send to Power Automate). */
  const filledCardJson = useMemo(() => {
    return fillAdaptiveCardTemplate(cardTemplate, formArticleData);
  }, [cardTemplate, formArticleData]);

  const handleCreate = async () => {
    try {
      const { body, ...rest } = formData;
      await createArticle({
        variables: {
          data: {
            ...rest,
            fullStory: body || undefined,
            datetimePub: new Date().toISOString(),
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
      const { body, ...rest } = formData;
      await updateArticle({
        variables: {
          documentId: selectedArticle.documentId,
          data: { ...rest, fullStory: body || undefined },
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
      await deleteArticle({ variables: { documentId } });
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Failed to delete article. Check console for details.');
    }
  };

  const handleEdit = (article: Article) => {
    setSelectedArticle(article);
    setFormData({
      title: article.title || '',
      body: article.fullStory || '',
      summary: article.summary || '',
      articleId: article.articleId,
      lang: article.lang || '',
      uri: article.uri || '',
      sourceUri: article.sourceUri || '',
      imageUri: article.imageUri || '',
    });
    setSelectedTab('create');
  };

  const handleSendToPowerAutomate = async () => {
    const url = webhookUrl.trim();
    if (!url) {
      setWebhookError('Please set the Power Automate webhook URL in settings.');
      setShowWebhookSettings(true);
      return;
    }
    setWebhookError(null);
    setSendingWebhook(true);
    try {
      let payload: string;
      try {
        payload = filledCardJson;
        JSON.parse(payload);
      } catch {
        setWebhookError('Invalid adaptive card JSON.');
        return;
      }
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      setWebhookError(null);
      alert('Adaptive card sent to Power Automate successfully.');
    } catch (err: any) {
      setWebhookError(err?.message || 'Failed to send to webhook.');
    } finally {
      setSendingWebhook(false);
    }
  };

  const saveWebhookSettings = () => {
    setStoredWebhookUrl(webhookUrl);
    setStoredCardTemplate(cardTemplate);
    setShowWebhookSettings(false);
  };

  const articles: Article[] = sortArticlesByLatestFirst((articlesData?.articles as Article[]) || []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => {
            setSelectedTab(newValue);
            if (newValue === 'articles') {
              setSelectedArticle(null);
              setFormData(initialForm);
            }
            if (newValue === 'templates') {
              setTemplateEditorValue(getTemplate(selectedTemplateKind));
            }
          }}
        >
          <Tab label={`Articles (${articles.length})`} value="articles" />
          <Tab label={selectedArticle ? 'Edit Article' : 'Create Article'} value="create" />
          <Tab label="Card templates" value="templates" />
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
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {article.title || 'Untitled'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      <Chip label={`ID: ${article.articleId}`} size="small" variant="outlined" />
                      <Chip label={(article.lang || '').toUpperCase()} size="small" variant="outlined" />
                      {article.datetimePub && (
                        <Chip label={new Date(article.datetimePub).toLocaleDateString()} size="small" variant="outlined" />
                      )}
                    </Box>
                    {(article.summary || article.fullStory) && (
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
                        {article.summary || article.fullStory}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <IconButton color="primary" onClick={() => handleEdit(article)} size="small">
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(article.documentId)} size="small">
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
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
          {/* Form column */}
          <Paper sx={{ p: 4, flex: { xs: '1 1 auto', lg: '1 1 50%' }, minWidth: 0 }}>
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
                label="Summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Short summary or teaser"
              />
              <TextField
                fullWidth
                multiline
                rows={10}
                label="Body (full story)"
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Full story (plain text)"
              />
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <FormControl sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' } }}>
                  <InputLabel>Language</InputLabel>
                  <Select value={formData.lang} label="Language" onChange={(e) => setFormData({ ...formData, lang: e.target.value })}>
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

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  onClick={selectedArticle ? handleUpdate : handleCreate}
                  disabled={creating || !formData.articleId}
                  size="large"
                >
                  {creating ? 'Saving...' : selectedArticle ? 'Update Article' : 'Create Article'}
                </Button>
                {selectedArticle && (
                  <Button variant="outlined" onClick={() => { setSelectedArticle(null); setFormData(initialForm); }}>
                    Cancel
                  </Button>
                )}
                <Button
                  variant="outlined"
                  startIcon={<Send />}
                  onClick={handleSendToPowerAutomate}
                  disabled={sendingWebhook}
                  size="large"
                >
                  {sendingWebhook ? 'Sending...' : 'Send to Power Automate'}
                </Button>
                <Button
                  variant="text"
                  startIcon={<Settings />}
                  onClick={() => setShowWebhookSettings(true)}
                  size="medium"
                >
                  Webhook & card template
                </Button>
              </Box>
              {webhookError && (
                <Alert severity="error" onClose={() => setWebhookError(null)}>
                  {webhookError}
                </Alert>
              )}
            </Box>
          </Paper>

          {/* Preview pane: all template kinds */}
          <Paper sx={{ p: 3, flex: { xs: '1 1 auto', lg: '1 1 50%' }, minWidth: 0 }}>
            <CardTemplatesEditor
              selectedTemplateKind={selectedTemplateKind}
              onTemplateKindChange={setSelectedTemplateKind}
              templateEditorValue={templateEditorValue}
              onTemplateEditorChange={() => {}}
              onSave={() => {}}
              onReset={() => {}}
              articles={articles}
              previewArticleData={formArticleData}
              previewOnly={true}
            />
          </Paper>
        </Box>
      )}

      {selectedTab === 'templates' && (
        <CardTemplatesEditor
          selectedTemplateKind={selectedTemplateKind}
          onTemplateKindChange={(kind) => {
            setSelectedTemplateKind(kind);
            setTemplateEditorValue(getTemplate(kind));
          }}
          templateEditorValue={templateEditorValue}
          onTemplateEditorChange={setTemplateEditorValue}
          onSave={() => setTemplate(selectedTemplateKind, templateEditorValue)}
          onReset={() => {
            resetToDefault(selectedTemplateKind);
            setTemplateEditorValue(getTemplate(selectedTemplateKind));
          }}
          articles={articles}
        />
      )}

      {/* Webhook & adaptive card template settings dialog */}
      {showWebhookSettings && (
        <Paper
          sx={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1300,
            p: 3,
            maxWidth: 560,
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: 6,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Power Automate webhook & adaptive card template
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Configure the webhook URL and the adaptive card JSON. Use placeholders: {'${title}'}, {'${summary}'}, {'${imageUri}'}, {'${articleId}'}, {'${datetimePub}'}, {'${lang}'}, {'${uri}'}, {'${fullStory}'}.
          </Typography>
          <TextField
            fullWidth
            label="Power Automate webhook URL"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://prod-00.westus.logic.azure.com/workflows/..."
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            minRows={12}
            label="Adaptive card JSON template"
            value={cardTemplate}
            onChange={(e) => setCardTemplate(e.target.value)}
            placeholder='{ "type": "AdaptiveCard", ... }'
            sx={{ fontFamily: 'monospace', fontSize: '0.85rem', mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={() => setShowWebhookSettings(false)}>Cancel</Button>
            <Button variant="contained" onClick={saveWebhookSettings}>
              Save
            </Button>
          </Box>
        </Paper>
      )}
      {showWebhookSettings && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(0,0,0,0.4)',
            zIndex: 1299,
          }}
          onClick={() => setShowWebhookSettings(false)}
          aria-hidden
        />
      )}
    </Container>
  );
}
