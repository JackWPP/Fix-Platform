module.exports = {
  apps: [{
    name: 'fix-platform-server',
    script: './server/app.js',
    instances: process.env.NODE_ENV === 'production' ? 'max' : 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    // 日志配置
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // 监控配置
    monitoring: false,
    
    // 重启配置
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M',
    
    // 自动重启配置
    watch: process.env.NODE_ENV !== 'production',
    watch_delay: 1000,
    ignore_watch: [
      'node_modules',
      'logs',
      'uploads',
      '.git'
    ],
    
    // 进程管理
    kill_timeout: 5000,
    listen_timeout: 3000,
    
    // 环境变量
    env_file: './server/.env'
  }],
  
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server-ip'],
      ref: 'origin/main',
      repo: 'your-git-repo-url',
      path: '/var/www/fix-platform',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt update && apt install git -y'
    }
  }
};