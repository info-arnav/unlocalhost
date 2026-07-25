import { GoogleAnalytics } from '@next/third-parties/google';

export function Analytics({ id }: { id: string | undefined }) {
  if (!id) return null;

  return <GoogleAnalytics gaId={id} />;
}
