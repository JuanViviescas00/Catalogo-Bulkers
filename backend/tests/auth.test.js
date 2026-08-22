import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import env from '../src/config/env.js';

describe('Pruebas de Integración: Módulo Auth', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(env.MONGO_URI);
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  const testUser = {
    email: `test-${Date.now()}@demo.com`,
    password: 'secreta123',
    rol: 'user',
  };

  it('Debe registrar un nuevo usuario exitosamente (201)', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toEqual(testUser.email);
    expect(res.body.rol).toEqual('user');
    expect(res.body).not.toHaveProperty('password');
  });

  it('No debe permitir registrar un email duplicado (409)', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.statusCode).toEqual(409);
    expect(res.body.error).toHaveProperty('mensaje');
  });

  it('Debe permitir autenticar (login) con credenciales válidas (200)', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('Debe rechazar el login con contraseña incorrecta (401)', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'password_errada',
    });

    expect(res.statusCode).toEqual(401);
  });
});
