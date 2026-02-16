import type { Article } from './types';

/**
 * Default Adaptive Card template for article preview / Power Automate.
 * Placeholders: {{title}}, {{summary}}, {{imageUri}}, {{articleId}}, {{datetimePub}}, {{lang}}, {{uri}}, {{fullStory}}
 */
export const DEFAULT_ADAPTIVE_CARD_TEMPLATE = `{
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "type": "AdaptiveCard",
  "version": "1.4",
  "body": [
    {
      "type": "TextBlock",
      "text": "{{title}}",
      "weight": "bolder",
      "size": "large",
      "wrap": true
    },
    {
      "type": "TextBlock",
      "text": "{{summary}}",
      "wrap": true,
      "isVisible": "{{#summary}}true{{/summary}}{{^summary}}false{{/summary}}"
    },
    {
      "type": "Image",
      "url": "{{imageUri}}",
      "altText": "{{title}}",
      "size": "large",
      "isVisible": "{{#imageUri}}true{{/imageUri}}{{^imageUri}}false{{/imageUri}}"
    },
    {
      "type": "FactSet",
      "facts": [
        { "title": "Article ID", "value": "{{articleId}}" },
        { "title": "Language", "value": "{{lang}}" },
        { "title": "Published", "value": "{{datetimePub}}" }
      ]
    }
  ],
  "actions": [
    {
      "type": "Action.OpenUrl",
      "title": "View article",
      "url": "{{uri}}"
    }
  ]
}`;

/** Simpler template that uses only {{...}} placeholders (no Mustache visibility). */
export const SIMPLE_ADAPTIVE_CARD_TEMPLATE = `{
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "type": "AdaptiveCard",
  "version": "1.4",
  "body": [
    {
      "type": "TextBlock",
      "text": "{{title}}",
      "weight": "bolder",
      "size": "large",
      "wrap": true
    },
    {
      "type": "TextBlock",
      "text": "{{summary}}",
      "wrap": true
    },
    {
      "type": "Image",
      "url": "{{imageUri}}",
      "altText": "Article image",
      "size": "large"
    },
    {
      "type": "FactSet",
      "facts": [
        { "title": "Article ID", "value": "{{articleId}}" },
        { "title": "Language", "value": "{{lang}}" },
        { "title": "Published", "value": "{{datetimePub}}" }
      ]
    }
  ],
  "actions": [
    {
      "type": "Action.OpenUrl",
      "title": "View article",
      "url": "{{uri}}"
    }
  ]
}`;

/** Compact card for newsfeed list (title, summary, image, meta; no actions so parent can handle click). */
export const NEWSFEED_CARD_TEMPLATE = `{
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "type": "AdaptiveCard",
  "version": "1.4",
  "body": [
    {
      "type": "Image",
      "url": "{{imageUri}}",
      "altText": "{{title}}",
      "size": "large"
    },
    {
      "type": "TextBlock",
      "text": "{{title}}",
      "weight": "bolder",
      "size": "large",
      "wrap": true
    },
    {
      "type": "TextBlock",
      "text": "{{summary}}",
      "wrap": true
    },
    {
      "type": "FactSet",
      "facts": [
        { "title": "Language", "value": "{{lang}}" },
        { "title": "Published", "value": "{{datetimePub}}" }
      ]
    }
  ]
}`;

/** Full article detail card (includes fullStory and source link). */
export const DETAIL_CARD_TEMPLATE = `{
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "type": "AdaptiveCard",
  "version": "1.4",
  "body": [
    {
      "type": "Image",
      "url": "{{imageUri}}",
      "altText": "{{title}}",
      "size": "large"
    },
    {
      "type": "TextBlock",
      "text": "{{title}}",
      "weight": "bolder",
      "size": "extraLarge",
      "wrap": true
    },
    {
      "type": "FactSet",
      "facts": [
        { "title": "Language", "value": "{{lang}}" },
        { "title": "Published", "value": "{{datetimePub}}" }
      ]
    },
    {
      "type": "TextBlock",
      "text": "{{summary}}",
      "wrap": true,
      "isSubtle": true
    },
    {
      "type": "TextBlock",
      "text": "{{fullStory}}",
      "wrap": true
    }
  ],
  "actions": [
    {
      "type": "Action.OpenUrl",
      "title": "View Original Article",
      "url": "{{uri}}"
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
 * Replace {{key}} placeholders in template with article data.
 * Keys: title, summary, fullStory, imageUri, articleId, lang, datetimePub, uri, sourceUri.
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
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    out = out.replace(placeholder, value);
  }
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
