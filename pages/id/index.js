import { aniListData } from "../../lib/anilist/AniList";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Content from "../../components/home/content";
import { useRouter } from "next/router";

import { motion } from "framer-motion";

import { useSession, signIn, signOut } from "next-auth/react";
import { useAniList } from "../../lib/anilist/useAnilist";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import SearchBar from "../../components/searchBar";
import Genres from "../../components/home/genres";
import { ToastContainer, toast, cssTransition } from "react-toastify";

export function Navigasi() {
  const { data: sessions, status } = useSession();
  const [year, setYear] = useState(new Date().getFullYear());
  const [season, setSeason] = useState(getCurrentSeason());

  const router = useRouter();

  const handleFormSubmission = (inputValue) => {
    router.push(`/id/search/${encodeURIComponent(inputValue)}`);
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
              href="/id/"
              className=" font-outfit lg:text-[40px] text-[30px] font-bold text-[#FF7F57]"
            >
              moopa
            </Link>
            <ul className="hidden items-center gap-10 pt-2 font-outfit text-[14px] lg:flex">
              <li>
                <Link
                  href={`/id/search/anime?season=${season}&seasonYear=${year}`}
                >
                  This Season
                </Link>
              </li>
              <li>
                <Link href="/id/search/manga">Manga</Link>
              </li>
              <li>
                <Link href="/id/search/anime">Anime</Link>
              </li>

              {status === "loading" ? (
                <li>Loading...</li>
              ) : (
                <>
                  {sessions && (
                    <li className="text-center">
                      <Link href={`/id/profile/${sessions?.user.name}`}>
                        My List
                      </Link>
                    </li>
                  )}
                </>
              )}
            </ul>
          </div>
          <div className="relative flex lg:scale-75 scale-[65%] items-center mb-7 lg:mb-0">
            <div className="search-box ">
              <input
                className="search-text"
                type="text"
                placeholder="Search Anime"
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

export default function Home({ detail, populars, sessions }) {
  const { media: current } = useAniList(sessions, { stats: "CURRENT" });
  const { media: plan } = useAniList(sessions, { stats: "PLANNING" });

  const [isVisible, setIsVisible] = useState(false);
  const [list, setList] = useState(null);
  const [planned, setPlanned] = useState(null);
  const [greeting, setGreeting] = useState("");
  const [onGoing, setOnGoing] = useState(null);

  const [prog, setProg] = useState(null);

  const popular = populars?.data;
  const data = detail.data[0];

  const handleShowClick = () => {
    setIsVisible(true);
  };

  const handleHideClick = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    const time = new Date().getHours();
    let greeting = "";

    if (time >= 5 && time < 12) {
      greeting = "Good morning";
    } else if (time >= 12 && time < 18) {
      greeting = "Good afternoon";
    } else if (time >= 18 && time < 22) {
      greeting = "Good evening";
    } else if (time >= 22 || time < 5) {
      greeting = "Good night";
    }

    setGreeting(greeting);

    async function userData() {
      if (!sessions) return;
      const getMedia =
        current.filter((item) => item.status === "CURRENT")[0] || null;
      const list = getMedia?.entries
        .map(({ media }) => media)
        .filter((media) => media);

      const prog = getMedia?.entries.filter(
        (item) => item.media.nextAiringEpisode !== null
      );

      setProg(prog);

      const planned = plan?.[0]?.entries
        .map(({ media }) => media)
        .filter((media) => media);

      const onGoing = list?.filter((item) => item.nextAiringEpisode !== null);
      setOnGoing(onGoing);

      if (list) {
        setList(list.reverse());
      }
      if (planned) {
        setPlanned(planned.reverse());
      }
    }
    userData();
  }, [sessions, current, plan]);

  const blurSlide = cssTransition({
    enter: "slide-in-blurred-right",
    exit: "slide-out-blurred-right",
  });

  useEffect(() => {
    function Toast() {
      toast.warn(
        "This site is still in development, some features may not work properly.",
        {
          position: "bottom-right",
          autoClose: false,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
          transition: blurSlide,
        }
      );
    }
    Toast();
  }, []);

  // console.log(log);

  return (
    <>
      <Head>
        <title>Anime</title>
        <meta charSet="UTF-8"></meta>
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Anime and Manga Streaming" />
        <meta name="twitter:description" content="Anime and Manga" />
        <meta
          name="twitter:image"
          content="https://cdn.discordapp.com/attachments/1084446049986420786/1093300833422168094/image.png"
        />
        <link rel="icon" href="/c.svg" />
      </Head>

      <ToastContainer pauseOnFocusLoss={false} style={{ width: "420px" }} />

      {/* NAVBAR */}
      <div className="z-50">
        {!isVisible && (
          <button
            onClick={handleShowClick}
            className="fixed bottom-[30px] right-[20px] z-[100] flex h-[51px] w-[50px] cursor-pointer items-center justify-center rounded-[8px] bg-[#17171f] shadow-lg lg:hidden"
            id="bars"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-[42px] w-[61.5px] text-[#8BA0B2] fill-orange-500"
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
      </div>

      {/* Mobile Menu */}
      <div className={`transition-all duration-150 subpixel-antialiased z-50`}>
        {isVisible && (
          <div className="fixed bottom-[30px] right-[20px] z-50 flex h-[51px] w-[300px] items-center justify-center gap-8 rounded-[8px] text-[11px] bg-[#17171f] shadow-lg lg:hidden">
            <div className="grid grid-cols-4 place-items-center gap-6">
              <button className="group flex flex-col items-center">
                <Link href="/id/" className="">
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
                  href="/id/"
                  className="font-karla font-bold text-[#8BA0B2] group-hover:text-action"
                >
                  home
                </Link>
              </button>

              <button className="group flex gap-[1.5px] flex-col items-center ">
                <div>
                  <Link href="/id/search/anime">
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
                  href="/id/search/anime"
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
                className="fill-orange-500"
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

      <div className="h-auto w-screen bg-[#141519] text-[#dbdcdd] ">
        <Navigasi />
        <SearchBar />
        {/* PC / TABLET */}

        <div className="lg:mt-16 mt-5 flex flex-col items-center">
          <motion.div
            className="w-screen flex-none lg:w-[87%]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, staggerChildren: 0.2 }} // Add staggerChildren prop
          >
            {/* SECTION 3 */}
            {detail && (
              <motion.div // Add motion.div to each child component
                key="trendingAnime"
                initial={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.5 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
              >
                <Content
                  ids="trendingAnime"
                  section="Trending Now"
                  data={detail.data}
                />
              </motion.div>
            )}

            {/* SECTION 4 */}
            {popular && (
              <motion.div // Add motion.div to each child component
                key="popularAnime"
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Content
                  ids="popularAnime"
                  section="Popular Anime"
                  data={popular}
                />
              </motion.div>
            )}

            <motion.div // Add motion.div to each child component
              key="Genres"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Genres />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  const trendingDetail = await aniListData({
    sort: "TRENDING_DESC",
    page: 1,
  });
  const popularDetail = await aniListData({
    sort: "POPULARITY_DESC",
    page: 1,
  });
  const genreDetail = await aniListData({ sort: "TYPE", page: 1 });

  return {
    props: {
      genre: genreDetail.props,
      detail: trendingDetail.props,
      populars: popularDetail.props,
      sessions: session,
    },
  };
}

function getCurrentSeason() {
  const now = new Date();
  const month = now.getMonth() + 1; // getMonth() returns 0-based index

  switch (month) {
    case 12:
    case 1:
    case 2:
      return "WINTER";
    case 3:
    case 4:
    case 5:
      return "SPRING";
    case 6:
    case 7:
    case 8:
      return "SUMMER";
    case 9:
    case 10:
    case 11:
      return "FALL";
    default:
      return "UNKNOWN SEASON";
  }
}
