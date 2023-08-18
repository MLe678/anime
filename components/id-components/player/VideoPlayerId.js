import Player from "./Artplayer";
import { useEffect, useState } from "react";
import { useAniList } from "../../../lib/anilist/useAnilist";

export default function VideoPlayerId({
  data,
  id,
  progress,
  session,
  aniId,
  stats,
  title,
  poster,
}) {
  const [url, setUrl] = useState("");
  const [source, setSource] = useState([]);
  const { markProgress } = useAniList(session);

  const [resolution, setResolution] = useState("auto");

  useEffect(() => {
    const resol = localStorage.getItem("quality");
    if (resol) {
      setResolution(resol);
    }

    async function compiler() {
      try {
        const source = data.map((i) => {
          return {
            url: `${i.episode}`,
            html: `${i.size}p`,
          };
        });

        const defSource = source.find(
          (i) =>
            i?.html === "1080p" ||
            i?.html === "720p" ||
            i?.html === "480p" ||
            i?.html === "360p"
        );

        if (defSource) {
          setUrl(defSource.url);
        }

        setSource(source);
      } catch (error) {
        console.error(error);
      }
    }
    compiler();
  }, [data, resolution]);

  return (
    <>
      {url && (
        <Player
          key={`${url}`}
          option={{
            url: `${url}`,
            quality: source,
            title: `${title}`,
            autoplay: true,
            screenshot: true,
            poster: poster ? poster : "",
          }}
          res={resolution}
          quality={source}
          style={{
            width: "100%",
            height: "100%",
            margin: "0 auto 0",
          }}
          getInstance={(art) => {
            art.on("ready", () => {
              const seek = art.storage.get(id);
              const seekTime = seek?.time || 0;
              const duration = art.duration;
              const percentage = seekTime / duration;

              if (percentage >= 0.9) {
                art.currentTime = 0;
                console.log("Video started from the beginning");
              } else {
                art.currentTime = seekTime;
              }
            });

            art.on("video:timeupdate", () => {
              if (!session) return;
              const mediaSession = navigator.mediaSession;
              const currentTime = art.currentTime;
              const duration = art.duration;
              const percentage = currentTime / duration;

              mediaSession.setPositionState({
                duration: art.duration,
                position: art.currentTime,
              });

              if (percentage >= 0.9) {
                // use >= instead of >
                markProgress(aniId, progress, stats);
                art.off("video:timeupdate");
                console.log("Video progress marked");
              }
            });

            art.on("video:timeupdate", () => {
              var currentTime = art.currentTime;
              // console.log(art.currentTime);
              art.storage.set(id, {
                time: art.currentTime,
                duration: art.duration,
              });
            });
          }}
        />
      )}
    </>
  );
}
