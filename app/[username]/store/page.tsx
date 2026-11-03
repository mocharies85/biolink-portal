import { Metadata } from 'next';
import StoreClient from './StoreClient';

interface Props {
  params: Promise<{ username: string }>;
}

// Wajib untuk mode static export Next.js
export async function generateStaticParams() {
  return [
    { username: 'aries' },
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username}'s Digital Store | Curiolot`,
    description: `Browse and download digital assets, templates, and products by @${username}.`,
  };
}

export default async function StorePage({ params }: Props) {
  const { username } = await params;
  return <StoreClient username={username.toLowerCase()} />;
}