import UserBioClient from './UserBioClient';

// Wajib diekspor untuk next build dengan konfigurasi output: 'export'
export function generateStaticParams() {
  return [
    { username: 'aries' },
  ];
}

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }> | { username: string };
}) {
  const resolvedParams = await params;
  const username = resolvedParams?.username || 'aries';

  return <UserBioClient username={username} />;
}