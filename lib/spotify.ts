"use server";

export interface SpotifyCurrentPlayingResponse {
  timestamp: number;
  progress_ms: number;
  is_playing: boolean;
  item: {
    name: string;
    preview_url: string;
    artists: {
      name: string;
    }[];
    images: {
      height: number;
      width: number;
      url: string;
    }[];
    external_urls: {
      spotify: string;
    };
  };
}
async function getSpotifyAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${clientId}&client_secret=${clientSecret}`,
  });

  const response = await result.json();

  return response;
}

export async function getSpotifyCurrentPlaying() {
  const accessToken = await getSpotifyAccessToken();

  const result = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: {
        Authorization: `Bearer ${accessToken.access_token}`,
      },
      next: { revalidate: 600 },
    }
  );

  const response = await result.json();

  return response as SpotifyCurrentPlayingResponse;
}
