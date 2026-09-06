import { CURATED_ARTISTS, CURATED_FEATURED_SONGS } from '../api/sources';
import { musicBrainzApi } from '../api/musicbrainz';
import { jioSaavnApi } from '../api/jiosaavn';
import { Artist } from '../types/artist';

export const artistApi = {
  async getAllArtists(): Promise<Artist[]> {
    try {
      const saavnArtists = await jioSaavnApi.searchArtists('Arijit Singh Coldplay Diljit Taylor Swift', 10);
      if (saavnArtists.length > 0) {
        return [...saavnArtists, ...CURATED_ARTISTS];
      }
      return CURATED_ARTISTS;
    } catch {
      return CURATED_ARTISTS;
    }
  },

  async getArtistById(artistId: string): Promise<Artist | null> {
    const artist = CURATED_ARTISTS.find((a) => a.id === artistId);
    if (artist) {
      const songs = CURATED_FEATURED_SONGS.filter((s) => s.artistId === artistId);
      const mbData = await musicBrainzApi.getArtistDetails(artist.name);

      return {
        ...artist,
        bio: mbData?.bio || artist.bio,
        genres: mbData?.genres?.length ? mbData.genres : artist.genres,
        topTracks: songs,
        albumCount: 2
      };
    }

    // JioSaavn artist query
    try {
      const cleanName = artistId.replace('saavn_artist_', '');
      const saavnSongs = await jioSaavnApi.searchSongs(cleanName, 15);
      const mbData = await musicBrainzApi.getArtistDetails(cleanName);

      return {
        id: artistId,
        name: saavnSongs[0]?.artistName || cleanName,
        imageUrl: saavnSongs[0]?.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        genres: mbData?.genres?.length ? mbData.genres : ['Pop', 'Bollywood', 'Vocal'],
        bio: mbData?.bio || `${cleanName} - Top Trending Artist on JioSaavn & MusicBrainz`,
        topTracks: saavnSongs,
        albumCount: 4
      };
    } catch {
      return null;
    }
  }
};
