import './globals.css';

export const metadata = {
  title: 'Worky — Grid IG Preview',
  description: 'Previsualización del grid de Instagram conectada al Content Calendar de Notion.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
