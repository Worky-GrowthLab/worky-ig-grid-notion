/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Las imágenes vienen de los archivos subidos a Notion (S3 firmado),
    // el dominio cambia según el workspace, así que dejamos <img> normal
    // en vez de next/image para no tener que whitelistear dominios.
  },
  async headers() {
    return [
      {
        // Permite que Notion embeba esta app dentro de un iframe.
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: 'frame-ancestors *' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
