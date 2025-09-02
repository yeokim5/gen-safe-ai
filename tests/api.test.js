const request = require('supertest');
const app = require('../server');

describe('Gen-SAFE API', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
    });
  });

  describe('GET /api/analysis/examples', () => {
    it('should return example system descriptions', async () => {
      const response = await request(app)
        .get('/api/analysis/examples')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('examples');
      expect(response.body.examples).toHaveProperty('structured');
      expect(response.body.examples).toHaveProperty('simple');
    });
  });

  describe('POST /api/analysis/validate', () => {
    it('should validate simple text description', async () => {
      const response = await request(app)
        .post('/api/analysis/validate')
        .send({
          description: 'A brake system for autonomous vehicles with hydraulic components.'
        })
        .expect(200);

      expect(response.body).toHaveProperty('valid', true);
      expect(response.body).toHaveProperty('format', 'simple');
    });

    it('should validate structured description', async () => {
      const response = await request(app)
        .post('/api/analysis/validate')
        .send({
          systemName: 'Test System',
          description: 'A test system for validation',
          components: [
            { name: 'Component A', function: 'Does something important' }
          ]
        })
        .expect(200);

      expect(response.body).toHaveProperty('valid', true);
      expect(response.body).toHaveProperty('format', 'structured');
    });

    it('should reject invalid input', async () => {
      const response = await request(app)
        .post('/api/analysis/validate')
        .send({
          description: 'Too short'
        })
        .expect(400);

      expect(response.body).toHaveProperty('valid', false);
    });
  });

  describe('POST /api/analysis/generate', () => {
    it('should handle simple text analysis request', async () => {
      const response = await request(app)
        .post('/api/analysis/generate')
        .send({
          description: 'A comprehensive brake system for an autonomous vehicle including brake pedal, master cylinder, brake lines, ABS controller, and brake pads. The system uses hydraulic pressure to provide safe and reliable braking performance.'
        })
        .timeout(30000); // Allow more time for AI processing

      // Should either succeed with AI or fallback to mock data
      expect([200, 503]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('results');
        expect(response.body.results).toHaveProperty('fmeca');
        expect(response.body.results).toHaveProperty('fta');
      }
    });

    it('should reject requests with insufficient description', async () => {
      const response = await request(app)
        .post('/api/analysis/generate')
        .send({
          description: 'Short'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown-endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/analysis/validate')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);
    });
  });
});

// Clean up after tests
afterAll(() => {
  // Close any open connections
  if (app.close) {
    app.close();
  }
});
