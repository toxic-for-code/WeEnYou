"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function HallsRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Build the query string from current params
    const params = searchParams.toString();
    router.replace(`/browse${params ? `?${params}` : ""}`);
  }, [router, searchParams]);

  return null;
} 