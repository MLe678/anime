import { aniListData } from "../../lib/anilist/AniList";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Content from "../../components/home/content";

import { motion } from "framer-motion";

import { signOut } from "next-auth/react";
import { useAniList } from "../../lib/anilist/useAnilist";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import SearchBar from "../../components/searchBar";
import Genres from "../../components/home/genres";
import getUpcomingAnime from "../../lib/anilist/getUpcomingAnime";
import { useCountdown } from "../../utils/useCountdownSeconds";

import Navigasi from "../../components/home/staticNav";
import MobileNav from "../../components/home/mobileNav";
import axios from "axios";
import { createUser } from "../../prisma/user";

import { checkAdBlock } from "adblock-checker";
import { ToastContainer, toast } from "react-toastify";

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  try {
    if (session) {
      await createUser(session.user.name);
    }
  } catch (error) {
    console.error(error);
    // Handle the error here
  }

  const trendingDetail = await aniListData({
    sort: "TRENDING_DESC",
    page: 1,
  });
  const popularDetail = await aniListData({
    sort: "POPULARITY_DESC",
    page: 1,
  });
  const genreDetail = await aniListData({ sort: "TYPE", page: 1 });

  const upComing = await getUpcomingAnime();

  return {
    props: {
      genre: genreDetail.props,
      detail: trendingDetail.props,
      populars: popularDetail.props,
      sessions: session,
      upComing,
    },
  };
}

export default function Home({ detail, populars, sessions, upComing }) {
  const { media: current } = useAniList(sessions, { stats: "CURRENT" });
  const { media: plan } = useAniList(sessions, { stats: "PLANNING" });
  const { media: release } = useAniList(sessions);

  const [schedules, setSchedules] = useState(null);

  const [anime, setAnime] = useState([]);

  useEffect(() => {
    async function adBlock() {
      const ad = await checkAdBlock();
      if (ad) {
        toast.dark("Ad Block enabled", {
          position: "top-center",
          autoClose: false,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      }
    }
    adBlock();
  }, []);

  const update = () => {
    setAnime((prevAnime) => prevAnime.slice(1));
  };

  const [days, hours, minutes, seconds] = useCountdown(
    anime[0]?.nextAiringEpisode?.airingAt * 1000 || Date.now(),
    update
  );

  useEffect(() => {
    if (upComing && upComing.length > 0) {
      setAnime(upComing);
    }
  }, [upComing]);

  useEffect(() => {
    const getSchedule = async () => {
      const { data } = await axios.get(`/api/anify/schedule`);
      setSchedules(data);
    };
    getSchedule();
  }, []);

  const [releaseData, setReleaseData] = useState([]);

  useEffect(() => {
    function getRelease() {
      let releasingAnime = [];
      let progress = [];
      release.map((list) => {
        list.entries.map((entry) => {
          if (entry.media.status === "RELEASING") {
            releasingAnime.push(entry.media);
          }

          progress.push(entry);
        });
      });
      setReleaseData(releasingAnime);
      setProg(progress);
    }
    getRelease();
  }, [release]);

  const [list, setList] = useState(null);
  const [planned, setPlanned] = useState(null);
  const [greeting, setGreeting] = useState("");
  const [user, setUser] = useState(null);

  // console.log({ user });

  const [prog, setProg] = useState(null);

  const popular = populars?.data;
  const data = detail.data[0];

  useEffect(() => {
    async function userData() {
      let data;
      try {
        if (sessions?.user?.name) {
          const res = await fetch(
            `/api/user/profile?name=${sessions.user.name}`
          );
          if (!res.ok) {
            switch (res.status) {
              case 404: {
                console.log("user not found");
                break;
              }
              case 500: {
                console.log("server error");
                break;
              }
              default: {
                console.log("unknown error");
                break;
              }
            }
          } else {
            data = await res.json();
            // Do something with the data
          }
        }
      } catch (error) {
        console.error(error);
        // Handle the error here
      }
      if (!data) {
        const dat = JSON.parse(localStorage.getItem("artplayer_settings"));
        if (dat) {
          const arr = Object.keys(dat).map((key) => dat[key]);
          const newFirst = arr?.sort((a, b) => {
            return new Date(b?.createdAt) - new Date(a?.createdAt);
          });
          setUser(newFirst);
        }
      } else {
        setUser(data?.WatchListEpisode);
      }
      // const data = await res.json();
    }
    userData();
  }, [sessions?.user?.name]);

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
      if (!sessions?.user?.name) return;

      const getMedia =
        current.filter((item) => item.status === "CURRENT")[0] || null;
      const list = getMedia?.entries
        .map(({ media }) => media)
        .filter((media) => media);

      const planned = plan?.[0]?.entries
        .map(({ media }) => media)
        .filter((media) => media);

      if (list) {
        setList(list.reverse());
      }
      if (planned) {
        setPlanned(planned.reverse());
      }
    }
    userData();
  }, [sessions?.user?.name, current, plan]);

  return (
    <>
      <Head>
        <title>Anime</title>
        <meta charSet="UTF-8"></meta>
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Anime and Manga Streaming" />
        <meta
          name="twitter:description"
          content="Free Anime and Manga Streaming"
        />
        <meta
          name="twitter:image"
          content="https://cdn.discordapp.com/attachments/1084446049986420786/1093300833422168094/image.png"
        />
        <link rel="icon" href="/c.svg" />
      </Head>

      <MobileNav sessions={sessions} />

      <div className="h-auto w-screen bg-[#141519] text-[#dbdcdd] ">
        <Navigasi />
        <SearchBar />
        <ToastContainer
          pauseOnFocusLoss={false}
          style={{
            width: "400px",
          }}
        />

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
