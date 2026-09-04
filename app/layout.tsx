import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    'https://active-learning-kyle.github.io/engineering-compass/',
  ),
  title: 'Engineering Compass | Standard & Pro',
  icons: { icon: `${import.meta.env.BASE_URL}compass.svg` },
  description:
    'Explore your role in an engineering team with Standard (30 questions) or Pro (60 questions), across six competencies and nine technical toolkit areas.',
  openGraph: {
    title: 'Engineering Compass',
    description: 'Reflect on how you think, build and grow as an engineer.',
    type: 'website',
    images: [
      {
        url: 'https://active-learning-kyle.github.io/engineering-compass/og.png',
        width: 1200,
        height: 630,
        alt: 'Engineering Compass — reflect on how you think, build and grow as an engineer.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Engineering Compass',
    description: 'Reflect on how you think, build and grow as an engineer.',
    images: [
      'https://active-learning-kyle.github.io/engineering-compass/og.png',
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
