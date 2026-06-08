export type ISODateString = string;

export type ItemKind =
  | "rod"
  | "reel"
  | "line"
  | "leader"
  | "lure"
  | "fly"
  | "hook"
  | "bait"
  | "net"
  | "waders"
  | "polarized_glasses"
  | "other";

export type FishingMethod = "spinning" | "bait" | "fly_fishing" | "tenkara" | "bait_fishing";

export type ItemCategory = {
  id: string;
  kind: ItemKind;
  label: string;
  sortOrder: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type Item = {
  id: string;
  categoryId: string;
  kind: ItemKind;
  name: string;
  note: string;
  mediaId?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type SetupItemRole =
  | "rod"
  | "reel"
  | "line"
  | "leader"
  | "primary"
  | "shared"
  | "other";

export type SetupItem = {
  itemId: string;
  role: SetupItemRole;
};

export type Setup = {
  id: string;
  name: string;
  fishingMethods: FishingMethod[];
  items: SetupItem[];
  defaultPrimaryItemId?: string;
  mediaId?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type Place = {
  id: string;
  riverName: string;
  areaName: string;
  pointName: string;
  note: string;
  isFavorite: boolean;
  lastUsedAt?: ISODateString;
  latitude?: number;
  longitude?: number;
  mediaId?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type SessionStatus = "planned" | "active" | "finished";

export type Session = {
  id: string;
  title: string;
  setupId: string;
  placeId: string;
  currentPrimaryItemId?: string;
  status: SessionStatus;
  startedAt: ISODateString;
  endedAt?: ISODateString;
  note: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type Result = {
  id: string;
  sessionId: string;
  setupId: string;
  placeId: string;
  primaryItemId?: string;
  usedItemIds: string[];
  species: string;
  sizeCm: number;
  fishMediaId?: string;
  sceneryMediaIds: string[];
  note: string;
  caughtAt: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export type Media = {
  id: string;
  blob: Blob;
  thumbnailBlob: Blob;
  mimeType: string;
  createdAt: ISODateString;
};

export type AppState = {
  id: "main";
  currentSetupId?: string;
  currentPrimaryItemId?: string;
  currentPlaceId?: string;
  activeSessionId?: string;
  updatedAt: ISODateString;
};
