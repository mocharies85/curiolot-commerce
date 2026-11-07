"use client";

import { useParams } from "next/navigation";
import StoreView from "./StoreView";

export default function StorePage() {
  const params = useParams() as any;
  const username = (params?.username as string) || "aries";

  return <StoreView username={username} />;
}