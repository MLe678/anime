import { useEffect, useState } from "react";
import { useAniList } from "../../../../lib/anilist/useAnilist";
import Skeleton from "react-loading-skeleton";
import Image from "next/image";

export default function Details({
  info,
  session,
  epiNumber,
  description,
  id,
  onList,
  setOnList,
  handleOpen,
}) {
  const { markPlanning } = useAniList(session);
  const [url, setUrl] = useState(null);

  function handlePlan() {
    if (onList === false) {
      markPlanning(info.id);
      setOnList(true);
    }
  }

  useEffect(() => {
    const url = window.location.href;
    setUrl(url);
  }, [id]);

  return (
    <div className="flex flex-col gap-2">
      <div className="px-4 pt-7 pb-4 h-full flex">
        <div className="aspect-[9/13] h-[240px]">
          {info ? (
            <Image
              src={info.coverImage.extraLarge}
              alt="Anime Cover"
              width={1000}
              height={1000}
              priority
              className="object-cover aspect-[9/13] h-[240px] rounded-md"
            />
          ) : (
            <Skeleton height={240} />
          )}
        </div>
        <div
          className="grid w-full pl-5 gap-3 h-[240px]"
          data-episode={info?.episodes || "0"}
        >
          <div className="grid grid-cols-2 gap-1 items-center">
            <h2 className="text-sm font-light font-roboto text-[#878787]">
              Studios
            </h2>
            <div className="row-start-2">
              {info ? info.studios.edges[0].node.name : <Skeleton width={80} />}
            </div>
          </div>
          <div className="grid gap-1 items-center">
            <h2 className="text-sm font-light font-roboto text-[#878787]">
              Status
            </h2>
            <div>{info ? info.status : <Skeleton width={75} />}</div>
          </div>
          <div className="grid gap-1 items-center overflow-y-hidden">
            <h2 className="text-sm font-light font-roboto text-[#878787]">
              Titles
            </h2>
            <div className="grid grid-flow-dense grid-cols-2 gap-2 h-full w-full">
              {info ? (
                <>
                  <div className="title-rm line-clamp-3">
                    {info.title?.romaji || ""}
                  </div>
                  <div className="title-en line-clamp-3">
                    {info.title?.english || ""}
                  </div>
                  <div className="title-nt line-clamp-3">
                    {info.title?.native || ""}
                  </div>
                </>
              ) : (
                <Skeleton width={200} height={50} />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 px-4 pt-3">
        {info &&
          info.genres?.map((item, index) => (
            <div
              key={index}
              className="border border-action text-gray-100 py-1 px-2 rounded-md font-karla text-sm"
            >
              {item}
            </div>
          ))}
      </div>
      <div className={`bg-secondary rounded-md mt-3 mx-3`}>
        {info && (
          <p
            dangerouslySetInnerHTML={{ __html: description }}
            className={`p-5 text-sm font-light font-roboto text-[#e4e4e4] `}
          />
        )}
      </div>
    </div>
  );
}
