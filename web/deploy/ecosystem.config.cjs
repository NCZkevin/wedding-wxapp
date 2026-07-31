module.exports = {
  apps: [
    {
      name: 'wedding-api',
      script: 'server/dist/index.js',
      cwd: '/www/server/wedding-api',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
