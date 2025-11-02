'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp } from 'lucide-react';

export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!show) return null;

  return (
    <Button
      variant="secondary"
      size="icon"
      className="fixed bottom-8 right-8 z-50 rounded-full shadow-lg"
      onClick={scrollToTop}
      title="回到顶部"
    >
      <ChevronUp className="h-5 w-5" />
    </Button>
  );
} 