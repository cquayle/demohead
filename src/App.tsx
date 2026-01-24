import { useState, useEffect, useRef } from 'react';
import ContentManager from './components/ContentManager';
import './App.css';

interface ContentMessage {
  type: string;
  data: any;
  timestamp: string;
}

function App() {
  const [activeView, setActiveView] = useState<'webhook' | 'cms'>('webhook');
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>Demo CMS Head</h1>
        <nav className="main-nav">
          <button
            className={activeView === 'webhook' ? 'active' : ''}
            onClick={() => setActiveView('webhook')}
          >
            Webhook Receiver
          </button>
          <button
            className={activeView === 'cms' ? 'active' : ''}
            onClick={() => setActiveView('cms')}
          >
            Content Manager
          </button>
        </nav>
        {activeView === 'webhook' && (
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            <span className="status-dot"></span>
            <span className="status-text">{connectionStatus}</span>
          </div>
        )}
      </header>

      <main className="app-main">
        {activeView === 'webhook' && (
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="empty-state">
                <p>Waiting for content...</p>
                <p className="hint">Send content to the webhook endpoint to see it here</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className="message-card">
                  <div className="message-header">
                    <span className="message-type">{message.type}</span>
                    <span className="message-timestamp">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                  <div className="message-content">
                    <pre>{JSON.stringify(message.data, null, 2)}</pre>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {activeView === 'cms' && <ContentManager />}
      </main>

      {activeView === 'webhook' && (
        <footer className="app-footer">
          <p>Webhook endpoint: <code>POST http://localhost:3001/api/webhook</code></p>
          <p>WebSocket endpoint: <code>ws://localhost:3001/ws</code></p>
        </footer>
      )}
    </div>
  );
}

export default App;
