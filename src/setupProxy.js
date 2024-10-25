// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.REACT_APP_API_URL, // 환경 변수를 사용, 프록시할 서버 주소
      changeOrigin: true,
    })
  );
};