import Head from "next/head";
import Navbar from "../components/navbar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { parseCookies } from "nookies";

export default function Custom404() {
  const [lang, setLang] = useState("en");
  const [cookie, setCookies] = useState(null);

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
  return (
    <>
      <Head>
        <title>Not Found</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/c.svg" />
      </Head>
      <Navbar className="bg-[#0c0d10]" />
      <div className="min-h-screen w-screen flex flex-col items-center justify-center ">
        <h1 className="text-2xl sm:text-4xl xl:text-6xl font-bold my-4">
          Page not found
        </h1>
        <Link href={`/${lang}/`}>
          <div className="bg-[#902020] xl:text-xl text-white font-bold py-2 px-4 rounded hover:bg-[#902020]">
            Go back home
          </div>
        </Link>
      </div>
    </>
  );
}
