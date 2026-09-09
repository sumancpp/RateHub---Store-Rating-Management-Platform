import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';

describe('Store Rating API Endpoints', () => {
  let userToken;
  let testStore;
  let anotherUserToken;

  beforeAll(async () => {
    // Get seeded store
    testStore = await prisma.store.findFirst();

    // Login user1
    const user1Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user1@ratehub.local', password: 'Password@123' });
    userToken = user1Res.body.data.token;

    // Create a fresh normal user for rating creation tests
    const freshUser = {
      name: 'Fresh Rating Tester Normal User',
      email: 'ratingtester@example.com',
      password: 'Password@123',
      address: '42 Galaxy Way, Star City, Orbit Sector 7',
    };

    await prisma.user.deleteMany({ where: { email: freshUser.email } });

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send(freshUser);
    anotherUserToken = registerRes.body.data.token;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'ratingtester@example.com' } });
    await prisma.$disconnect();
  });

  it('should accept valid rating of 5', async () => {
    const res = await request(app)
      .post(`/api/stores/${testStore.id}/ratings`)
      .set('Authorization', `Bearer ${anotherUserToken}`)
      .send({ rating: 5 });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.rating.rating).toBe(5);
  });

  it('should reject duplicate rating submission from same user', async () => {
    const res = await request(app)
      .post(`/api/stores/${testStore.id}/ratings`)
      .set('Authorization', `Bearer ${anotherUserToken}`)
      .send({ rating: 4 });

    expect(res.status).toBe(409);
    expect(res.body.status).toBe('fail');
    expect(res.body.message).toMatch(/already rated/i);
  });

  it('should allow modifying existing rating with PUT', async () => {
    const res = await request(app)
      .put(`/api/stores/${testStore.id}/ratings`)
      .set('Authorization', `Bearer ${anotherUserToken}`)
      .send({ rating: 1 });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.rating.rating).toBe(1);
  });

  it('should reject rating of 0', async () => {
    const res = await request(app)
      .put(`/api/stores/${testStore.id}/ratings`)
      .set('Authorization', `Bearer ${anotherUserToken}`)
      .send({ rating: 0 });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  it('should reject rating of 6', async () => {
    const res = await request(app)
      .put(`/api/stores/${testStore.id}/ratings`)
      .set('Authorization', `Bearer ${anotherUserToken}`)
      .send({ rating: 6 });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });

  it('should reject decimal rating (3.5)', async () => {
    const res = await request(app)
      .put(`/api/stores/${testStore.id}/ratings`)
      .set('Authorization', `Bearer ${anotherUserToken}`)
      .send({ rating: 3.5 });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
    expect(res.body.message).toMatch(/integer/i);
  });

  it('should reject string rating ("five")', async () => {
    const res = await request(app)
      .put(`/api/stores/${testStore.id}/ratings`)
      .set('Authorization', `Bearer ${anotherUserToken}`)
      .send({ rating: 'five' });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
  });
});
