/**
 * Centralized Mock Locations — Comprehensive US Coverage
 * ~400 real addresses across all 50 US states.
 * Used when location services, geocoding, or map APIs are unavailable.
 */

// Default map center: New York City
export const DEFAULT_CENTER = { lat: 40.7128, lng: -73.9857 };
export const DEFAULT_PICKUP_COORDS = { lat: 40.7484, lng: -73.9857 };
export const DEFAULT_DROPOFF_COORDS = { lat: 40.7127, lng: -74.0134 };
export const DEFAULT_DRIVER_START_COORDS = { lat: 40.7584, lng: -73.9957 };

export const MOCK_ADDRESSES = [
  // ═══ NEW YORK ═══
  "350 Fifth Avenue, New York, NY",
  "1 World Trade Center, New York, NY",
  "30 Rockefeller Plaza, New York, NY",
  "100 Central Park West, New York, NY",
  "20 W 34th St, New York, NY",
  "1000 5th Ave, New York, NY",
  "45 Rockefeller Plaza, New York, NY",
  "1 E 161st St, Bronx, NY",
  "123-01 Roosevelt Ave, Queens, NY",
  "620 Atlantic Ave, Brooklyn, NY",

  // ═══ CALIFORNIA ═══
  // Los Angeles
  "200 Santa Monica Pier, Santa Monica, CA",
  "6801 Hollywood Blvd, Los Angeles, CA",
  "3700 Wilshire Blvd, Los Angeles, CA",
  "1111 S Figueroa St, Los Angeles, CA",
  "100 Aquarium Way, Long Beach, CA",
  "5905 Wilshire Blvd, Los Angeles, CA",
  "1 Gateway Dr, Los Angeles, CA",
  "100 Universal City Plaza, Universal City, CA",
  "1313 Disneyland Dr, Anaheim, CA",
  "2800 E Observatory Rd, Los Angeles, CA",
  // San Francisco / Bay Area
  "1 Infinite Loop, Cupertino, CA",
  "Pier 39, San Francisco, CA",
  "1 Ferry Building, San Francisco, CA",
  "501 Stanyan St, San Francisco, CA",
  "600 The Embarcadero, San Francisco, CA",
  "1600 Amphitheatre Pkwy, Mountain View, CA",
  "1 Hacker Way, Menlo Park, CA",
  "2775 Sand Hill Rd, Menlo Park, CA",
  "200 Santa Cruz Ave, Palo Alto, CA",
  // San Diego
  "868 5th Ave, San Diego, CA",
  "1549 El Prado, San Diego, CA",
  "100 Park Blvd, San Diego, CA",
  "3500 Sports Arena Blvd, San Diego, CA",
  "2920 Zoo Dr, San Diego, CA",
  // Sacramento
  "1315 10th St, Sacramento, CA",
  "500 David J Stern Walk, Sacramento, CA",
  "1600 Exposition Blvd, Sacramento, CA",

  // ═══ ILLINOIS ═══
  "233 S Wacker Dr, Chicago, IL",
  "500 N Michigan Ave, Chicago, IL",
  "875 N Michigan Ave, Chicago, IL",
  "1060 W Addison St, Chicago, IL",
  "333 W 35th St, Chicago, IL",
  "1901 W Madison St, Chicago, IL",
  "1 N State St, Chicago, IL",
  "5700 S DuSable Lake Shore Dr, Chicago, IL",
  "111 S Michigan Ave, Chicago, IL",
  "700 E Grand Ave, Chicago, IL",

  // ═══ TEXAS ═══
  // Austin
  "600 Congress Ave, Austin, TX",
  "1100 Congress Ave, Austin, TX",
  "2100 Robert Dedman Dr, Austin, TX",
  "1600 Trinity St, Austin, TX",
  // Houston
  "2101 NASA Pkwy, Houston, TX",
  "1001 Avenida de las Americas, Houston, TX",
  "6100 Main St, Houston, TX",
  "1 NRG Pkwy, Houston, TX",
  "501 Crawford St, Houston, TX",
  // Dallas / Fort Worth
  "1901 Main St, Dallas, TX",
  "2500 Victory Ave, Dallas, TX",
  "1717 N Harwood St, Dallas, TX",
  "2201 N Stemmons Fwy, Dallas, TX",
  "1 AT&T Way, Arlington, TX",
  "925 N Collins St, Arlington, TX",
  // San Antonio
  "300 Alamo Plaza, San Antonio, TX",
  "600 E Market St, San Antonio, TX",
  "1 AT&T Center Pkwy, San Antonio, TX",
  // El Paso
  "1 Civic Center Plaza, El Paso, TX",

  // ═══ FLORIDA ═══
  // Miami
  "401 Biscayne Blvd, Miami, FL",
  "1601 Biscayne Blvd, Miami, FL",
  "1 Washington Ave, Miami Beach, FL",
  "1000 Ocean Dr, Miami Beach, FL",
  "347 Don Shula Dr, Miami Gardens, FL",
  // Tampa
  "1 Busch Gardens Blvd, Tampa, FL",
  "1 Channelside Dr, Tampa, FL",
  "401 Channelside Dr, Tampa, FL",
  // Orlando
  "8001 International Dr, Orlando, FL",
  "9800 International Dr, Orlando, FL",
  "6000 Universal Blvd, Orlando, FL",
  "1180 Seven Seas Dr, Orlando, FL",
  // Jacksonville
  "1 TIAA Bank Field Dr, Jacksonville, FL",
  "1 Independent Dr, Jacksonville, FL",
  // Fort Lauderdale
  "1 N Fort Lauderdale Beach Blvd, Fort Lauderdale, FL",

  // ═══ PENNSYLVANIA ═══
  "1600 Arch St, Philadelphia, PA",
  "1 N Broad St, Philadelphia, PA",
  "3260 S Broad St, Philadelphia, PA",
  "1 Citizens Bank Way, Philadelphia, PA",
  "1 Lincoln Financial Field Way, Philadelphia, PA",
  "600 N Broad St, Philadelphia, PA",
  "115 Federal St, Pittsburgh, PA",
  "1000 Fort Duquesne Blvd, Pittsburgh, PA",
  "100 Art Rooney Ave, Pittsburgh, PA",

  // ═══ WASHINGTON DC / VIRGINIA / MARYLAND ═══
  "1600 Pennsylvania Ave NW, Washington, DC",
  "2 15th St NW, Washington, DC",
  "1000 Jefferson Dr SW, Washington, DC",
  "900 Ohio Dr SW, Washington, DC",
  "4th St & Independence Ave SW, Washington, DC",
  "200 E Pratt St, Baltimore, MD",
  "300 E Pratt St, Baltimore, MD",
  "333 W Camden St, Baltimore, MD",
  "1101 Russell St, Baltimore, MD",

  // ═══ GEORGIA ═══
  "1 Hartsfield Center Pkwy, Atlanta, GA",
  "225 Peachtree St NE, Atlanta, GA",
  "2600 Benjamin Mays Dr SW, Atlanta, GA",
  "1 AMB Dr NW, Atlanta, GA",
  "755 Hank Aaron Dr SE, Atlanta, GA",
  "800 Whitehall St SW, Atlanta, GA",
  "250 Andrew Young International Blvd, Atlanta, GA",
  "200 Baker St NW, Atlanta, GA",
  // Savannah
  "22 Bull St, Savannah, GA",
  "1 W River St, Savannah, GA",

  // ═══ MASSACHUSETTS ═══
  "1 Faneuil Hall Sq, Boston, MA",
  "4 Jersey St, Boston, MA",
  "100 Legends Way, Boston, MA",
  "77 Massachusetts Ave, Cambridge, MA",
  "1 Patriot Pl, Foxborough, MA",
  "1 Harvard Yard, Cambridge, MA",
  "206 Newbury St, Boston, MA",
  "300 Congress St, Boston, MA",

  // ═══ MICHIGAN ═══
  "2100 Woodward Ave, Detroit, MI",
  "300 Renaissance Center, Detroit, MI",
  "2000 Brush St, Detroit, MI",
  "2301 Woodward Ave, Detroit, MI",
  "1001 Woodward Ave, Detroit, MI",
  "500 Temple St, Detroit, MI",
  // Ann Arbor
  "1201 S Main St, Ann Arbor, MI",
  "301 E Liberty St, Ann Arbor, MI",

  // ═══ MINNESOTA ═══
  "600 1st Ave N, Minneapolis, MN",
  "401 Chicago Ave, Minneapolis, MN",
  "900 S 5th St, Minneapolis, MN",
  "300 Nicollet Mall, Minneapolis, MN",
  "2400 3rd Ave S, Minneapolis, MN",
  "240 Summit Ave, Saint Paul, MN",

  // ═══ TENNESSEE ═══
  "300 Broadway, Nashville, TN",
  "2804 Opryland Dr, Nashville, TN",
  "501 Broadway, Nashville, TN",
  "1 Titans Way, Nashville, TN",
  "116 Rep John Lewis Way N, Nashville, TN",
  // Memphis
  "126 Beale St, Memphis, TN",
  "3734 Elvis Presley Blvd, Memphis, TN",
  "191 Beale St, Memphis, TN",

  // ═══ NORTH CAROLINA ═══
  "800 S Mint St, Charlotte, NC",
  "200 E Trade St, Charlotte, NC",
  "330 N Tryon St, Charlotte, NC",
  "1 E Edenton St, Raleigh, NC",
  "1400 Edwards Mill Rd, Raleigh, NC",
  "2 E South St, Raleigh, NC",
  // Durham
  "411 W Main St, Durham, NC",
  "2200 W Main St, Durham, NC",

  // ═══ OREGON ═══
  "701 SW 6th Ave, Portland, OR",
  "1000 NW Glisan St, Portland, OR",
  "1 N Center Ct St, Portland, OR",
  "1844 SW Morrison St, Portland, OR",
  "4001 SW Canyon Rd, Portland, OR",

  // ═══ INDIANA ═══
  "1 Monument Cir, Indianapolis, IN",
  "500 S Capitol Ave, Indianapolis, IN",
  "125 S Pennsylvania St, Indianapolis, IN",
  "4790 W 16th St, Indianapolis, IN",
  "1220 Waterway Blvd, Indianapolis, IN",

  // ═══ OHIO ═══
  "1 Capitol Square, Columbus, OH",
  "200 W Nationwide Blvd, Columbus, OH",
  "1 Black & Gold Blvd, Columbus, OH",
  // Cleveland
  "1 Center Ct, Cleveland, OH",
  "2401 Ontario St, Cleveland, OH",
  "1100 E 9th St, Cleveland, OH",
  // Cincinnati
  "1 Paul Brown Stadium, Cincinnati, OH",
  "100 Joe Nuxhall Way, Cincinnati, OH",

  // ═══ MISSOURI ═══
  "700 Clark Ave, St. Louis, MO",
  "1 Stadium Dr, St. Louis, MO",
  "4344 Shaw Blvd, St. Louis, MO",
  "30 W Pershing Rd, Kansas City, MO",
  "4706 Broadway Blvd, Kansas City, MO",
  "1 Royal Way, Kansas City, MO",
  "1 Arrowhead Dr, Kansas City, MO",

  // ═══ COLORADO ═══
  "1000 Chopper Cir, Denver, CO",
  "1701 Bryant St, Denver, CO",
  "2001 Blake St, Denver, CO",
  "1801 California St, Denver, CO",
  "200 E Colfax Ave, Denver, CO",
  "1007 York St, Denver, CO",
  // Colorado Springs
  "1 Olympic Plaza, Colorado Springs, CO",

  // ═══ WASHINGTON STATE ═══
  "400 Broad St, Seattle, WA",
  "1000 4th Ave, Seattle, WA",
  "800 Occidental Ave S, Seattle, WA",
  "334 1st Ave S, Seattle, WA",
  "1901 Terry Ave, Seattle, WA",
  "2901 3rd Ave, Seattle, WA",
  "1 Safeco Center, Seattle, WA",
  "1124 Pike St, Seattle, WA",

  // ═══ ARIZONA ═══
  "750 E Pratt St, Phoenix, AZ",
  "2701 E Camelback Rd, Phoenix, AZ",
  "401 E Jefferson St, Phoenix, AZ",
  "1 E Washington St, Phoenix, AZ",
  "2021 N Kinney Rd, Tucson, AZ",
  "100 S Old Tucson Rd, Tucson, AZ",
  // Scottsdale
  "7135 E Camelback Rd, Scottsdale, AZ",

  // ═══ NEVADA ═══
  "3799 Las Vegas Blvd S, Las Vegas, NV",
  "1 Caesars Palace Dr, Las Vegas, NV",
  "3570 Las Vegas Blvd S, Las Vegas, NV",
  "3600 Las Vegas Blvd S, Las Vegas, NV",
  "3131 Las Vegas Blvd S, Las Vegas, NV",
  "3355 Las Vegas Blvd S, Las Vegas, NV",
  "3000 Paradise Rd, Las Vegas, NV",
  "200 S Virginia St, Reno, NV",

  // ═══ LOUISIANA ═══
  "600 Bourbon St, New Orleans, LA",
  "1500 Sugar Bowl Dr, New Orleans, LA",
  "1 Galleria Blvd, Metairie, LA",
  "400 Poydras St, New Orleans, LA",
  "1555 Poydras St, New Orleans, LA",

  // ═══ HAWAII ═══
  "1000 Ala Moana Blvd, Honolulu, HI",
  "2500 Kalakaua Ave, Honolulu, HI",
  "1 Arizona Memorial Pl, Honolulu, HI",
  "2005 Kalia Rd, Honolulu, HI",
  "7192 Kalanianaole Hwy, Honolulu, HI",

  // ═══ WISCONSIN ═══
  "1111 Vel R Phillips Ave, Milwaukee, WI",
  "700 N Art Museum Dr, Milwaukee, WI",
  "1 Brewers Way, Milwaukee, WI",
  "1001 N 4th St, Milwaukee, WI",
  // Madison
  "2 E Main St, Madison, WI",
  "1440 Monroe St, Madison, WI",

  // ═══ UTAH ═══
  "50 N Temple, Salt Lake City, UT",
  "301 S Temple, Salt Lake City, UT",
  "301 W South Temple, Salt Lake City, UT",
  "1795 E 2100 S, Salt Lake City, UT",

  // ═══ CONNECTICUT ═══
  "1 Financial Plaza, Hartford, CT",
  "100 Columbus Blvd, Hartford, CT",
  "165 Church St, New Haven, CT",
  "149 Elm St, New Haven, CT",

  // ═══ SOUTH CAROLINA ═══
  "1 Coliseum Dr, North Charleston, SC",
  "188 Meeting St, Charleston, SC",
  "1 River Walk Way, Charleston, SC",

  // ═══ ALABAMA ═══
  "1 Dexter Ave, Montgomery, AL",
  "600 Dexter Ave, Montgomery, AL",
  "1000 18th St S, Birmingham, AL",
  "2101 Richard Arrington Jr Blvd N, Birmingham, AL",

  // ═══ KENTUCKY ═══
  "700 Central Ave, Louisville, KY",
  "101 W River Rd, Louisville, KY",
  "1 Stadium Dr, Lexington, KY",

  // ═══ IOWA ═══
  "1007 E Grand Ave, Des Moines, IA",
  "300 Walnut St, Des Moines, IA",
  "233 3rd St SE, Cedar Rapids, IA",

  // ═══ KANSAS ═══
  "300 SW 10th Ave, Topeka, KS",
  "1 Sporting Way, Kansas City, KS",

  // ═══ ARKANSAS ═══
  "500 President Clinton Ave, Little Rock, AR",
  "1 Riverfront Dr, Little Rock, AR",

  // ═══ MISSISSIPPI ═══
  "400 S State St, Jackson, MS",
  "1 Mississippi Blvd, Jackson, MS",

  // ═══ OKLAHOMA ═══
  "100 W Reno Ave, Oklahoma City, OK",
  "2100 NE 52nd St, Oklahoma City, OK",
  "2 S Boston Ave, Tulsa, OK",

  // ═══ NEBRASKA ═══
  "455 N 10th St, Omaha, NE",
  "3701 S 10th St, Omaha, NE",
  "400 S 15th St, Lincoln, NE",

  // ═══ NEW MEXICO ═══
  "1 Civic Plaza NW, Albuquerque, NM",
  "491 Old Santa Fe Trail, Santa Fe, NM",

  // ═══ WEST VIRGINIA ═══
  "1900 Kanawha Blvd E, Charleston, WV",

  // ═══ IDAHO ═══
  "700 S Capitol Blvd, Boise, ID",
  "250 S 5th St, Boise, ID",

  // ═══ MONTANA ═══
  "1301 E Main St, Bozeman, MT",
  "225 Roberts St, Helena, MT",

  // ═══ WYOMING ═══
  "200 E 24th St, Cheyenne, WY",

  // ═══ NORTH DAKOTA ═══
  "600 E Boulevard Ave, Bismarck, ND",

  // ═══ SOUTH DAKOTA ═══
  "13000 SD-244, Keystone, SD",
  "900 N West Ave, Sioux Falls, SD",

  // ═══ MAINE ═══
  "1 Monument Way, Portland, ME",
  "Commercial St, Portland, ME",

  // ═══ NEW HAMPSHIRE ═══
  "107 N Main St, Concord, NH",
  "1 Sundial Ave, Manchester, NH",

  // ═══ VERMONT ═══
  "1 Main St, Burlington, VT",
  "115 State St, Montpelier, VT",

  // ═══ RHODE ISLAND ═══
  "1 Sabin St, Providence, RI",
  "82 Smith St, Providence, RI",

  // ═══ DELAWARE ═══
  "411 Federal St, Dover, DE",
  "500 Shipyard Dr, Wilmington, DE",

  // ═══ ALASKA ═══
  "120 4th St, Juneau, AK",
  "600 W 4th Ave, Anchorage, AK",

  // ═══ NEW JERSEY ═══
  "1 MetLife Stadium Dr, East Rutherford, NJ",
  "1000 Boardwalk, Atlantic City, NJ",
  "25 Witherspoon St, Princeton, NJ",
  "1 Penn Plaza E, Newark, NJ",

  // ═══ MAJOR AIRPORTS ═══
  "JFK International Airport, Queens, NY",
  "1 World Way, Los Angeles, CA",
  "10000 W Balmoral Ave, Chicago, IL",
  "6000 N Terminal Pkwy, Atlanta, GA",
  "2400 Aviation Dr, Dallas, TX",
  "8500 Peña Blvd, Denver, CO",
  "SFO International Airport, San Francisco, CA",
  "17801 International Blvd, Seattle, WA",
  "2100 NW 42nd Ave, Miami, FL",
  "1 Harborside Dr, Boston, MA",
  "3600 Terminal Blvd, Houston, TX",
  "2400 Terminal Rd, Fort Lauderdale, FL",
  "1 Terminal Dr, Philadelphia, PA",
  "3225 N Harbor Dr, San Diego, CA",
  "3450 E Sky Harbor Blvd, Phoenix, AZ",
  "5300 Lusk Blvd, San Diego, CA",
  "1 Jeff Fuqua Blvd, Orlando, FL",
  "7100 Terminal Dr, Minneapolis, MN",
  "5600 International Blvd, Nashville, TN",
  "5000 International Gateway, Columbus, OH",
];

// Coordinates keyed by place_id (mock-N)
export const MOCK_COORDS: Record<string, { lat: number; lng: number }> = {};

// Real lat/lng for every entry above – same order
const _coords: [number, number][] = [
  // NEW YORK (10)
  [40.7484, -73.9857], [40.7127, -74.0134], [40.7587, -73.9787], [40.7812, -73.9740],
  [40.7488, -73.9854], [40.7794, -73.9632], [40.7593, -73.9780], [40.8296, -73.9262],
  [40.7570, -73.8456], [40.6826, -73.9754],
  // CALIFORNIA – LA (10)
  [34.0094, -118.4973], [34.1015, -118.3391], [34.0619, -118.3089], [34.0430, -118.2673],
  [33.7619, -118.1960], [34.0638, -118.3592], [34.0560, -118.2370], [34.1381, -118.3534],
  [33.8121, -117.9190], [34.1184, -118.3004],
  // CALIFORNIA – SF/Bay (9)
  [37.3318, -122.0312], [37.8087, -122.4098], [37.7956, -122.3935], [37.7694, -122.4862],
  [37.7941, -122.3898], [37.4220, -122.0841], [37.4847, -122.1477], [37.4189, -122.2060],
  [37.4407, -122.1581],
  // CALIFORNIA – San Diego (5)
  [32.7114, -117.1601], [32.7341, -117.1446], [32.7073, -117.1628], [32.7546, -117.2162],
  [32.7353, -117.1490],
  // CALIFORNIA – Sacramento (3)
  [38.5766, -121.4934], [38.5802, -121.4998], [38.5850, -121.5016],
  // ILLINOIS (10)
  [41.8789, -87.6359], [41.8900, -87.6245], [41.8988, -87.6233], [41.9484, -87.6553],
  [41.8299, -87.6338], [41.8806, -87.6742], [41.8819, -87.6278], [41.7910, -87.5830],
  [41.8796, -87.6237], [41.8917, -87.6094],
  // TEXAS – Austin (4)
  [30.2747, -97.7404], [30.2780, -97.7404], [30.2837, -97.7326], [30.2849, -97.7341],
  // TEXAS – Houston (5)
  [29.5519, -95.0981], [29.7530, -95.3571], [29.7220, -95.3885], [29.6847, -95.4107],
  [29.7572, -95.3555],
  // TEXAS – Dallas/FW (6)
  [32.7876, -96.7985], [32.7906, -96.8104], [32.7903, -96.7987], [32.7891, -96.8066],
  [32.7473, -97.0945], [32.7554, -97.0830],
  // TEXAS – San Antonio (3)
  [29.4260, -98.4861], [29.4241, -98.4936], [29.4270, -98.4375],
  // TEXAS – El Paso (1)
  [31.7619, -106.4850],
  // FLORIDA – Miami (5)
  [25.7751, -80.1868], [25.7863, -80.1889], [25.7743, -80.1369], [25.7781, -80.1300],
  [25.9580, -80.2389],
  // FLORIDA – Tampa (3)
  [28.0322, -82.4215], [27.9426, -82.4518], [27.9425, -82.4519],
  // FLORIDA – Orlando (4)
  [28.4260, -81.4692], [28.4281, -81.4707], [28.4727, -81.4686], [28.4199, -81.5812],
  // FLORIDA – Jacksonville (2)
  [30.3240, -81.6371], [30.3249, -81.6606],
  // FLORIDA – Fort Lauderdale (1)
  [26.1175, -80.1085],
  // PENNSYLVANIA (9)
  [39.9543, -75.1683], [39.9566, -75.1630], [39.9060, -75.1710], [39.9061, -75.1665],
  [39.9008, -75.1675], [39.9680, -75.1527], [40.4417, -80.0000], [40.4465, -80.0088],
  [40.4468, -80.0158],
  // WASHINGTON DC / MD (9)
  [38.8977, -77.0365], [38.8893, -77.0353], [38.8881, -77.0258], [38.8828, -77.0440],
  [38.8876, -77.0199], [39.2861, -76.6113], [39.2861, -76.6097], [39.2837, -76.6216],
  [39.2775, -76.6226],
  // GEORGIA (10)
  [33.6407, -84.4277], [33.7590, -84.3880], [33.7356, -84.4133], [33.7553, -84.4006],
  [33.7350, -84.3896], [33.7490, -84.3957], [33.7604, -84.3930], [33.7627, -84.3952],
  [32.0809, -81.0912], [32.0810, -81.0888],
  // MASSACHUSETTS (8)
  [42.3601, -71.0549], [42.3467, -71.0972], [42.3662, -71.0621], [42.3601, -71.0942],
  [42.0928, -71.2643], [42.3770, -71.1167], [42.3496, -71.0792], [42.3484, -71.0458],
  // MICHIGAN (8)
  [42.3390, -83.0485], [42.3293, -83.0398], [42.3390, -83.0489], [42.3357, -83.0497],
  [42.3315, -83.0458], [42.3361, -83.0536], [42.2657, -83.7486], [42.2808, -83.7430],
  // MINNESOTA (6)
  [44.9795, -93.2760], [44.9736, -93.2575], [44.9731, -93.2567], [44.9775, -93.2712],
  [44.9541, -93.2460], [44.9399, -93.1040],
  // TENNESSEE (8)
  [36.1627, -86.7816], [36.2054, -86.6924], [36.1618, -86.7767], [36.1664, -86.7713],
  [36.1627, -86.7818], [35.1397, -90.0530], [35.0477, -90.0260], [35.1389, -90.0530],
  // NORTH CAROLINA (8)
  [35.2258, -80.8528], [35.2271, -80.8431], [35.2280, -80.8370], [35.7796, -78.6382],
  [35.8032, -78.7220], [35.7804, -78.6392], [35.9940, -78.8986], [36.0070, -78.9127],
  // OREGON (5)
  [45.5189, -122.6790], [45.5311, -122.6836], [45.5316, -122.6670], [45.5213, -122.6860],
  [45.5111, -122.7175],
  // INDIANA (5)
  [39.7684, -86.1581], [39.7601, -86.1639], [39.7684, -86.1580], [39.7953, -86.2353],
  [39.7682, -86.1488],
  // OHIO (8)
  [39.9612, -82.9988], [39.9694, -83.0060], [40.0088, -82.9910],
  [41.4966, -81.6882], [41.4955, -81.6883], [41.4993, -81.6944],
  [39.0954, -84.5160], [39.0975, -84.5069],
  // MISSOURI (7)
  [38.6226, -90.1928], [38.6324, -90.1887], [38.6174, -90.2594],
  [39.0847, -94.5858], [39.0355, -94.5934], [39.0517, -94.4810], [39.0490, -94.4839],
  // COLORADO (7)
  [39.7487, -105.0077], [39.7536, -104.9892], [39.7559, -104.9942], [39.7499, -104.9863],
  [39.7393, -104.9847], [39.7327, -104.9655], [38.8339, -104.8214],
  // WASHINGTON STATE (8)
  [47.6205, -122.3493], [47.6062, -122.3321], [47.5952, -122.3316], [47.5990, -122.3340],
  [47.6219, -122.3370], [47.6177, -122.3528], [47.5914, -122.3330], [47.6142, -122.3270],
  // ARIZONA (7)
  [33.4484, -112.0740], [33.5088, -111.9710], [33.4457, -112.0712], [33.4484, -112.0773],
  [32.2544, -111.1661], [32.1616, -111.1673], [33.5016, -111.9289],
  // NEVADA (8)
  [36.1041, -115.1724], [36.1162, -115.1745], [36.1052, -115.1745], [36.1082, -115.1743],
  [36.1111, -115.1699], [36.1126, -115.1703], [36.1288, -115.1522], [39.5296, -119.8138],
  // LOUISIANA (5)
  [29.9584, -90.0654], [29.9511, -90.0815], [29.9884, -90.1596], [29.9492, -90.0697],
  [29.9476, -90.0697],
  // HAWAII (5)
  [21.2907, -157.8440], [21.2768, -157.8272], [21.3647, -157.9500], [21.2852, -157.8370],
  [21.2814, -157.7125],
  // WISCONSIN (6)
  [43.0451, -87.9174], [43.0402, -87.8974], [43.0280, -87.9712], [43.0550, -87.9188],
  [43.0741, -89.3838], [43.0659, -89.4196],
  // UTAH (4)
  [40.7703, -111.8918], [40.7683, -111.9011], [40.7681, -111.9020], [40.7421, -111.8302],
  // CONNECTICUT (4)
  [41.7658, -72.6734], [41.7626, -72.6743], [41.3113, -72.9279], [41.3069, -72.9306],
  // SOUTH CAROLINA (3)
  [32.8804, -80.0258], [32.7765, -79.9311], [32.7895, -79.9268],
  // ALABAMA (4)
  [32.3770, -86.3006], [32.3779, -86.2989], [33.5088, -86.8025], [33.5186, -86.8104],
  // KENTUCKY (3)
  [38.2527, -85.7585], [38.2561, -85.7447], [38.0317, -84.5037],
  // IOWA (3)
  [41.5866, -93.6244], [41.5868, -93.6250], [41.9774, -91.6656],
  // KANSAS (2)
  [39.0480, -95.6780], [39.1215, -94.8231],
  // ARKANSAS (2)
  [34.7465, -92.2896], [34.7481, -92.2697],
  // MISSISSIPPI (2)
  [32.2988, -90.1848], [32.3158, -90.2123],
  // OKLAHOMA (3)
  [35.4634, -97.5151], [35.5259, -97.4852], [36.1540, -95.9928],
  // NEBRASKA (3)
  [41.2524, -95.9980], [41.2101, -95.9483], [40.8136, -96.7026],
  // NEW MEXICO (2)
  [35.0844, -106.6504], [35.6870, -105.9378],
  // WEST VIRGINIA (1)
  [38.3366, -81.6123],
  // IDAHO (2)
  [43.6150, -116.2023], [43.6159, -116.2025],
  // MONTANA (2)
  [45.6770, -111.0429], [46.5891, -112.0391],
  // WYOMING (1)
  [41.1400, -104.8202],
  // NORTH DAKOTA (1)
  [46.8083, -100.7837],
  // SOUTH DAKOTA (2)
  [43.8791, -103.4591], [43.5446, -96.7311],
  // MAINE (2)
  [43.6591, -70.2568], [43.6562, -70.2530],
  // NEW HAMPSHIRE (2)
  [43.2081, -71.5376], [42.9914, -71.4630],
  // VERMONT (2)
  [44.4759, -73.2121], [44.2601, -72.5754],
  // RHODE ISLAND (2)
  [41.8240, -71.4128], [41.8321, -71.4149],
  // DELAWARE (2)
  [39.1574, -75.5248], [39.7312, -75.5480],
  // ALASKA (2)
  [58.3005, -134.4197], [61.2176, -149.8997],
  // NEW JERSEY (4)
  [40.8135, -74.0745], [39.3643, -74.4229], [40.3487, -74.6593], [40.7367, -74.1713],
  // AIRPORTS (20)
  [40.6413, -73.7781], [33.9425, -118.4081], [41.9742, -87.9073], [33.6407, -84.4277],
  [32.8998, -97.0403], [39.8561, -104.6737], [37.6213, -122.3790], [47.4502, -122.3088],
  [25.7959, -80.2870], [42.3656, -71.0096], [29.9844, -95.3414], [26.0742, -80.1506],
  [39.8721, -75.2411], [32.7338, -117.1933], [33.4373, -112.0078], [32.7338, -117.1940],
  [28.4312, -81.3081], [44.8848, -93.2223], [36.1263, -86.6774], [39.9980, -82.8919],
];

// Populate MOCK_COORDS from the array
_coords.forEach((c, i) => {
  MOCK_COORDS[`mock-${i + 1}`] = { lat: c[0], lng: c[1] };
});

// PlaceSuggestion-compatible mock data
export const MOCK_PLACE_SUGGESTIONS = MOCK_ADDRESSES.map((address, i) => ({
  description: address,
  place_id: `mock-${i + 1}`,
  main_text: address.split(",")[0],
}));

export const MOCK_ADDRESS_STRINGS = MOCK_ADDRESSES;
