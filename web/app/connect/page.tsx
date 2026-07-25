import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth-shell';
import { ConnectForm } from './connect-form';

export const metadata: Metadata = {
  title: 'Connect your agent',
  robots: { index: false, follow: false },
};

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const params = await searchParams;
  const initial = (params.code ?? '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();

  return (
    <AuthShell
      title="Connect your coding agent"
      blurb="Enter the code your agent is showing, and this device is signed in for good."
      foot="This approves one agent on one machine. You can revoke it later."
    >
      <ConnectForm initialCode={initial} />
    </AuthShell>
  );
}
