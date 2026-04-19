/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['synclastic-albertine-unindulgently.ngrok-free.dev'],
  experimental: {
    // تقليل استهلاك الذاكرة أثناء التطوير
    memoryBasedWorkersCount: true,
  },
  // تسريع تجميع ملفات JavaScript
  swcMinify: true,
  reactStrictMode: false, // إغلاق الـ Strict Mode في الـ Dev يقلل من عمليات الـ Re-render المزدوجة
};

module.exports = nextConfig;