import { CURATED_ARTISTS, CURATED_FEATURED_SONGS } from '../api/sources';
import { musicBrainzApi } from '../api/musicbrainz';
import { jioSaavnApi } from '../api/jiosaavn';
import { itunesApi } from '../api/itunes';
import { youtubeApi } from '../api/youtube';
import { Artist } from '../types/artist';
import { Song } from '../types/music';

export const artistApi = {
  async getAllArtists(): Promise<Artist[]> {
    try {
      const [saavnArtists, itunesArtists] = await Promise.all([
        jioSaavnApi.searchArtists('Anirudh AR Rahman Arijit Singh Diljit Coldplay Taylor Swift', 20),
        itunesApi.searchArtists('Top Artists', 10)
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

        const songs: Song[] = [];
        const seen = new Set<string>();
        for (const s of [...liveSaavn, ...liveYt, ...liveItunes]) {
          if (s.audioUrl && !seen.has(s.id)) {
            seen.add(s.id);
            songs.push(s);
          }
        }

        const fallbackSongs = CURATED_FEATURED_SONGS.filter((s) => s.artistId === artistId);
        const finalSongs = songs.length > 0 ? songs : fallbackSongs;

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

      const songs: Song[] = [];
      const seen = new Set<string>();
      for (const s of [...saavnSongs, ...liveYt, ...itunesSongs]) {
        if (s.audioUrl && !seen.has(s.id)) {
          seen.add(s.id);
          songs.push(s);
        }
      }

      const primaryArtistName = songs[0]?.artistName || cleanName;
      const primaryImage =
        songs[0]?.coverUrl ||
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';

      return {
        id: artistId,
        name: primaryArtistName,
        imageUrl: primaryImage,
        genres: mbData?.genres?.length ? mbData.genres : ['Music', 'Vocal'],
        bio: mbData?.bio || `${primaryArtistName} - Popular recording artist and composer.`,
        topTracks: songs,
        albumCount: 6
      };
    } catch (err) {
      console.warn('[artistApi] getArtistById error:', err);
      return null;
    }
  }
};
