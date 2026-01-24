import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_ARTICLES } from '../graphql/queries';
import { CREATE_ARTICLE, UPDATE_ARTICLE, DELETE_ARTICLE } from '../graphql/mutations';
import './ContentManager.css';

interface Article {
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
}

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
  // Categories and authors queries are available for future use
  // const { data: categoriesData } = useQuery(GET_CATEGORIES);
  // const { data: authorsData } = useQuery(GET_AUTHORS);

  const [createArticle, { loading: creating }] = useMutation(CREATE_ARTICLE, {
    onCompleted: () => {
      refetchArticles();
      setSelectedTab('articles');
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
          id: selectedArticle.documentId,
          data: formData,
        },
      });
    } catch (error) {
      console.error('Error updating article:', error);
      alert('Failed to update article. Check console for details.');
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await deleteArticle({
        variables: { id: documentId },
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
    <div className="content-manager">
      <div className="tabs">
        <button
          className={selectedTab === 'articles' ? 'active' : ''}
          onClick={() => {
            setSelectedTab('articles');
            setSelectedArticle(null);
            setFormData({ title: '', body: '', articleId: '', language: 'eng', uri: '', sourceUri: '', imageUri: '' });
          }}
        >
          Articles ({articles.length})
        </button>
        <button
          className={selectedTab === 'create' ? 'active' : ''}
          onClick={() => {
            setSelectedTab('create');
            setSelectedArticle(null);
            if (!selectedArticle) {
              setFormData({ title: '', body: '', articleId: '', language: 'eng', uri: '', sourceUri: '', imageUri: '' });
            }
          }}
        >
          {selectedArticle ? 'Edit Article' : 'Create Article'}
        </button>
      </div>

      {selectedTab === 'articles' && (
        <div className="articles-list">
          {articlesLoading && <p>Loading articles...</p>}
          {articlesError && (
            <div className="error">
              <p>Error loading articles: {articlesError.message}</p>
              <p className="hint">Note: The GraphQL endpoint may require authentication.</p>
            </div>
          )}
          {!articlesLoading && !articlesError && articles.length === 0 && (
            <p>No articles found.</p>
          )}
          {articles.map((article) => (
            <div key={article.documentId} className="article-card">
              <div className="article-header">
                <h3>{article.title || 'Untitled'}</h3>
                <div className="article-actions">
                  <button onClick={() => handleEdit(article)}>Edit</button>
                  <button onClick={() => handleDelete(article.documentId)} className="delete">
                    Delete
                  </button>
                </div>
              </div>
              <div className="article-meta">
                <span>ID: {article.articleId}</span>
                <span>Language: {article.language}</span>
                {article.datetime && <span>Date: {new Date(article.datetime).toLocaleDateString()}</span>}
              </div>
              {article.body && (
                <div className="article-body">
                  <p>{article.body.substring(0, 200)}...</p>
                </div>
              )}
              {article.categories && article.categories.length > 0 && (
                <div className="article-tags">
                  Categories: {article.categories.map((c) => c.uri || c.documentId).join(', ')}
                </div>
              )}
              {article.authors && article.authors.length > 0 && (
                <div className="article-tags">
                  Authors: {article.authors.map((a) => {
                    const name = [a.givenName, a.familyName].filter(Boolean).join(' ') || a.authorId;
                    return name;
                  }).join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedTab === 'create' && (
        <div className="article-form">
          <div className="form-group">
            <label>Article ID *</label>
            <input
              type="text"
              value={formData.articleId}
              onChange={(e) => setFormData({ ...formData, articleId: e.target.value })}
              placeholder="unique-article-id"
              required
            />
          </div>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Article title"
            />
          </div>
          <div className="form-group">
            <label>Body</label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Article content"
              rows={10}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              >
                <option value="eng">English</option>
                <option value="spa">Spanish</option>
                <option value="fra">French</option>
              </select>
            </div>
            <div className="form-group">
              <label>URI</label>
              <input
                type="text"
                value={formData.uri}
                onChange={(e) => setFormData({ ...formData, uri: e.target.value })}
                placeholder="/article/uri"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Source URI</label>
              <input
                type="text"
                value={formData.sourceUri}
                onChange={(e) => setFormData({ ...formData, sourceUri: e.target.value })}
                placeholder="https://source.com/article"
              />
            </div>
            <div className="form-group">
              <label>Image URI</label>
              <input
                type="text"
                value={formData.imageUri}
                onChange={(e) => setFormData({ ...formData, imageUri: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          <div className="form-actions">
            <button onClick={selectedArticle ? handleUpdate : handleCreate} disabled={creating || !formData.articleId}>
              {creating ? 'Saving...' : selectedArticle ? 'Update Article' : 'Create Article'}
            </button>
            {selectedArticle && (
              <button onClick={() => {
                setSelectedArticle(null);
                setFormData({ title: '', body: '', articleId: '', language: 'eng', uri: '', sourceUri: '', imageUri: '' });
              }}>
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
