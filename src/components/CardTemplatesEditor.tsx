import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { Save, RestartAlt, ExpandMore } from '@mui/icons-material';
import AdaptiveCardPreview from './AdaptiveCardPreview';
import JsonEditor from './JsonEditor';
import { fillAdaptiveCardTemplate, articleToArticleData, type CardTemplateKind, type ArticleDataForCard } from './adaptiveCardUtils';
import { useCardTemplates } from '../context/CardTemplatesContext';
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
  /** Optional: Override preview data (e.g. from form). When set, shows all template kinds. */
  previewArticleData?: Partial<ArticleDataForCard>;
  /** When true, hide the editor and show all template previews. */
  previewOnly?: boolean;
}

export default function CardTemplatesEditor({
  selectedTemplateKind,
  onTemplateKindChange,
  templateEditorValue,
  onTemplateEditorChange,
  onSave,
  onReset,
  articles,
  previewArticleData,
  previewOnly = false,
}: CardTemplatesEditorProps) {
  const [previewWith, setPreviewWith] = useState<string>('sample');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const { getTemplate } = useCardTemplates();

  const previewData = useMemo(() => {
    if (previewArticleData) return previewArticleData as ArticleDataForCard;
    if (previewWith === 'sample') return SAMPLE_ARTICLE_DATA;
    const article = articles.find((a) => a.documentId === previewWith);
    if (!article) return SAMPLE_ARTICLE_DATA;
    return articleToArticleData(article);
  }, [previewWith, articles, previewArticleData]);

  const filledPreviewJson = useMemo(() => {
    try {
      return fillAdaptiveCardTemplate(templateEditorValue, previewData);
    } catch {
      return '';
    }
  }, [templateEditorValue, previewData]);

  // Generate previews for all template kinds when previewOnly is true
  const allTemplatePreviews = useMemo(() => {
    if (!previewOnly) return null;
    const kinds: CardTemplateKind[] = ['newsfeedHero', 'newsfeedArticle', 'fullArticle'];
    return kinds.map((kind) => {
      const template = getTemplate(kind);
      try {
        const filled = fillAdaptiveCardTemplate(template, previewData);
        return { kind, filled };
      } catch {
        return { kind, filled: '' };
      }
    });
  }, [previewOnly, previewData, getTemplate]);

  const handleSave = () => {
    onSave();
    setSaveMessage('Templates saved. They will be used in the Newsfeed and Article detail views.');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  // Preview-only mode: show all template kinds
  if (previewOnly && allTemplatePreviews) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Preview in all template kinds
        </Typography>
        {allTemplatePreviews.map(({ kind, filled }) => (
          <Accordion key={kind} defaultExpanded={kind === 'newsfeedArticle'}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" fontWeight={600}>
                {TEMPLATE_KIND_LABELS[kind]}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 2 }}>
                <AdaptiveCardPreview cardJson={filled} hideLabel />
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  }

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

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
            Adaptive Card JSON (validated against Adaptive Cards schema)
          </Typography>
          <JsonEditor
            value={templateEditorValue}
            onChange={onTemplateEditorChange}
            adaptiveCardSchema={true}
            height={420}
          />
        </Box>

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
        {!previewArticleData && (
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
        )}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <AdaptiveCardPreview cardJson={filledPreviewJson} hideLabel />
        </Box>
      </Paper>
    </Box>
  );
}
