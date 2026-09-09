import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';

describe('Authorization & RBAC Endpoints', () => {
  let adminToken;
  let userToken;
  let ownerToken;
  let anotherOwnerToken;

  beforeAll(async () => {
    // Login as seeded Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@ratehub.local', password: 'Password@123' });
    adminToken = adminRes.body.data.token;

    // Login as seeded Normal User
    const userRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user1@ratehub.local', password: 'Password@123' });
    userToken = userRes.body.data.token;

    // Login as seeded Store Owner
    const ownerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'owner@ratehub.local', password: 'Password@123' });
    ownerToken = ownerRes.body.data.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should reject unauthenticated access to admin endpoints with 401', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    expect(res.status).toBe(401);
    expect(res.body.status).toBe('fail');
  });

  it('should reject normal user from accessing admin endpoints with 403', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.status).toBe('fail');
    expect(res.body.message).toMatch(/Forbidden/i);
  });

  it('should reject store owner from accessing admin endpoints with 403', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.status).toBe('fail');
    expect(res.body.message).toMatch(/Forbidden/i);
  });

  it('should allow admin to access admin dashboard', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.totalUsers).toBeGreaterThanOrEqual(4);
    expect(res.body.data.totalStores).toBeGreaterThanOrEqual(1);
    expect(res.body.data.totalRatings).toBeGreaterThanOrEqual(2);
  });

  it('should reject normal user from accessing store owner dashboard with 403', async () => {
    const res = await request(app)
      .get('/api/store-owner/dashboard')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('should allow store owner to access own dashboard and ratings', async () => {
    const res = await request(app)
      .get('/api/store-owner/dashboard')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.hasStore).toBe(true);
    expect(res.body.data.averageRating).toBe(4.5);

    const ratingsRes = await request(app)
      .get('/api/store-owner/ratings')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(ratingsRes.status).toBe(200);
    expect(ratingsRes.body.data.ratings.length).toBe(2);
  });
});
