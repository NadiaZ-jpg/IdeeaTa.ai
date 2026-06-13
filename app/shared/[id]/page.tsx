import { redirect } from 'next/navigation';

export default async function SharedRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/?sharedId=${id}`);
}
