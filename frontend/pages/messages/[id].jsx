import { useRouter } from 'next/router';
import { useEffect } from 'react';

// Redirect to messages index with conversation ID
export default function ConversationPage() {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      router.replace(`/messages?id=${id}`);
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
