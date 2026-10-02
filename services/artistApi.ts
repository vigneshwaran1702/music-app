import { CURATED_ARTISTS, CURATED_FEATURED_SONGS } from '../client-api/sources';
import { musicBrainzApi } from '../client-api/musicbrainz';
import { jioSaavnApi } from '../client-api/jiosaavn';
import { itunesApi } from '../client-api/itunes';
import { youtubeApi } from '../client-api/youtube';
import { Artist } from '../types/artist';
import { Song } from '../types/music';

export const artistApi = {
  async getAllArtists(): Promise<Artist[]> {
    try {
      const [saavnArtists, itunesArtists] = await Promise.all([
        jioSaavnApi.searchArtists('Anirudh AR Rahman Arijit Singh Diljit Coldplay Taylor Swift', 25).catch(() => []),
        itunesApi.searchArtists('Top Artists 2024', 20).catch(() => [])
      ]);

      const map = new Map<string, Artist>();
      for (const a of [...CURATED_ARTISTS, ...saavnArtists, ...itunesArtists]) {
        const key = a.name.toLowerCase().trim();
        if (!map.has(key)) {
          map.set(key, a);
        }
      }
      return Array.from(map.values());
    } catch {
      return CURATED_ARTISTS;
    }
  },

  async getArtistById(artistId: string): Promise<Artist | null> {
    const artist = CURATED_ARTISTS.find((a) => a.id === artistId);
    if (artist) {
      try {
        const [liveSaavn, liveItunes, liveYt, mbData] = await Promise.all([
          jioSaavnApi.searchSongs(artist.name, 35),
          itunesApi.searchSongs(artist.name, 15),
          youtubeApi.searchSongs(`${artist.name} hits songs`, 15),
          musicBrainzApi.getArtistDetails(artist.name)
        ]);

        const isFullSong = (s: Song) =>
          Boolean(s.audioUrl) &&
          !s.audioUrl.includes('apple.com') &&
          !s.audioUrl.includes('AudioPreview') &&
          !s.audioUrl.includes('mzstatic');

        const matchingCurated = CURATED_FEATURED_SONGS.filter(
          (s) =>
            s.artistId === artistId ||
            s.artistName.toLowerCase().includes(artist.name.toLowerCase())
        );

        const songs: Song[] = [];
        const seen = new Set<string>();

        for (const s of [...matchingCurated, ...liveSaavn, ...liveYt]) {
          if (isFullSong(s) && !seen.has(s.id)) {
            seen.add(s.id);
            songs.push(s);
          }
        }

        const finalSongs = songs.length > 0 ? songs : matchingCurated;

        return {
          ...artist,
          bio: mbData?.bio || artist.bio,
          genres: mbData?.genres?.length ? mbData.genres : artist.genres,
          topTracks: finalSongs,
          albumCount: 8
        };
      } catch {
        const songs = CURATED_FEATURED_SONGS.filter((s) => s.artistId === artistId);
        return {
          ...artist,
          topTracks: songs,
          albumCount: 5
        };
      }
    }

    // Dynamic Artist query (JioSaavn, YouTube, or iTunes)
    try {
      const cleanName = decodeURIComponent(
        artistId
          .replace('saavn_artist_', '')
          .replace('itunes_artist_', '')
          .replace('yt_channel_', '')
          .replace(/_/g, ' ')
      );

      const [saavnSongs, liveYt, itunesSongs, mbData] = await Promise.all([
        jioSaavnApi.searchSongs(cleanName, 35),
        youtubeApi.searchSongs(`${cleanName} hits`, 15),
        itunesApi.searchSongs(cleanName, 15),
        musicBrainzApi.getArtistDetails(cleanName)
      ]);

      const matchingCurated = CURATED_FEATURED_SONGS.filter((s) =>
        s.artistName.toLowerCase().includes(cleanName.toLowerCase())
      );

      const isFullSong = (s: Song) =>
        Boolean(s.audioUrl) &&
        !s.audioUrl.includes('apple.com') &&
        !s.audioUrl.includes('AudioPreview') &&
        !s.audioUrl.includes('mzstatic');

      const songs: Song[] = [];
      const seen = new Set<string>();
      for (const s of [...matchingCurated, ...saavnSongs, ...liveYt]) {
        if (isFullSong(s) && !seen.has(s.id)) {
          seen.add(s.id);
          songs.push(s);
        }
      }

      const finalSongs = songs.length > 0 ? songs : matchingCurated;
      const primaryArtistName = finalSongs[0]?.artistName || cleanName;
      const primaryImage =
        finalSongs[0]?.coverUrl ||
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';

      return {
        id: artistId,
        name: primaryArtistName,
        imageUrl: primaryImage,
        genres: mbData?.genres?.length ? mbData.genres : ['Music', 'Vocal'],
        bio: mbData?.bio || `${primaryArtistName} - Popular recording artist and composer.`,
        topTracks: finalSongs,
        albumCount: 6
      };
    } catch (err) {
      console.warn('[artistApi] getArtistById error:', err);
      return null;
    }
  }
};
