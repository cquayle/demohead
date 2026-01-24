#!/bin/bash

# Test script to send content to the webhook endpoint

echo "Sending test content to webhook..."
curl -X POST http://localhost:3001/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello from webhook!",
    "data": {
      "userId": 123,
      "action": "test",
      "metadata": {
        "source": "test-script",
        "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
      }
    }
  }'

echo -e "\n\nWebhook test completed!"
