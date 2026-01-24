# Demo CMS Head

A Node.js application with React frontend that receives content via webhook and streams it live to connected clients via WebSocket. Also includes a GraphQL client for querying and managing content in Strapi CMS.

**Live Demo**: [https://demohead.vercel.app/](https://demohead.vercel.app/)

## Features

- 🎣 **Webhook Endpoint**: Receive content via HTTP POST requests
- 🔌 **WebSocket Server**: Real-time content streaming to connected clients
- ⚛️ **React Frontend**: Beautiful UI to view live content
- 📊 **GraphQL Client**: Query and manage content in Strapi CMS
- 🚀 **Vite**: Fast development and build tooling
- 📦 **TypeScript**: Type-safe codebase

## Tech Stack

- **Backend**: Node.js, Express, WebSocket (ws)
- **Frontend**: React, Vite, TypeScript
- **GraphQL**: Apollo Client
- **Package Manager**: Yarn

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Yarn

### Installation

1. Install dependencies:
```bash
yarn install
```

2. Create a `.env` file (optional, defaults are provided):
```bash
# GraphQL endpoint for Strapi CMS
VITE_GRAPHQL_ENDPOINT=https://deserving-frogs-345174c2a8.strapiapp.com/graphql

# Optional: Strapi API token for authenticated requests
VITE_STRAPI_TOKEN=your_token_here
```

Or set the token in browser localStorage:
```javascript
localStorage.setItem('strapi_token', 'your_token_here');
```

### Running the Application

#### Option 1: Run both servers together (recommended)
```bash
yarn dev:all
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend dev server on `http://localhost:3000`

#### Option 2: Run servers separately

Terminal 1 - Backend:
```bash
yarn dev:server
```

Terminal 2 - Frontend:
```bash
yarn dev
```

## API Endpoints

### Webhook Endpoint
**POST** `http://localhost:3001/api/webhook`

Send content to this endpoint to broadcast it to all connected WebSocket clients.

Example:
```bash
curl -X POST http://localhost:3001/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello World", "data": {"key": "value"}}'
```

### Health Check
**GET** `http://localhost:3001/api/health`

Returns server status and number of connected clients.

### WebSocket Endpoint
**ws://localhost:3001/ws**

Connect to this endpoint to receive live content updates.

## GraphQL Client

The application includes a GraphQL client configured to connect to Strapi CMS. You can:

- **Query Content**: View articles, categories, authors, and other content types
- **Create Content**: Add new articles and other content types
- **Update Content**: Edit existing content
- **Delete Content**: Remove content from the CMS

### GraphQL Endpoint

The default GraphQL endpoint is: `https://deserving-frogs-345174c2a8.strapiapp.com/graphql`

You can change this by setting the `VITE_GRAPHQL_ENDPOINT` environment variable.

### Authentication

If your Strapi instance requires authentication, you can:

1. Set the `VITE_STRAPI_TOKEN` environment variable, or
2. Store the token in browser localStorage:
   ```javascript
   localStorage.setItem('strapi_token', 'your_jwt_token');
   ```

The GraphQL client will automatically include the token in the Authorization header for all requests.

### Available Content Types

Based on the schema introspection, the following content types are available:

- **Articles**: Main content type with title, body, categories, authors, etc.
- **Categories**: Content categorization
- **Authors**: Article authors
- **Concepts**: Content concepts/tags
- **Places**: Geographic locations
- **Countries**: Country information

## Project Structure

```
demohead/
├── server/
│   └── index.ts          # Express server with webhook and WebSocket
├── src/
│   ├── components/
│   │   ├── ContentManager.tsx  # GraphQL content management UI
│   │   └── ContentManager.css
│   ├── graphql/
│   │   ├── client.ts     # Apollo Client configuration
│   │   ├── queries.ts    # GraphQL queries
│   │   └── mutations.ts  # GraphQL mutations
│   ├── App.tsx           # Main React component
│   ├── App.css           # Component styles
│   ├── main.tsx          # React entry point
│   └── index.css         # Global styles
├── index.html            # HTML template
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript config
└── package.json          # Dependencies and scripts
```

## Development

- Frontend runs on `http://localhost:3000`
- Backend runs on `http://localhost:3001`
- WebSocket connects automatically when frontend loads
- Content received via webhook is automatically displayed in the UI

## Building for Production

```bash
yarn build
```

The built files will be in the `dist` directory.

## License

MIT
