import request from 'supertest';
import http from 'http';
import app from '../index';

let server: http.Server;

beforeAll((done: jest.DoneCallback) => {
  server = app.listen(0, done);
});
afterAll((done: jest.DoneCallback) => {
  server.close(done);
});

describe('Portfolio API', () => {
  it('should fetch the portfolio', async () => {
    const res = await request(server).get('/api/portfolio');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('portfolio');
    expect(Array.isArray(res.body.portfolio)).toBe(true);
  });
});

describe('Alerts API', () => {
  let alertId: string;

  it('should create an alert', async () => {
    const res = await request(server)
      .post('/api/alerts')
      .send({ name: 'Test Alert', condition: 'test', isActive: true });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    alertId = res.body.id;
  });

  it('should get all alerts', async () => {
    const res = await request(server).get('/api/alerts');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get alert by ID', async () => {
    const res = await request(server).get(`/api/alerts/${alertId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', alertId);
  });

  it('should update an alert', async () => {
    const res = await request(server)
      .put(`/api/alerts/${alertId}`)
      .send({ isActive: false });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('isActive', false);
  });

  it('should delete an alert', async () => {
    const res = await request(server).delete(`/api/alerts/${alertId}`);
    expect(res.statusCode).toBe(204);
  });
});

describe('Analytics API', () => {
  it('should get average response time', async () => {
    const res = await request(server).get('/api/analytics/response-time');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('averageResponseTimeMs');
  });
}); 