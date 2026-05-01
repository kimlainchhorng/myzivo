/**
 * Live page feature flags.
 *
 * Each flag gates a section of the Live tab. Set to `true` only when the
 * underlying backend (table + write path) has shipped — never to show mock
 * placeholder content to real users.
 *
 * To enable a section: ship the data backend first, then flip the flag here.
 */
export const LIVE_FEATURE_FLAGS = {
  // Wired to live_streams + live_viewers + live_gift_displays
  recentlyWatched: true,
  topGifters: true,

  // No backend yet — hidden until data sources exist
  karaokeRooms: false,
  birthdayCelebrations: false,
  pkBattles: false,
  voiceRooms: false,
  spotlight: false,
  awards: false,
  highlights: false,
  dailyPicks: false,
  events: false,
  zodiac: false,
  diamondShowers: false,
  scheduledStreams: false,
  newHosts: false,
  trendingTags: false,
} as const;

export type LiveFeatureFlag = keyof typeof LIVE_FEATURE_FLAGS;
