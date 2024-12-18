import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getCurrentSeason } from "../../utils/getTimes";
import Link from "next/link";
import { parseCookies } from "nookies";

export default function Navigasi() {
  const { data: sessions, status } = useSession();
  const [year, setYear] = useState(new Date().getFullYear());
  const [season, setSeason] = useState(getCurrentSeason());

  const [lang, setLang] = useState("en");
  const [cookie, setCookies] = useState(null);

  const router = useRouter();

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

  const handleFormSubmission = (inputValue) => {
    router.push(`/${lang}/search/${encodeURIComponent(inputValue)}`);
  };

  const handleKeyDown = async (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const inputValue = event.target.value;
      handleFormSubmission(inputValue);
    }
  };
  return (
    <>
      {/* NAVBAR PC */}
      <div className="flex items-center justify-center">
        <div className="flex w-full items-center justify-between px-5 lg:mx-[94px]">
          <div className="flex items-center lg:gap-16 lg:pt-7">
            <Link
              href="/en/"
              className=" font-outfit lg:text-[40px] text-[30px] font-bold text-[#902020]"
            >
              anime678
            </Link>
            <ul className="hidden items-center gap-10 pt-2 font-outfit text-[14px] lg:flex">
              <li>
                <Link
                  href={`/en/search/anime?season=${season}&seasonYear=${year}`}
                >
                  Current Season
                </Link>
              </li>
              <li>
                <Link href="/en/search/anime">Anime</Link>
              </li>
              <li>
                <Link href="/en/search/manga">Manga</Link>
              </li>

              {status === "loading" ? <li>Loading...</li> : <></>}
            </ul>
          </div>
          <div className="relative flex lg:scale-75 scale-[65%] items-center mb-7 lg:mb-1">
            <div className="search-box ">
              <input
                className="search-text"
                type="text"
                placeholder="search..."
                onKeyDown={handleKeyDown}
              />
              <div className="search-btn">
                <i className="fas fa-search"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
