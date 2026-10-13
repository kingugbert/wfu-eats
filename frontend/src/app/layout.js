import './globals.css';
import { AuthProvider } from './components/AuthContext';
import Navbar from './components/Navbar';

export const metadata = {
  title: 'WFU Eats - Wake Forest Student Dining',
  description: 'Discover and share your favorite restaurants near Wake Forest University',
  icons: {
    icon: '/favicon.svg'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places`}
          async
          defer
        />
      </head>
      <body className="bg-wfu-gray-900 text-white min-h-screen">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
