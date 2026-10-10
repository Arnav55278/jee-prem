import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'KINETIC JEE - Precision Tracking & Performance Workstation',
  description: 'Ultra-professional JEE practice tracker, real-time analytics, 100-Q Fire Calendar, interactive question bank, custom reports, and secure admin workstation.',
  openGraph: {
    title: 'KINETIC JEE - Precision Tracking & Performance Workstation',
    description: 'Ultra-professional JEE practice tracker, real-time analytics, 100-Q Fire Calendar, interactive question bank, custom reports, and secure admin workstation.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KINETIC JEE - Precision Tracking & Performance Workstation',
    description: 'Ultra-professional JEE practice tracker, real-time analytics, 100-Q Fire Calendar, interactive question bank, custom reports, and secure admin workstation.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning className="bg-[#090b10] text-[#f1f3f9] antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
