import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Watch our skaters in action. Browse photos and videos from Smart Wheels Skating Academy training sessions, competitions, and award ceremonies.',
  openGraph: {
    title: 'Smart Wheels Gallery — Skaters in Action',
    description: 'Photos and videos from our training sessions, competitions, and the Guinness World Record ceremony.',
    url: 'https://smartwheelsacademy.com/gallery',
  },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
