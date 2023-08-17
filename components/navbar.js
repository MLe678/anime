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

        {/* Mobile Hamburger */}
        {!isVisible && (
          <button
            onClick={handleShowClick}
            className="fixed bottom-[30px] right-[20px] z-[100] flex h-[51px] w-[50px] cursor-pointer items-center justify-center rounded-[8px] bg-[#17171f] shadow-lg lg:hidden"
            id="bars"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-[42px] w-[61.5px] text-[#8BA0B2] fill-[#902020]-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}

        {/* Mobile Menu */}
        <div
          className={`transition-all duration-150 ${
            fade ? "opacity-100" : "opacity-0"
          } z-50`}
        >
          {isVisible && session && (
            <Link
              href={`/${lang}/profile/${session?.user?.name}`}
              className="fixed lg:hidden bottom-[100px] w-[60px] h-[60px] flex items-center justify-center right-[20px] rounded-full z-50 bg-[#17171f]"
            >
              <Image
                src={session?.user.image.large}
                alt="user avatar"
                height={500}
                width={500}
                className="object-cover w-[60px] h-[60px] rounded-full"
              />
            </Link>
          )}
          {isVisible && (
            <div className="fixed bottom-[30px] right-[20px] z-50 flex h-[51px] w-[300px] items-center justify-center gap-8 rounded-[8px] text-[11px] bg-[#17171f] shadow-lg lg:hidden">
              <div className="grid grid-cols-4 place-items-center gap-6">
                <button className="group flex flex-col items-center">
                  <Link href={`/${lang}/`} className="">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6 group-hover:stroke-action"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                      />
                    </svg>
                  </Link>
                  <Link
                    href={`/${lang}/`}
                    className="font-karla font-bold text-[#8BA0B2] group-hover:text-action"
                  >
                    home
                  </Link>
                </button>
                <button className="group flex gap-[1.5px] flex-col items-center ">
                  <div>
                    <Link href={`/${lang}/search/anime`}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 group-hover:stroke-action"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        />
                      </svg>
                    </Link>
                  </div>
                  <Link
                    href={`/${lang}/search/anime`}
                    className="font-karla font-bold text-[#8BA0B2] group-hover:text-action"
                  >
                    search
                  </Link>
                </button>
              </div>
              <button onClick={handleHideClick}>
                <svg
                  width="20"
                  height="21"
                  className="fill-[#902020]-500"
                  viewBox="0 0 20 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="2.44043"
                    y="0.941467"
                    width="23.5842"
                    height="3.45134"
                    rx="1.72567"
                    transform="rotate(45 2.44043 0.941467)"
                  />
                  <rect
                    x="19.1172"
                    y="3.38196"
                    width="23.5842"
                    height="3.45134"
                    rx="1.72567"
                    transform="rotate(135 19.1172 3.38196)"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        <nav className="left-0 top-[-100%] hidden w-auto items-center gap-10 px-5 lg:flex">
          <ul className="hidden gap-10 font-roboto text-md lg:flex items-center relative">
            <li>
              <Link
                href={`/${lang}/`}
                className="p-2 transition-all duration-100 hover:text-[#902020]-600"
              >
                home
              </Link>
            </li>
            <li>
              <Link
                href={`/${lang}/search/anime`}
                className="p-2 transition-all duration-100 hover:text-[#902020]-600"
              >
                search
              </Link>
            </li>
            {status === "loading" ? <li>Loading...</li> : <></>}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
