import { Metadata } from 'next';
import UserBioClient from './UserBioClient';

interface Props {
  params: Promise<{ username: string }>;
}

// Mendaftarkan username agar di-generate saat static export build
export async function generateStaticParams() {
  return [
    { username: 'aries' },
    { username: 'creator' },
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username} | Curiolot Link`,
    description: `Official bio link hub and creative profile of @${username}.`,
  };
}

export default function UserBioPage() {
  return <UserBioClient />;
}