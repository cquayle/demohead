import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { Save, RestartAlt } from '@mui/icons-material';
import AdaptiveCardPreview from './AdaptiveCardPreview';
import { fillAdaptiveCardTemplate, articleToArticleData, type CardTemplateKind } from './adaptiveCardUtils';
import type { Article } from './types';

const TEMPLATE_KIND_LABELS: Record<CardTemplateKind, string> = {
  newsfeedHero: 'Newsfeed hero',
  newsfeedArticle: 'Newsfeed article',
  fullArticle: 'Full article',
};

const SAMPLE_ARTICLE_DATA = {
  title: 'Sample Article Title',
  summary: 'This is sample summary text for the card preview.',
  fullStory:
    'Full story body content appears here. Use placeholders: ${title}, ${summary}, ${imageUri}, ${articleId}, ${datetimePub}, ${lang}, ${uri}, ${fullStory}, ${sourceUri}.',
  imageUri:
    'data:image/svg+xml,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect fill="%23ddd" width="400" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-family="sans-serif" font-size="18">Sample image</text></svg>'
    ),
  articleId: 'sample-1',
  lang: 'ENG',
  datetimePub: 'January 1, 2025',
  uri: 'https://example.com/article',
  sourceUri: 'https://example.com/source',
};

interface CardTemplatesEditorProps {
  selectedTemplateKind: CardTemplateKind;
  onTemplateKindChange: (kind: CardTemplateKind) => void;
  templateEditorValue: string;
  onTemplateEditorChange: (value: string) => void;
  onSave: () => void;
  onReset: () => void;
  articles: Article[];
}

export default function CardTemplatesEditor({
  selectedTemplateKind,
  onTemplateKindChange,
  templateEditorValue,
  onTemplateEditorChange,
  onSave,
  onReset,
  articles,
}: CardTemplatesEditorProps) {
  const [previewWith, setPreviewWith] = useState<string>('sample');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const previewData = useMemo(() => {
    if (previewWith === 'sample') return SAMPLE_ARTICLE_DATA;
    const article = articles.find((a) => a.documentId === previewWith);
    if (!article) return SAMPLE_ARTICLE_DATA;
    return articleToArticleData(article);
  }, [previewWith, articles]);

  const filledPreviewJson = useMemo(() => {
    try {
      return fillAdaptiveCardTemplate(templateEditorValue, previewData);
    } catch {
      return '';
    }
  }, [templateEditorValue, previewData]);

  const handleSave = () => {
    onSave();
    setSaveMessage('Templates saved. They will be used in the Newsfeed and Article detail views.');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
      {/* Editor column */}
      <Paper sx={{ p: 3, flex: '1 1 50%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          Edit card template
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Use placeholders: {'${title}'}, {'${summary}'}, {'${imageUri}'}, {'${articleId}'}, {'${datetimePub}'},{' '}
          {'${lang}'}, {'${uri}'}, {'${fullStory}'}, {'${sourceUri}'}
        </Typography>

        <Tabs
          value={selectedTemplateKind}
          onChange={(_, v) => onTemplateKindChange(v as CardTemplateKind)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          {(['newsfeedHero', 'newsfeedArticle', 'fullArticle'] as CardTemplateKind[]).map((kind) => (
            <Tab key={kind} label={TEMPLATE_KIND_LABELS[kind]} value={kind} />
          ))}
        </Tabs>

        <TextField
          fullWidth
          multiline
          minRows={16}
          maxRows={28}
          label="Adaptive Card JSON"
          value={templateEditorValue}
          onChange={(e) => onTemplateEditorChange(e.target.value)}
          placeholder='{ "type": "AdaptiveCard", "version": "1.4", "body": [...] }'
          sx={{ fontFamily: 'monospace', fontSize: '0.85rem', mb: 2 }}
          error={(() => {
            try {
              JSON.parse(templateEditorValue || '{}');
              return false;
            } catch {
              return true;
            }
          })()}
          helperText={
            (() => {
              try {
                JSON.parse(templateEditorValue || '{}');
                return null;
              } catch (e) {
                return 'Invalid JSON';
              }
            })() ?? undefined
          }
        />

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" startIcon={<Save />} onClick={handleSave}>
            Save template
          </Button>
          <Button variant="outlined" startIcon={<RestartAlt />} onClick={onReset}>
            Reset to default
          </Button>
        </Box>
        {saveMessage && (
          <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSaveMessage(null)}>
            {saveMessage}
          </Alert>
        )}
      </Paper>

      {/* Preview column */}
      <Paper sx={{ p: 3, flex: '1 1 45%', minWidth: 0, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom>
          Preview
        </Typography>
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Preview with</InputLabel>
          <Select
            value={previewWith}
            label="Preview with"
            onChange={(e) => setPreviewWith(e.target.value)}
          >
            <MenuItem value="sample">Sample data</MenuItem>
            {articles.map((a) => (
              <MenuItem key={a.documentId} value={a.documentId}>
                {a.title || a.articleId || a.documentId}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <AdaptiveCardPreview cardJson={filledPreviewJson} hideLabel />
        </Box>
      </Paper>
    </Box>
  );
}
