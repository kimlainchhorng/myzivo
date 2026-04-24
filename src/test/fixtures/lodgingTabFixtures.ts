export const validLodgingTabFixtures = ["lodge-overview", "lodge-rate-plans", "lodge-addons", "lodge-guest-requests"];

export const validBaseTabFixtures = ["profile", "orders", "products", "payment", "settings"];

export const tabQueryFixtures = [
  { search: "?tab=lodge-overview", lodging: true, expected: "lodge-overview" },
  { search: "tab=lodge-rate-plans", lodging: true, expected: "lodge-rate-plans" },
  { search: "?tab=lodge-addons&source=qa", lodging: true, expected: "lodge-addons" },
  { search: "?tab=bad-tab", lodging: true, expected: "lodge-overview" },
  { search: "?tab=lodge-overview", lodging: false, expected: "profile" },
  { search: "", lodging: true, expected: "lodge-overview" },
  { search: "", lodging: false, expected: "profile" },
];