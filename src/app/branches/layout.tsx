import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Branches',
  description: 'Find a Smart Wheels Skating Academy training center near you. We have branches across India with expert coaches and state-of-the-art skating facilities.',
  openGraph: {
    title: 'Smart Wheels Branches Across India',
    description: 'Find your nearest Smart Wheels skating center. Expert coaches, structured programs, and world-class facilities.',
    url: 'https://smartwheelsacademy.com/branches',
  },
};

export default function BranchesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
