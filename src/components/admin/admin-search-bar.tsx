"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { useRef, useTransition } from "react";

interface Props {
  placeholder?: string;
  paramKey?:    string;
}

export function AdminSearchBar({ placeholder = "Rechercher…", paramKey = "search" }: Props) {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams= useSearchParams();
  const [pending, startTransition] = useTransition();
  const inputRef    = useRef<HTMLInputElement>(null);
  const current     = searchParams.get(paramKey) ?? "";

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(paramKey, value);
    else params.delete(paramKey);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="relative flex-1 max-w-sm">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
      <input
        ref={inputRef}
        defaultValue={current}
        placeholder={placeholder}
        onChange={e => handleSearch(e.target.value)}
        className="w-full h-10 pl-9 pr-8 bg-white/8 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/30 font-inter focus:outline-none focus:border-primary transition-colors"
      />
      {current && (
        <button
          onClick={() => { handleSearch(""); if (inputRef.current) inputRef.current.value = ""; }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
          <X size={13} />
        </button>
      )}
    </div>
  );
}
