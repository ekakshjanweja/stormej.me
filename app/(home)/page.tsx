import SpotifyCurrentPlayingBadge from "@/components/spotify-currently-playing-badge";
import { BlogRow } from "./_components/blog-row";
import Hero from "./_components/hero";
import Section, { SectionType } from "@/components/section";
import { getSpotifyCurrentPlaying } from "@/lib/spotify";

export default async function Home() {
  const currentPlayingInfo = await getSpotifyCurrentPlaying();

  return (
    <div>
      <Hero />

      <Section sectionType={SectionType.work} />
      <Section sectionType={SectionType.project} />
      <BlogRow />
      <div className="mt-8">
        <SpotifyCurrentPlayingBadge
          title="Listening to"
          spotifyInfo={currentPlayingInfo}
        />
      </div>
    </div>
  );
}
