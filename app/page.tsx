'use client';
import { useRouter } from 'next/navigation';
import * as React from 'react';

export default function Home() {
  const router = useRouter();
  
  React.useEffect(() => {
    router.push('/payloadShenanigans');
  }, [router]);

  return null;
}
