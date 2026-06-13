import { redirect } from 'next/navigation';

export default function SharedRedirect({ params }: { params: { id: string } }) {
  redirect(`/start?sharedId=${params.id}`);
}
