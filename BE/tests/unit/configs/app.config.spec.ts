describe('app config environment defaults', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.NODE_ENV;
    delete process.env.HOST;
    delete process.env.PORT;
    delete process.env.CORS_ORIGIN;
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses local development defaults when environment variables are missing', () => {
    const { appEnv } = require('../../../src/configs/app.config');

    expect(appEnv.NODE_ENV).toBe('development');
    expect(appEnv.HOST).toBe('localhost');
    expect(appEnv.PORT).toBe(3000);
    expect(appEnv.CORS_ORIGIN).toBe('http://localhost:3000');
  });
});
