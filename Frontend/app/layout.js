import { Plus_Jakarta_Sans, Hind_Siliguri } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import Header from './_components/layout/Header';
import Footer from './_components/layout/Footer';
import {AuthProvider} from '@/lib/hooks/useAuth';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });
const bengali = Hind_Siliguri({ subsets: ['bengali'], weight: ['400', '500', '600', '700'], variable: '--font-bengali' });

export const metadata = {
  title: 'ModelMate - Which AI should you use?',
  description: 'Find the right AI for what you want to do, ranked by blind votes with prices and free options. Updated as new models come out.',
  keywords: 'best AI, AI comparison, which AI to use, AI prices, Bangla AI, ChatGPT alternatives',
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
    title: 'ModelMate - Which AI should you use?',
    description: 'Find the right AI for what you want to do, ranked by blind votes with prices and free options. Updated as new models come out.',
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
    title: 'ModelMate - Which AI should you use?',
    description: 'Find the right AI for what you want to do, ranked by blind votes with prices and free options. Updated as new models come out.',
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
      <body className={`${jakarta.variable} ${bengali.variable} font-sans`}>
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