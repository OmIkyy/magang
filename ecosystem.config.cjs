module.exports = {
  apps: [
    {
      name: 'jurnal-magang-smk',
      script: './dist/server.cjs',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      max_memory_restart: '500M',
      autorestart: true,
      watch: false,
    },
  ],
};
