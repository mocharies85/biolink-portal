import UserBioClient from './UserBioClient';

// Memenuhi syarat static build Next.js output: 'export'
export function generateStaticParams() {
  return [{ username: 'aries' }];
}

export default function Page() {
  return <UserBioClient />;
}