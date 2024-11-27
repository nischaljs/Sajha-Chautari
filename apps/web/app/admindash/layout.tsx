"use client";

import { useUserContextState } from "@/context/UserContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useUserContextState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
        console.log(user);
      if (user?.role !== "Admin") {
        router.push("/spaces");
      } else {
        setLoading(false); 
      }
    }
  }, [user, isLoading, router]);

  if (loading || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {children}
    </>
  );
}
