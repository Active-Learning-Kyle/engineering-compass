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
  title: 'Engineering Compass | ENGG1101',
  description:
    'A formative 30-question assessment across six engineering competencies and eight hands-on toolkit areas.',
  openGraph: {
    title: 'Engineering Compass',
    description:
      'Find your engineering direction across six practical competencies.',
    type: 'website',
    images: [
      {
        url: 'https://engineering-compass.heqihao522828.chatgpt.site/og.png',
        width: 1200,
        height: 630,
        alt: 'Engineering Compass — Find your engineering direction.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Engineering Compass',
    description:
      'Find your engineering direction across six practical competencies.',
    images: ['https://engineering-compass.heqihao522828.chatgpt.site/og.png'],
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
