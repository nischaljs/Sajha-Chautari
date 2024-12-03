"use client"
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.push('/spaces');
  }, []);
  return <div className="text-black"></div>;
}
