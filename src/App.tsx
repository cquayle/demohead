import { useState, useEffect, useRef } from 'react';
import { AppBar, Toolbar, Typography, Tabs, Tab, Box, Badge } from '@mui/material';
import ContentManager from './components/ContentManager';
import Newsfeed from './components/Newsfeed';
import ArticleDetail from './components/ArticleDetail';
import { Article } from './components/types';
import './App.css';

interface ContentMessage {
  type: string;
  data: any;
  timestamp: string;
}

type ViewType = 'webhook' | 'cms' | 'newsfeed';

function App() {
  const [activeView, setActiveView] = useState<ViewType>('newsfeed');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ContentMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:3001/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setConnectionStatus('Connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'content') {
          setMessages((prev) => [...prev, data]);
        } else if (data.type === 'connected') {
          console.log('Connection confirmed:', data.message);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('Error');
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setConnectionStatus('Disconnected');
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (!isConnected) {
          connectWebSocket();
        }
      }, 3000);
    };
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
  };

  const handleBackToNewsfeed = () => {
    setSelectedArticle(null);
  };

  // If an article is selected, show the detail view
  if (selectedArticle) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Demo CMS Head
            </Typography>
          </Toolbar>
        </AppBar>
        <ArticleDetail article={selectedArticle} onBack={handleBackToNewsfeed} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Demo CMS Head
          </Typography>
          {activeView === 'webhook' && (
            <Badge
              color={isConnected ? 'success' : 'error'}
              variant="dot"
              sx={{ mr: 2 }}
            >
              <Typography variant="body2">{connectionStatus}</Typography>
            </Badge>
          )}
        </Toolbar>
        <Tabs
          value={activeView}
          onChange={(_, newValue) => {
            setActiveView(newValue);
            setSelectedArticle(null);
          }}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Newsfeed" value="newsfeed" />
          <Tab label="Content Manager" value="cms" />
          <Tab
            label={
              <Badge badgeContent={messages.length} color="secondary">
                Webhook Receiver
              </Badge>
            }
            value="webhook"
          />
        </Tabs>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1 }}>
        {activeView === 'newsfeed' && <Newsfeed onArticleClick={handleArticleClick} />}
        {activeView === 'cms' && <ContentManager />}
        {activeView === 'webhook' && (
          <Box sx={{ p: 3 }}>
            <Box className="messages-container">
              {messages.length === 0 ? (
                <Box className="empty-state" sx={{ textAlign: 'center', p: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Waiting for content...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Send content to the webhook endpoint to see it here
                  </Typography>
                </Box>
              ) : (
                messages.map((message, index) => (
                  <Box key={index} className="message-card" sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <Box className="message-header" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" color="primary" sx={{ textTransform: 'uppercase' }}>
                        {message.type}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(message.timestamp)}
                      </Typography>
                    </Box>
                    <Box className="message-content" sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, overflow: 'auto' }}>
                      <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.875rem' }}>
                        {JSON.stringify(message.data, null, 2)}
                      </pre>
                    </Box>
                  </Box>
                ))
              )}
              <div ref={messagesEndRef} />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default App;
