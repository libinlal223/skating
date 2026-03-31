import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Smart Wheels Skating Academy. Reach us by phone, email, or visit one of our branches. We\'d love to hear from you.',
  openGraph: {
    title: 'Contact Smart Wheels Skating Academy',
    description: 'Reach out to join Smart Wheels or ask about our skating programs. We\'re always happy to help.',
    url: 'https://smartwheelsacademy.com/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
