import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { parseCookies } from "nookies";

function Navbar(props) {
  const { data: session, status } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const [fade, setFade] = useState(false);

  const [lang, setLang] = useState("en");
  const [cookie, setCookies] = useState(null);

  const handleShowClick = () => {
    setIsVisible(true);
    setFade(true);
  };

  const handleHideClick = () => {
    setIsVisible(false);
    setFade(false);
  };

  useEffect(() => {
    let lang = null;
    if (!cookie) {
      const cookie = parseCookies();
      lang = cookie.lang || null;
      setCookies(cookie);
    }
    if (lang === "en" || lang === null) {
      setLang("en");
    } else if (lang === "id") {
      setLang("id");
    }
  }, []);

  // console.log(session.user?.image);

  return (
    <header className={`${props.className}`}>
      <div className="flex h-16 w-auto items-center justify-between px-5 lg:mx-auto lg:w-[80%] lg:px-0 text-[#dbdcdd]">
        <div className="pb-2 font-outfit text-4xl font-semibold lg:block text-[#902020]">
          <Link href={`/${lang}/`}>anime678</Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
