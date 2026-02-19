import type { Article } from './types';


/** Template kinds used by the app (newsfeed hero, newsfeed grid item, full article detail). */
export type CardTemplateKind = 'newsfeedHero' | 'newsfeedArticle' | 'fullArticle';

const STORAGE_KEY_PREFIX = 'adaptiveCardTemplate_';
const STORAGE_KEYS: Record<CardTemplateKind, string> = {
  newsfeedHero: `${STORAGE_KEY_PREFIX}newsfeedHero`,
  newsfeedArticle: `${STORAGE_KEY_PREFIX}newsfeedArticle`,
  fullArticle: `${STORAGE_KEY_PREFIX}fullArticle`,
};

/** Default template for newsfeed hero (featured article). Same as newsfeed article by default; customize for larger hero. */
export const NEWSFEED_HERO_CARD_TEMPLATE = `{
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "type": "AdaptiveCard",
  "version": "1.6",
  "body": [
     {
      "type": "Container",
      "roundedCorners": true,
      "backgroundImage": {
          "url": "\${imageUri}",
          "horizontalAlignment": "Center",
          "verticalAlignment": "Center"
      },
      "height": "stretch",
      "minHeight": "300px",
      "verticalContentAlignment": "Center"
    },
    {
      "type": "TextBlock",
      "text": "\${title}",
      "weight": "bolder",
      "size": "extraLarge",
      "wrap": true
    },
    {
      "type": "TextBlock",
      "text": "\${summary}",
      "wrap": true
    },
    {
      "type": "FactSet",
      "facts": [
        { "title": "Language", "value": "\${lang}" },
        { "title": "Published", "value": "\${datetimePub}" }
      ]
    }
  ]
}`;

/** Compact card for newsfeed list (title, summary, image, meta; no actions so parent can handle click). */
export const NEWSFEED_CARD_TEMPLATE = `{
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "type": "AdaptiveCard",
  "version": "1.6",
  "body": [
   {
      "type": "Container",
      "roundedCorners": true,
      "backgroundImage": {
          "url": "\${imageUri}",
          "horizontalAlignment": "Center",
          "verticalAlignment": "Center"
      },
      "width": "stretch",
      "height": "stretch",
      "minHeight": "200px",
      "verticalContentAlignment": "Center"
    },
    {
      "type": "TextBlock",
      "text": "\${title}",
      "weight": "bolder",
      "size": "large",
      "wrap": true
    },
    {
      "type": "TextBlock",
      "text": "\${summary}",
      "wrap": true
    },
    {
      "type": "FactSet",
      "facts": [
        { "title": "Language", "value": "\${lang}" },
        { "title": "Published", "value": "\${datetimePub}" }
      ]
    }
  ]
}`;

/** Full article detail card (includes fullStory and source link). */
export const DETAIL_CARD_TEMPLATE = `{
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "type": "AdaptiveCard",
  "version": "1.6",
  "body": [
    {
      "type": "Container",
      "roundedCorners": true,
      "backgroundImage": {
          "url": "\${imageUri}",
          "horizontalAlignment": "Center",
          "verticalAlignment": "Center"
      },
      "height": "stretch",
      "maxHeight": "200px",
      "verticalContentAlignment": "Center"
    },
    {
      "type": "TextBlock",
      "text": "\${title}",
      "weight": "bolder",
      "size": "extraLarge",
      "wrap": true
    },
    {
      "type": "FactSet",
      "facts": [
        { "title": "Language", "value": "\${lang}" },
        { "title": "Published", "value": "\${datetimePub}" }
      ]
    },
    {
      "type": "TextBlock",
      "text": "\${summary}",
      "wrap": true,
      "isSubtle": true
    },
    {
      "type": "TextBlock",
      "text": "\${fullStory}",
      "wrap": true
    }
  ],
  "actions": [
    {
      "type": "Action.OpenUrl",
      "title": "View Original Article",
      "url": "\${uri}"
    }
  ]
}`;

export interface ArticleDataForCard {
  title: string;
  summary: string;
  fullStory?: string;
  imageUri: string;
  articleId: string;
  lang: string;
  datetimePub: string;
  uri: string;
  sourceUri?: string;
}

const EMPTY_IMAGE_PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/** Escape a string so it is safe inside a JSON string value (e.g. after "text": "). */
function escapeForJsonString(s: string): string {
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Replace ${key} placeholders in template with article data.
 * Keys: title, summary, fullStory, imageUri, articleId, lang, datetimePub, uri, sourceUri.
 * Computed: ${summaryVisible}, ${imageUriVisible} → true/false for optional blocks.
 * Empty imageUri is replaced with a 1x1 transparent pixel so the card still renders.
 * String values are escaped so quotes/newlines in content do not break the JSON.
 */
export function fillAdaptiveCardTemplate(
  template: string,
  data: Partial<ArticleDataForCard>
): string {
  let out = template;
  const dataWithPlaceholders = { ...data };
  if (!dataWithPlaceholders.imageUri) {
    dataWithPlaceholders.imageUri = EMPTY_IMAGE_PLACEHOLDER;
  }
  const keys: (keyof ArticleDataForCard)[] = [
    'title',
    'summary',
    'fullStory',
    'imageUri',
    'articleId',
    'lang',
    'datetimePub',
    'uri',
    'sourceUri',
  ];
  for (const key of keys) {
    const raw = dataWithPlaceholders[key] ?? '';
    const value = escapeForJsonString(String(raw));
    const placeholder = new RegExp(`\\$\\{${key}\\}`, 'g');
    out = out.replace(placeholder, value);
  }
  // Computed visibility placeholders (for optional summary/image blocks)
  out = out.replace(/\$\{summaryVisible\}/g, (data.summary ?? '') ? 'true' : 'false');
  out = out.replace(/\$\{imageUriVisible\}/g, (data.imageUri ?? '') ? 'true' : 'false');
  return out;
}

/** Build article data from form-like fields for adaptive card / preview. */
export function formDataToArticleData(form: {
  title: string;
  body: string;
  summary: string;
  articleId: string;
  lang: string;
  uri: string;
  imageUri: string;
  datetimePub?: string;
}): ArticleDataForCard {
  const datetimePub = form.datetimePub
    ? new Date(form.datetimePub).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  return {
    title: form.title || 'Untitled',
    summary: form.summary || '',
    fullStory: form.body || '',
    imageUri: form.imageUri || '',
    articleId: form.articleId || '',
    lang: (form.lang || 'eng').toUpperCase(),
    datetimePub,
    uri: form.uri || '#',
    sourceUri: undefined,
  };
}

/** Build article data from Article (for newsfeed and detail adaptive card rendering). */
export function articleToArticleData(article: Article): ArticleDataForCard {
  const datetimePub = article.datetimePub
    ? new Date(article.datetimePub).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : '';
  return {
    title: article.title || 'Untitled',
    summary: article.summary || '',
    fullStory: article.fullStory || '',
    imageUri: article.imageUri || '',
    articleId: article.articleId || '',
    lang: (article.lang || 'eng').toUpperCase(),
    datetimePub,
    uri: article.uri || '#',
    sourceUri: article.sourceUri || '',
  };
}

/** Return the default template for a given kind (for editor "Reset to default"). */
export function getDefaultCardTemplate(kind: CardTemplateKind): string {
  switch (kind) {
    case 'newsfeedHero':
      return NEWSFEED_HERO_CARD_TEMPLATE;
    case 'newsfeedArticle':
      return NEWSFEED_CARD_TEMPLATE;
    case 'fullArticle':
      return DETAIL_CARD_TEMPLATE;
    default:
      return NEWSFEED_CARD_TEMPLATE;
  }
}

/**
 * Migrate old Mustache-style placeholders to ${...} format.
 * Converts {{key}} → ${key} and Mustache visibility conditionals → ${summaryVisible} / ${imageUriVisible}.
 */
function migrateMustacheToDollarBraces(template: string): string {
  if (!template.includes('{{')) return template;
  let out = template;
  // Mustache conditionals used for isVisible
  out = out.replace(/\{\{#summary\}\}true\{\{\/summary\}\}\{\{\^summary\}\}false\{\{\/summary\}\}/g, '${summaryVisible}');
  out = out.replace(/\{\{#imageUri\}\}true\{\{\/imageUri\}\}\{\{\^imageUri\}\}false\{\{\/imageUri\}\}/g, '${imageUriVisible}');
  // Simple {{key}} → ${key}
  out = out.replace(/\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g, '${$1}');
  return out;
}

/** Read stored template for a kind from localStorage; falls back to default. Migrates old {{...}} placeholders to ${...}. */
export function getStoredCardTemplateByKind(kind: CardTemplateKind): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS[kind]);
    if (stored) {
      const migrated = migrateMustacheToDollarBraces(stored);
      if (migrated !== stored) {
        localStorage.setItem(STORAGE_KEYS[kind], migrated);
      }
      return migrated;
    }
  } catch { }
  return getDefaultCardTemplate(kind);
}

/** Persist template for a kind to localStorage. */
export function setStoredCardTemplateByKind(kind: CardTemplateKind, template: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS[kind], template);
  } catch { }
}
