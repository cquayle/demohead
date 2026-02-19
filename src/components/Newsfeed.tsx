import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client/react';
import { GET_ARTICLES_CONNECTION } from '../graphql/queries';
import { Box, Button, Container, Typography, CircularProgress, Alert, IconButton, Tooltip } from '@mui/material';
import { Shuffle } from '@mui/icons-material';
import { Article, sortArticlesByLatestFirst } from './types';
import AdaptiveCardPreview from './AdaptiveCardPreview';
import { fillAdaptiveCardTemplate, articleToArticleData } from './adaptiveCardUtils';
import { useCardTemplates } from '../context/CardTemplatesContext';

function pickRandomHero(articles: Article[]): Article | null {
  if (articles.length === 0) return null;
  return articles[Math.floor(Math.random() * articles.length)] ?? null;
}

const PAGE_SIZE = 10;

interface NewsfeedProps {
  onArticleClick: (article: Article) => void;
  liveArticles?: Article[];
}

interface PageInfo {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export default function Newsfeed({ onArticleClick, liveArticles = [] }: NewsfeedProps) {
  const { getTemplate } = useCardTemplates();
  const heroTemplate = getTemplate('newsfeedHero');
  const gridTemplate = getTemplate('newsfeedArticle');

  const [apiArticles, setApiArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [heroArticle, setHeroArticle] = useState<Article | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { data, loading, error } = useQuery<{
    articles_connection: { nodes: Article[]; pageInfo: PageInfo };
  }>(GET_ARTICLES_CONNECTION, {
    variables: { page: 1, pageSize: PAGE_SIZE },
  });

  const [fetchMoreQuery, { loading: loadingMore }] = useLazyQuery<{
    articles_connection: { nodes: Article[]; pageInfo: PageInfo };
  }>(GET_ARTICLES_CONNECTION);

  useEffect(() => {
    const conn = data?.articles_connection;
    if (conn) {
      setApiArticles(conn.nodes);
      setHasMore(conn.pageInfo.page < conn.pageInfo.pageCount);
      setPage(conn.pageInfo.page);
    }
  }, [data]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    fetchMoreQuery({ variables: { page: page + 1, pageSize: PAGE_SIZE } }).then((result) => {
      const conn = result.data?.articles_connection;
      if (conn) {
        setApiArticles((prev) => {
          const next = [...prev, ...conn.nodes];
          return next;
        });
        setHasMore(conn.pageInfo.page < conn.pageInfo.pageCount);
        setPage(conn.pageInfo.page);
      }
    });
  }, [hasMore, loadingMore, page, fetchMoreQuery]);

  const liveIds = new Set(liveArticles.map((a) => a.articleId));
  const allArticles: Article[] = sortArticlesByLatestFirst([
    ...liveArticles,
    ...apiArticles.filter((a) => !liveIds.has(a.articleId)),
  ]);

  // After each load (initial or load more), pick a random hero
  useEffect(() => {
    if (allArticles.length > 0) {
      setHeroArticle(pickRandomHero(allArticles));
    }
  }, [allArticles.length]);

  const hero = heroArticle && allArticles.some((a) => a.documentId === heroArticle.documentId)
    ? heroArticle
    : allArticles[0] ?? null;
  const gridArticles = hero ? allArticles.filter((a) => a.documentId !== hero.documentId) : allArticles;

  const shuffleHero = useCallback(() => {
    if (allArticles.length > 0) {
      setHeroArticle(pickRandomHero(allArticles));
    }
  }, [allArticles]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: '200px', threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  if (loading && allArticles.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error && allArticles.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Error loading articles: {error.message}
          <Typography variant="body2" sx={{ mt: 1 }}>
            Note: The GraphQL endpoint may require authentication.
          </Typography>
        </Alert>
      </Container>
    );
  }

  if (allArticles.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="info">No articles found.</Alert>
      </Container>
    );
  }

  const ArticleCard = ({ article, template }: { article: Article; template: string }) => {
    const cardJson = useMemo(
      () => fillAdaptiveCardTemplate(template, articleToArticleData(article)),
      [article, template]
    );
    return (
      <Box
        onClick={() => onArticleClick(article)}
        sx={{
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          borderRadius: 1,
          overflow: 'hidden',
          '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
        }}
      >
        <AdaptiveCardPreview cardJson={cardJson} hideLabel />
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Newsfeed
        </Typography>
        <Tooltip title="Pick a random article as the hero (for demo)">
          <IconButton onClick={shuffleHero} color="primary" size="large" aria-label="Shuffle hero article">
            <Shuffle />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Hero: random article (adaptive card) */}
      {hero && (
        <Box sx={{ mb: 4 }} key={hero.documentId}>
          <ArticleCard article={hero} template={heroTemplate} />
        </Box>
      )}

      {/* Grid: rest of articles (adaptive cards) */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {gridArticles.map((article) => (
          <Box
            key={article.documentId}
            sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' } }}
          >
            <ArticleCard article={article} template={gridTemplate} />
          </Box>
        ))}
      </Box>

      {/* Load more: button + sentinel for infinite scroll */}
      <Box
        ref={sentinelRef}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          py: 4,
          minHeight: 80,
        }}
      >
        {loadingMore && <CircularProgress size={32} />}
        {hasMore && !loadingMore && (
          <Button variant="outlined" onClick={loadMore} size="large">
            Load more articles
          </Button>
        )}
      </Box>
    </Container>
  );
}
