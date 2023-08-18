## For Local Development

1. Clone this repository using :

```bash
git clone this repo
```

2. Install package using npm :

```bash
npm install
```

3. Generate Prisma :

```bash
npx prisma generate
```

4. Create `.env` file in the root folder and put this inside the file :

```bash
## AniList
CLIENT_ID="get the id from here https://anilist.co/settings/developer"
CLIENT_SECRET="get the secret from here https://anilist.co/settings/developer"
GRAPHQL_ENDPOINT="https://graphql.anilist.co"

## NextAuth
NEXTAUTH_SECRET='run this cmd in your bash terminal (openssl rand -base64 32) with no bracket, and paste it here'
NEXTAUTH_URL="for development use http://localhost:3000/ and for production use your domain url"

## NextJS
PROXY_URI="I recommend you to use this cors-anywhere as a proxy https://github.com/Rob--W/cors-anywhere follow the instruction on how to use it there. Skip this if you only use gogoanime as a source"
API_URI="host your own API from this repo https://github.com/consumet/api.consumet.org. Don't put / at the end of the url."
API_KEY="this API key is used for schedules and manga page. get the key from https://anify.tv/discord"
DISQUS_SHORTNAME='put your disqus shortname here. (optional)'

## Prisma
DATABASE_URL="Your postgresql connection url"
```

5. Add this endpoint as Redirect Url on AniList Developer :

```bash
https://your-website-url/api/auth/callback/AniListProvider
```

6. Start local server :

```bash
npm run dev
```

## Credits

- [Consumet API](https://github.com/consumet/api.consumet.org) for anime sources
- [AniList API](https://github.com/AniList/ApiV2-GraphQL-Docs) for anime details source
- [Anify API](https://anify.tv/discord) for manga sources

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
