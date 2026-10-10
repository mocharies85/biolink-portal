import UserBioClient from './UserBioClient';

// Wajib untuk build statis Next.js di Cloudflare Pages
export function generateStaticParams() {
  return [
    { username: 'aries' },
  ];
}

export default function Page() {
  return <UserBioClient />;
}