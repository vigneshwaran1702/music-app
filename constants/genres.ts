export interface Genre {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const GENRES: Genre[] = [
  { id: 'pop', name: 'Pop', icon: 'musical-notes', color: '#ec4899' },
  { id: 'electronic', name: 'Electronic / EDM', icon: 'flash', color: '#06b6d4' },
  { id: 'rock', name: 'Rock & Metal', icon: 'flame', color: '#ef4444' },
  { id: 'hiphop', name: 'Hip-Hop & Rap', icon: 'mic', color: '#f59e0b' },
  { id: 'ambient', name: 'Chill & Ambient', icon: 'moon', color: '#8b5cf6' },
  { id: 'jazz', name: 'Jazz & Blues', icon: 'wine', color: '#10b981' },
  { id: 'classical', name: 'Classical', icon: 'book', color: '#6366f1' },
  { id: 'acoustic', name: 'Acoustic & Folk', icon: 'leaf', color: '#14b8a6' },
  { id: 'soundtrack', name: 'Cinematic & OST', icon: 'film', color: '#d946ef' },
  { id: 'lofi', name: 'Lo-Fi Beats', icon: 'headset', color: '#3b82f6' }
];
