import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import Header from './_components/layout/Header';
import Footer from './_components/layout/Footer';
import {AuthProvider} from '@/lib/hooks/useAuth';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ModelMate - AI Model Review Platform',
  description: 'Discover, review, and compare AI models with our comprehensive platform',
  keywords: 'AI, machine learning, model review, comparison, artificial intelligence',
  authors: [{ name: 'ModelMate Team' }],
  creator: 'ModelMate',
  publisher: 'ModelMate',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'ModelMate - AI Model Review Platform',
    description: 'Discover, review, and compare AI models with our comprehensive platform',
    url: 'https://modelmate.ai',
    siteName: 'ModelMate',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'ModelMate Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ModelMate - AI Model Review Platform',
    description: 'Discover, review, and compare AI models with our comprehensive platform',
    creator: '@modelmate',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          {children}
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}