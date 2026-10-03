import { CURATED_ARTISTS, CURATED_FEATURED_SONGS } from '../client-api/sources';
import { musicBrainzApi } from '../client-api/musicbrainz';
import { jioSaavnApi } from '../client-api/jiosaavn';
import { itunesApi } from '../client-api/itunes';
import { youtubeApi } from '../client-api/youtube';
import { Artist } from '../types/artist';
import { Song } from '../types/music';
import { getArtistImage, isValidImage } from '../constants/artistImages';

export const artistApi = {
  async getAllArtists(): Promise<Artist[]> {
    try {
      const map = new Map<string, Artist>();
      for (const a of CURATED_ARTISTS) {
        const key = a.name.toLowerCase().trim();
        map.set(key, {
          ...a,
          imageUrl: getArtistImage(a.name, a.imageUrl)
        });
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

        // Guarantee at least 20-35 songs for curated artists
        if (songs.length < 20) {
          try {
            const extra = await jioSaavnApi.searchSongs(`${artist.name} hits`, 35);
            for (const s of extra) {
              if (isFullSong(s) && !seen.has(s.id)) {
                seen.add(s.id);
                songs.push(s);
              }
              if (songs.length >= 35) break;
            }
          } catch {
            // ignore
          }
        }

        const finalSongs = songs.length > 0 ? songs : matchingCurated;

        return {
          ...artist,
          imageUrl: getArtistImage(artist.name, artist.imageUrl),
          bio: mbData?.bio || artist.bio,
          genres: mbData?.genres?.length ? mbData.genres : artist.genres,
          topTracks: finalSongs,
          albumCount: 8
        };
      } catch {
        const songs = CURATED_FEATURED_SONGS.filter((s) => s.artistId === artistId);
        return {
          ...artist,
          imageUrl: getArtistImage(artist.name, artist.imageUrl),
          topTracks: songs,
          albumCount: 5
        };
      }
    }

    // Dynamic Artist query (JioSaavn, YouTube, or iTunes)
    try {
      const cleanName = decodeURIComponent(
        artistId
          .replace(/^(aura_artist_|saavn_artist_|itunes_artist_|yt_channel_)/, '')
          .replace(/_/g, ' ')
      );

      const [saavnSongs, liveYt, itunesSongs, mbData, saavnArtists] = await Promise.all([
        jioSaavnApi.searchSongs(cleanName, 35),
        youtubeApi.searchSongs(`${cleanName} hits`, 15),
        itunesApi.searchSongs(cleanName, 15),
        musicBrainzApi.getArtistDetails(cleanName),
        jioSaavnApi.searchArtists(cleanName, 1).catch(() => [])
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

      // Guarantee at least 20-35 songs for dynamic artists
      if (songs.length < 20) {
        try {
          const extra = await jioSaavnApi.searchSongs(`${cleanName} top songs`, 35);
          for (const s of extra) {
            if (isFullSong(s) && !seen.has(s.id)) {
              seen.add(s.id);
              songs.push(s);
            }
            if (songs.length >= 35) break;
          }
        } catch {
          // ignore
        }
      }

      const finalSongs = songs.length > 0 ? songs : matchingCurated;
      const primaryArtistName = finalSongs[0]?.artistName || cleanName;

      // Always resolve genuine artist portrait (never song cover)
      let primaryImage = getArtistImage(primaryArtistName);
      if (!isValidImage(primaryImage) && saavnArtists.length > 0 && isValidImage(saavnArtists[0].imageUrl)) {
        primaryImage = saavnArtists[0].imageUrl;
      }

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
