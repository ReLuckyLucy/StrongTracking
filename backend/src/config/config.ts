export const config = {
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  appPassword: process.env.APP_PASSWORD || '123456',
  sessionSecret: process.env.SESSION_SECRET || 'default-secret-key',

  // Session配置
  session: {
    secret: process.env.SESSION_SECRET || 'default-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24小时
    }
  },

  // 分页配置
  pagination: {
    pageSize: 20
  }
};

export default config;
