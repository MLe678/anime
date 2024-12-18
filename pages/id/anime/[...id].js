import Skeleton from "react-loading-skeleton";

import {
  ChevronDownIcon,
  ClockIcon,
  HeartIcon,
} from "@heroicons/react/20/solid";
import {
  TvIcon,
  ArrowTrendingUpIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/outline";

import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Layout from "../../../components/layout";
import Link from "next/link";
import Content from "../../../components/home/content";
import Modal from "../../../components/modal";

import { signIn, useSession } from "next-auth/react";
import AniList from "../../../components/media/aniList";
import ListEditor from "../../../components/listEditor";

import { GET_MEDIA_USER } from "../../../queries";
import { GET_MEDIA_INFO } from "../../../queries";
import { closestMatch } from "closest-match";

// import { aniInfo } from "../../components/devComp/data";
// console.log(GET_MEDIA_USER);

export default function Info({ info, color, api }) {
  // Episodes dropdown
  const [firstEpisodeIndex, setFirstEpisodeIndex] = useState(0);
  const [lastEpisodeIndex, setLastEpisodeIndex] = useState();
  const [selectedRange, setSelectedRange] = useState("All");
  function onEpisodeIndexChange(e) {
    if (e.target.value === "All") {
      setFirstEpisodeIndex(0);
      setLastEpisodeIndex();
      setSelectedRange("All");
      return;
    }
    setFirstEpisodeIndex(e.target.value.split("-")[0] - 1);
    setLastEpisodeIndex(e.target.value.split("-")[1]);
    setSelectedRange(e.target.value);
  }

  const { data: session } = useSession();
  const [episode, setEpisode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statuses, setStatuses] = useState(null);
  const [domainUrl, setDomainUrl] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(0);
  const { id } = useRouter().query;

  const [fetchFailed, setFetchFailed] = useState(false);
  const failedAttempts = useRef(0);

  const [artStorage, setArtStorage] = useState(null);

  const rec = info?.recommendations?.nodes?.map(
    (data) => data.mediaRecommendation
  );

  const [log, setLog] = useState();

  //for episodes dropdown
  useEffect(() => {
    setFirstEpisodeIndex(0);
    setLastEpisodeIndex();
    setSelectedRange("All");
  }, [info]);

  useEffect(() => {
    handleClose();
    async function fetchData() {
      setLoading(true);
      if (id) {
        const { protocol, host } = window.location;
        const url = `${protocol}//${host}`;

        setDomainUrl(url);

        setArtStorage(JSON.parse(localStorage.getItem("artplayer_settings")));

        setEpisode(null);
        setProgress(0);
        setStatuses(null);

        try {
          const res1 = await Promise.race([
            fetch(
              `https://ani-indo.vercel.app/get/search?q=${encodeURIComponent(
                info.title.romaji
              )}`
            ),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("timeout")), 10000)
            ),
          ]);

          const data1 = await res1.json();
          if (data1.data.length === 0) {
            let text = info.title.romaji;
            let words = text.split(" ");
            let firstTwoWords = words.slice(0, 2).join(" ");

            setLog(firstTwoWords);
            const anotherRes = await Promise.race([
              fetch(
                `https://ani-indo.vercel.app/get/search?q=${firstTwoWords}`
              ),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error("timeout")), 10000)
              ),
            ]);
            const fallbackData = await anotherRes.json();

            const title = fallbackData.data.map((i) => i.title);
            const match = closestMatch(info.title.romaji, title);
            if (match) {
              const getAnime = fallbackData.data.find((i) => i.title === match);
              const res2 = await fetch(
                `https://ani-indo.vercel.app/get/info/${getAnime.animeId}`
              );
              const data2 = await res2.json();
              if (data2.status === "success") {
                setEpisode(data2.data[0].episode);
              }
              // setLog(data2);
            } else {
              setLoading(false);
            }
          }
          if (data1.status === "success") {
            const title = data1.data.map((i) => i.title);
            const match = closestMatch(info.title.romaji, title);
            if (match) {
              const getAnime = data1.data.find((i) => i.title === match);
              const res2 = await fetch(
                `https://ani-indo.vercel.app/get/info/${getAnime.animeId}`
              );
              const data2 = await res2.json();
              if (data2.status === "success") {
                setEpisode(data2.data[0].episode);
              }
              // setLog(data2);
            } else {
              setLoading(false);
            }
            // setLog(match);
          }
          // setLog(data1);

          if (session?.user?.name) {
            const response = await fetch("https://graphql.anilist.co/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                query: GET_MEDIA_USER,
                variables: {
                  username: session?.user?.name,
                },
              }),
            });

            const responseData = await response.json();

            const prog = responseData?.data?.MediaListCollection;

            if (prog && prog.lists.length > 0) {
              const gut = prog.lists
                .flatMap((item) => item.entries)
                .find((item) => item.mediaId === parseInt(id[0]));

              if (gut) {
                setProgress(gut.progress);
                const statusMapping = {
                  CURRENT: { name: "Watching", value: "CURRENT" },
                  PLANNING: { name: "Plan to watch", value: "PLANNING" },
                  COMPLETED: { name: "Completed", value: "COMPLETED" },
                  DROPPED: { name: "Dropped", value: "DROPPED" },
                  PAUSED: { name: "Paused", value: "PAUSED" },
                  REPEATING: { name: "Rewatching", value: "REPEATING" },
                };
                setStatuses(statusMapping[gut.status]);
              }
            }
            setLoading(false);
          }

          if (info.nextAiringEpisode) {
            setTime(
              convertSecondsToTime(info.nextAiringEpisode.timeUntilAiring)
            );
          }
        } catch (error) {
          if (error.message === "timeout") {
            const currentAttempts =
              parseInt(localStorage.getItem("failedAttempts") || "0", 10) + 1;
            localStorage.setItem("failedAttempts", currentAttempts.toString());

            if (currentAttempts < 3) {
              window.location.reload();
            } else {
              localStorage.removeItem("failedAttempts");
              setFetchFailed(true);
            }
          } else {
            console.error(error);
          }
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [id, info, session?.user?.name]);

  function handleOpen() {
    setOpen(true);
    document.body.style.overflow = "hidden";
  }

  function handleClose() {
    setOpen(false);
    document.body.style.overflow = "auto";
  }

  return (
    <>
      <Head>
        <title>
          {info
            ? info?.title?.romaji || info?.title?.english
            : "Retrieving Data..."}
        </title>
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`anime678 - ${info.title.romaji || info.title.english}`}
        />
        <meta
          name="twitter:description"
          content={`${info.description?.slice(0, 180)}...`}
        />
        <meta
          name="twitter:image"
          content={`${domainUrl}/api/og?title=${
            info.title.romaji || info.title.english
          }&image=${info.bannerImage || info.coverImage.extraLarge}`}
        />
      </Head>
      <Modal open={open} onClose={() => handleClose()}>
        <div>
          {!session && (
            <div className="flex-center flex-col gap-5 px-10 py-5 bg-secondary rounded-md">
              <h1 className="text-md font-extrabold font-karla">
                Edit your list
              </h1>
              <button
                className="flex items-center bg-[#363642] rounded-md text-white p-1"
                onClick={() => signIn("AniListProvider")}
              >
                <h1 className="px-1 font-bold font-karla">
                  Login with AniList
                </h1>
                <div className="scale-[60%] pb-[1px]">
                  <AniList />
                </div>
              </button>
            </div>
          )}
          {session && info && (
            <ListEditor
              animeId={info?.id}
              session={session}
              stats={statuses}
              prg={progress}
              max={info?.episodes}
              image={info}
            />
          )}
        </div>
      </Modal>
      <Layout navTop="text-white bg-primary lg:pt-0 lg:px-0 bg-slate bg-opacity-40 z-50">
        <div className="w-screen min-h-screen relative flex flex-col items-center bg-primary gap-5">
          <div className="bg-image w-screen">
            <div className="bg-gradient-to-t from-primary from-10% to-transparent absolute h-[300px] w-screen z-10 inset-0" />
            {info ? (
              <Image
                src={
                  info?.bannerImage ||
                  info?.coverImage?.extraLarge ||
                  info?.coverImage.large
                }
                priority={true}
                alt="banner anime"
                height={1000}
                width={1000}
                className="object-cover bg-image w-screen absolute top-0 left-0 h-[300px] brightness-[70%] z-0"
              />
            ) : (
              <div className="bg-image w-screen absolute top-0 left-0 h-[300px]" />
            )}
          </div>
          <div className="lg:w-[90%] xl:w-[75%] lg:pt-[10rem] z-30 flex flex-col gap-5">
            {/* Mobile */}

            <div className="lg:hidden pt-5 w-screen px-5 flex flex-col">
              <div className="h-[250px] flex flex-col gap-1 justify-center">
                <h1 className="font-karla font-extrabold text-lg line-clamp-1 w-[70%]">
                  {info?.title?.romaji || info?.title?.english}
                </h1>
                <p
                  className="line-clamp-2 text-sm font-light antialiased w-[56%]"
                  dangerouslySetInnerHTML={{ __html: info?.description }}
                />
                <div className="font-light flex gap-1 py-1 flex-wrap font-outfit text-[10px] text-[#ffffff] w-[70%]">
                  {info?.genres
                    ?.slice(
                      0,
                      info?.genres?.length > 3 ? info?.genres?.length : 3
                    )
                    .map((item, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-secondary shadow-lg font-outfit font-light rounded-full"
                      >
                        <span className="">{item}</span>
                      </span>
                    ))}
                </div>
              </div>
              <div className="bg-secondary rounded-sm xs:h-[30px]">
                <div className="grid grid-cols-3 place-content-center xxs:flex  items-center justify-center h-full xxs:gap-10 p-2 text-sm">
                  {info && info.status !== "NOT_YET_RELEASED" ? (
                    <>
                      <div className="flex-center flex-col xxs:flex-row gap-2">
                        <TvIcon className="w-5 h-5 text-action" />
                        <h4 className="font-karla">{info?.type}</h4>
                      </div>
                      <div className="flex-center flex-col xxs:flex-row gap-2">
                        <ArrowTrendingUpIcon className="w-5 h-5 text-action" />
                        <h4>{info?.averageScore}%</h4>
                      </div>
                      <div className="flex-center flex-col xxs:flex-row gap-2">
                        <RectangleStackIcon className="w-5 h-5 text-action" />
                        {info?.episodes ? (
                          <h1>{info?.episodes} Episodes</h1>
                        ) : (
                          <h1>TBA</h1>
                        )}
                      </div>
                    </>
                  ) : (
                    <div>{info && "Not Yet Released"}</div>
                  )}
                </div>
              </div>
            </div>

            {/* PC */}
            <div className="hidden lg:flex gap-8 w-full flex-nowrap">
              <div className="shrink-0 lg:h-[250px] lg:w-[180px] w-[115px] h-[164px] relative"></div>

              {/* PC */}
              <div className="hidden lg:flex w-full flex-col gap-5 h-[250px]">
                <div className="flex flex-col gap-2">
                  <h1 className=" font-inter font-bold text-[36px] text-white line-clamp-1">
                    {info ? (
                      info?.title?.romaji || info?.title?.english
                    ) : (
                      <Skeleton width={450} />
                    )}
                  </h1>
                  {info ? (
                    <div className="flex gap-6">
                      {info?.episodes && (
                        <div
                          className={`dynamic-text rounded-md px-2 font-karla font-bold`}
                          style={color}
                        >
                          {info?.episodes} Episodes
                        </div>
                      )}
                      {info?.startDate?.year && (
                        <div
                          className={`dynamic-text rounded-md px-2 font-karla font-bold`}
                          style={color}
                        >
                          {info?.startDate?.year}
                        </div>
                      )}
                      {info?.averageScore && (
                        <div
                          className={`dynamic-text rounded-md px-2 font-karla font-bold`}
                          style={color}
                        >
                          {info?.averageScore}%
                        </div>
                      )}
                      {info?.type && (
                        <div
                          className={`dynamic-text rounded-md px-2 font-karla font-bold`}
                          style={color}
                        >
                          {info?.type}
                        </div>
                      )}
                      {info?.status && (
                        <div
                          className={`dynamic-text rounded-md px-2 font-karla font-bold`}
                          style={color}
                        >
                          {info?.status}
                        </div>
                      )}
                      <div
                        className={`dynamic-text rounded-md px-2 font-karla font-bold`}
                        style={color}
                      >
                        Sub | EN
                      </div>
                    </div>
                  ) : (
                    <Skeleton width={240} height={32} />
                  )}
                </div>
                {info ? (
                  <p
                    dangerouslySetInnerHTML={{ __html: info?.description }}
                    className="overflow-y-scroll scrollbar-thin pr-2  scrollbar-thumb-secondary scrollbar-thumb-rounded-lg h-[140px]"
                  />
                ) : (
                  <Skeleton className="h-[130px]" />
                )}
              </div>
            </div>

            <div>
              <div className="flex gap-5 items-center">
                {info?.relations?.edges?.length > 0 && (
                  <div className="p-3 lg:p-0 text-[20px] lg:text-2xl font-bold font-karla">
                    Relations
                  </div>
                )}
                {info?.relations?.edges?.length > 3 && (
                  <div
                    className="cursor-pointer"
                    onClick={() => setShowAll(!showAll)}
                  >
                    {showAll ? "show less" : "show more"}
                  </div>
                )}
              </div>
              <div
                className={`w-screen lg:w-full grid lg:grid-cols-3 justify-items-center gap-7 lg:pt-7 lg:pb-5 px-3 lg:px-4 pt-4 rounded-xl`}
              >
                {info?.relations?.edges ? (
                  info?.relations?.edges
                    .slice(0, showAll ? info?.relations?.edges.length : 3)
                    .map((r, index) => {
                      const rel = r.node;
                      return (
                        <Link
                          key={rel.id}
                          href={
                            rel.type === "ANIME" ||
                            rel.type === "OVA" ||
                            rel.type === "MOVIE" ||
                            rel.type === "SPECIAL" ||
                            rel.type === "ONA"
                              ? `/id/anime/${rel.id}`
                              : `/manga/detail/id?aniId=${
                                  rel.id
                                }&aniTitle=${encodeURIComponent(
                                  info?.title?.english ||
                                    info?.title.romaji ||
                                    info?.title.native
                                )}`
                          }
                          className={`hover:scale-[1.02] hover:shadow-lg lg:px-0 px-4 scale-100 transition-transform duration-200 ease-out w-full ${
                            rel.type === "MUSIC" ? "pointer-events-none" : ""
                          }`}
                        >
                          <div
                            key={rel.id}
                            className="w-full shrink h-[126px] bg-secondary flex rounded-md"
                          >
                            <div className="w-[90px] bg-image rounded-l-md shrink-0">
                              <Image
                                src={
                                  rel.coverImage.extraLarge ||
                                  rel.coverImage.large
                                }
                                alt={rel.id}
                                height={500}
                                width={500}
                                className="object-cover h-full w-full shrink-0 rounded-l-md"
                              />
                            </div>
                            <div className="h-full grid px-3 items-center">
                              <div className="text-action font-outfit font-bold">
                                {r.relationType}
                              </div>
                              <div className="font-outfit font-thin line-clamp-2">
                                {rel.title.userPreferred || rel.title.romaji}
                              </div>
                              <div className={``}>{rel.type}</div>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                ) : (
                  <>
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="w-full hidden lg:block">
                        <Skeleton className="h-[126px]" />
                      </div>
                    ))}
                    <div className="w-full lg:hidden">
                      <Skeleton className="h-[126px]" />
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-5 lg:gap-10 p-3 lg:p-0">
              <div className="flex lg:flex-row flex-col gap-5 lg:gap-0 justify-between ">
                <div className="flex justify-between">
                  <div className="flex items-center lg:gap-10 sm:gap-7 gap-3">
                    {info && (
                      <h1 className="text-[20px] lg:text-2xl font-bold font-karla">
                        Episodes
                      </h1>
                    )}
                    {info?.nextAiringEpisode && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-4 text-[10px] xxs:text-sm lg:text-base">
                          <h1>Next :</h1>
                          <div className="px-4 rounded-sm font-karla font-bold bg-white text-black">
                            {time}
                          </div>
                        </div>
                        <div className="h-6 w-6">
                          <ClockIcon />
                        </div>
                      </div>
                    )}
                  </div>
                  {episode?.length > 50 && (
                    <div
                      className="lg:hidden bg-secondary p-1 rounded-md cursor-pointer"
                      onClick={() => setVisible(!visible)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                {episode?.length > 50 && (
                  <div
                    className={`flex lg:flex items-center gap-0 lg:gap-5 justify-between ${
                      visible ? "" : "hidden"
                    }`}
                  >
                    <div className="flex items-end gap-3">
                      {episode?.length > 50 && (
                        <div className="relative flex gap-2 items-center">
                          <p className="hidden md:block">Episodes</p>
                          <select
                            onChange={onEpisodeIndexChange}
                            value={selectedRange}
                            className="flex items-center text-sm gap-5 rounded-[3px] bg-secondary py-1 px-3 pr-8 font-karla appearance-none cursor-pointer outline-none focus:ring-1 focus:ring-action scrollbar-thin scrollbar-thumb-secondary scrollbar-thumb-rounded-lg"
                          >
                            <option value="All">All</option>
                            {[...Array(Math.ceil(episode?.length / 50))].map(
                              (_, index) => {
                                const start = index * 50 + 1;
                                const end = Math.min(
                                  start + 50 - 1,
                                  episode?.length
                                );
                                const optionLabel = `${start} to ${end}`;
                                if (episode[0]?.number !== 1) {
                                  var valueLabel = `${
                                    episode.length - end + 1
                                  }-${episode.length - start + 1}`;
                                } else {
                                  var valueLabel = `${start}-${end}`;
                                }
                                return (
                                  <option key={valueLabel} value={valueLabel}>
                                    {optionLabel}
                                  </option>
                                );
                              }
                            )}
                          </select>
                          <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {!loading ? (
                Array.isArray(episode) ? (
                  episode && (
                    <div className="scrollbar-thin scrollbar-thumb-[#1b1c21] scrollbar-thumb-rounded-full overflow-y-scroll hover:scrollbar-thumb-[#2e2f37] h-[640px]">
                      {episode?.length !== 0 && episode ? (
                        <div
                          className={`flex flex-col gap-5 pb-5 pt-2 lg:pt-0`}
                        >
                          {episode
                            .slice(firstEpisodeIndex, lastEpisodeIndex)
                            .map((epi, index) => {
                              return (
                                <div
                                  key={index}
                                  className="flex flex-col gap-3 px-2"
                                >
                                  <Link
                                    href={`/id/anime/watch/${info.id}/${epi.episodeId}`}
                                    className={`text-start text-sm lg:text-lg ${
                                      progress && index <= progress - 1
                                        ? "text-[#5f5f5f]"
                                        : "text-white"
                                    }`}
                                  >
                                    <p>{epi.epsTitle}</p>
                                  </Link>
                                  {index !== episode?.length - 1 && (
                                    <span className="h-[1px] bg-white" />
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      ) : (
                        <p>No Episodes Available</p>
                      )}
                    </div>
                  )
                ) : (
                  <div className="flex flex-col">
                    <pre
                      className={`rounded-md overflow-hidden ${getLanguageClassName(
                        "bash"
                      )}`}
                    >
                      <code>
                        {episode?.message || "Anime tidak tersedia :/"}
                      </code>
                    </pre>
                  </div>
                )
              ) : (
                <div className="flex justify-center">
                  <div className="lds-ellipsis">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {info && rec?.length !== 0 && (
            <div className="w-screen lg:w-[90%] xl:w-[85%]">
              <Content
                ids="recommendAnime"
                section="Recommendations"
                data={rec}
              />
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.query;
  const API_URI = process.env.API_URI;

  const res = await fetch("https://graphql.anilist.co/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: GET_MEDIA_INFO,
      variables: {
        id: id?.[0],
      },
    }),
  });

  const json = await res.json();
  const data = json?.data?.Media;

  if (!data) {
    return {
      notFound: true,
    };
  }

  const textColor = setTxtColor(data?.coverImage?.color);

  const color = {
    backgroundColor: `${data?.coverImage?.color || "#ffff"}`,
    color: textColor,
  };

  return {
    props: {
      info: data,
      color: color,
      api: API_URI,
    },
  };
}

function convertSecondsToTime(sec) {
  let days = Math.floor(sec / (3600 * 24));
  let hours = Math.floor((sec % (3600 * 24)) / 3600);
  let minutes = Math.floor((sec % 3600) / 60);

  let time = "";

  if (days > 0) {
    time += `${days}d `;
  }

  if (hours > 0) {
    time += `${hours}h `;
  }

  if (minutes > 0) {
    time += `${minutes}m `;
  }

  return time.trim();
}

function getBrightness(hexColor) {
  if (!hexColor) {
    return 200;
  }
  const rgb = hexColor
    .match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
    .slice(1)
    .map((x) => parseInt(x, 16));
  return (299 * rgb[0] + 587 * rgb[1] + 114 * rgb[2]) / 1000;
}

function setTxtColor(hexColor) {
  const brightness = getBrightness(hexColor);
  return brightness < 150 ? "#fff" : "#000";
}

const getLanguageClassName = (language) => {
  switch (language) {
    case "javascript":
      return "language-javascript";
    case "html":
      return "language-html";
    case "bash":
      return "language-bash";
    // add more languages here as needed
    default:
      return "";
  }
};
