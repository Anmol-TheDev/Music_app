// Shared application-wide types

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export interface ImageResource {
  url: string;
  // width/height often present in API responses
  width?: number;
  height?: number;
}

export interface ArtistSummary {
  id: string;
  name: string;
  image?: ImageResource[] | ImageResource | null;
  perma_url?: string;
}

export interface AlbumSummary {
  id: string;
  name: string;
  year?: string | number;
  image?: ImageResource[] | ImageResource | null;
}

export interface Song {
  id: string;
  name: string;
  image?: ImageResource[] | ImageResource | null;
  duration?: number;
  year?: string | number;
  primaryArtists?: string;
  artists?: ArtistSummary[];
  album?: AlbumSummary | null;
  downloadUrl?: { url: string }[] | string | null;
}

export interface PlaylistDoc {
  name: string;
  songs: string[];
  createdAt?: string;
}

export interface PlaylistItem {
  id: string;
  data: PlaylistDoc;
}

export interface ApiEnvelope<TData> {
  success: boolean;
  data: TData;
}

export interface SearchResults<TItem> {
  results: TItem[];
}
