export interface Article {
  documentId: string;
  articleId: string;
  title?: string;
  body?: string;
  datetime: string;
  datetimePub?: string;
  uri?: string;
  sourceUri?: string;
  imageUri?: string;
  language: string;
  categories?: Array<{ documentId: string; uri?: string }>;
  authors?: Array<{ documentId: string; authorId: string; givenName?: string; familyName?: string }>;
  concepts?: Array<{ documentId: string; uri?: string }>;
  places?: Array<{ documentId: string; name?: string }>;
}
