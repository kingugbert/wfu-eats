import './globals.css';
import { AuthProvider } from './components/AuthContext';
import Navbar from './components/Navbar';

export const metadata = {
  title: 'WFU Eats | Wake Forest University Dining Guide',
  description: 'Discover the best restaurants near Wake Forest University. Share reviews, track favorites, and find your next meal.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-wfu-gray-900">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
