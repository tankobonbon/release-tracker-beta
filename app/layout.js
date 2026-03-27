import './globals.css';

export const metadata = {
  title: 'Tankobonbon Follow Shelf',
  description: 'Follow collections and see newly added books.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
