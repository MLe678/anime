import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function MobileNav({ sessions }) {
  const [isVisible, setIsVisible] = useState(false);

  const handleShowClick = () => {
    setIsVisible(true);
  };

  const handleHideClick = () => {
    setIsVisible(false);
  };
  return <></>;
}
