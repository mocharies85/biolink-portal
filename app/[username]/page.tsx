import UserBioClient from './UserBioClient';

// Fungsi wajib untuk Next.js Static Export
export async function generateStaticParams() {
  return [
    { username: 'aries' },
    { username: 'curiolot' },
    { username: 'creator' },
  ];
}

export default function Page() {
  return <UserBioClient />;
}