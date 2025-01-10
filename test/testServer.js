import express from 'express';
import { createPreviewHandler } from '../lib/index.js';

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Define the handler
const previewHandler = createPreviewHandler({
  secret: 'test-secret',
  resolveFullPath: (path) => `https://example.com${path}`,
  playgroundPath: '/playground',
  additionalQueryParams: ['utm_source'],
  previewSpecificParams: ['previewToken'],
  playgroundSpecificParams: ['sessionId'],
  enhance: async (composition, { req }) => {
    composition.enhanced = true;
    composition.timestamp = new Date().toISOString();
  },
});

// Attach the handler to the `/preview` route
app.use('/preview', previewHandler);

// Add routes for testing different scenarios
app.get('/test-get-success', (req, res) => {
  const testQuery = {
    path: '/success',
    utm_source: 'google',
    previewToken: '12345',
    sessionId: 'abcde',
  };

  res.json({
    message: 'Simulating GET request with success case',
    requestUrl: `http://localhost:3000/preview?${new URLSearchParams(testQuery)}`,
  });
});

app.post('/test-post-success', (req, res) => {
  res.json({
    message: 'Simulating POST request with success case',
    requestBody: {
      composition: {
        id: 'example-composition',
        name: 'Test Composition',
      },
      hash: 123456, // Simulate a valid hash
    },
  });
});

app.post('/test-post-failure', (req, res) => {
  res.json({
    message: 'Simulating POST request with failure case (missing composition)',
    requestBody: {
      hash: 123456,
    },
  });
});

// Handle invalid routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Invalid route' });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log(`\nTest URLs:`);
  console.log(`GET success: http://localhost:${PORT}/test-get-success`);
  console.log(`POST success: http://localhost:${PORT}/test-post-success`);
  console.log(`POST failure: http://localhost:${PORT}/test-post-failure`);
});
