import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';

describe('Input Validation Constraints', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should reject name below 20 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Short Name', // 10 chars
        email: 'valtest1@example.com',
        password: 'Password@123',
        address: '100 Long Enough Address Street, Metro City',
      });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
    expect(res.body.message).toMatch(/at least 20 characters/i);
  });

  it('should reject name above 60 characters', async () => {
    const longName = 'A'.repeat(61);
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: longName,
        email: 'valtest2@example.com',
        password: 'Password@123',
        address: '100 Long Enough Address Street, Metro City',
      });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
    expect(res.body.message).toMatch(/at most 60 characters/i);
  });

  it('should reject address above 400 characters', async () => {
    const longAddress = 'B'.repeat(401);
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Valid Length Full Name Tester',
        email: 'valtest3@example.com',
        password: 'Password@123',
        address: longAddress,
      });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
    expect(res.body.message).toMatch(/at most 400 characters/i);
  });

  it('should reject invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Valid Length Full Name Tester',
        email: 'not-an-email',
        password: 'Password@123',
        address: '100 Long Enough Address Street, Metro City',
      });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
    expect(res.body.message).toMatch(/valid email/i);
  });

  it('should reject password longer than 16 characters', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Valid Length Full Name Tester',
        email: 'valtest4@example.com',
        password: 'Password12345678@Long', // >16 chars
        address: '100 Long Enough Address Street, Metro City',
      });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('fail');
    expect(res.body.message).toMatch(/at most 16 characters/i);
  });
});
