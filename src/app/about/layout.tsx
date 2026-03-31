import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Smart Wheels Skating Academy — our vision, mission, and training programs. Building champions through expert coaching and world-class facilities since 2014.',
  openGraph: {
    title: 'About Smart Wheels Skating Academy',
    description: 'Our vision, mission, and coaching programs. Producing state and national champions across India.',
    url: 'https://smartwheelsacademy.com/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
