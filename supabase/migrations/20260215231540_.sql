
-- Batch 1: Add many more cities with unique names across all states
INSERT INTO public.cities (name, state, country, is_active) VALUES
-- DC (1→6)
('Tenleytown DC','DC','US',true),('Navy Yard DC','DC','US',true),('Woodley Park DC','DC','US',true),('Petworth DC','DC','US',true),('Brookland DC','DC','US',true),
-- HI (1→7)
('Maui','HI','US',true),('Kona','HI','US',true),('Lahaina','HI','US',true),('Wahiawa','HI','US',true),('Mililani','HI','US',true),('Ewa Beach','HI','US',true),
-- RI (1→7)
('Warwick RI','RI','US',true),('Cranston RI','RI','US',true),('Newport RI','RI','US',true),('Woonsocket RI','RI','US',true),('Cumberland RI','RI','US',true),('Westerly RI','RI','US',true),
-- VT (1→7)
('Stowe','VT','US',true),('Brattleboro','VT','US',true),('St Johnsbury','VT','US',true),('Middlebury VT','VT','US',true),('Barre VT','VT','US',true),('Winooski','VT','US',true),
-- AK (2→8)
('Wasilla AK','AK','US',true),('Sitka','AK','US',true),('Kenai','AK','US',true),('Kodiak','AK','US',true),('Palmer AK','AK','US',true),('Soldotna','AK','US',true),
-- AR (2→8)
('Conway AR','AR','US',true),('Rogers AR','AR','US',true),('Bentonville','AR','US',true),('Pine Bluff','AR','US',true),('Hot Springs AR','AR','US',true),('Paragould','AR','US',true),
-- DE (2→8)
('Smyrna DE','DE','US',true),('Milford DE','DE','US',true),('Seaford DE','DE','US',true),('Georgetown DE','DE','US',true),('New Castle DE','DE','US',true),('Lewes DE','DE','US',true),
-- IA (2→8)
('Iowa City','IA','US',true),('Council Bluffs','IA','US',true),('Ames IA','IA','US',true),('Dubuque','IA','US',true),('Ankeny','IA','US',true),('West Des Moines','IA','US',true),
-- ID (2→8)
('Twin Falls','ID','US',true),('Coeur d Alene','ID','US',true),('Caldwell ID','ID','US',true),('Moscow ID','ID','US',true),('Lewiston ID','ID','US',true),('Rexburg','ID','US',true),
-- KY (2→8)
('Frankfort KY','KY','US',true),('Florence KY','KY','US',true),('Hopkinsville','KY','US',true),('Henderson KY','KY','US',true),('Richmond KY','KY','US',true),('Paducah','KY','US',true),
-- MD (2→8)
('Bowie MD','MD','US',true),('Hagerstown','MD','US',true),('Salisbury MD','MD','US',true),('College Park MD','MD','US',true),('Laurel MD','MD','US',true),('Elkton MD','MD','US',true),
-- ME (2→8)
('Augusta ME','ME','US',true),('Biddeford','ME','US',true),('Sanford ME','ME','US',true),('Scarborough ME','ME','US',true),('Gorham ME','ME','US',true),('Westbrook ME','ME','US',true),
-- MS (2→8)
('Tupelo','MS','US',true),('Meridian MS','MS','US',true),('Olive Branch','MS','US',true),('Pearl MS','MS','US',true),('Starkville','MS','US',true),('Vicksburg','MS','US',true),
-- MT (2→8)
('Butte','MT','US',true),('Kalispell MT','MT','US',true),('Havre','MT','US',true),('Miles City','MT','US',true),('Anaconda MT','MT','US',true),('Whitefish','MT','US',true),
-- ND (2→8)
('Dickinson ND','ND','US',true),('Williston','ND','US',true),('Jamestown ND','ND','US',true),('Wahpeton','ND','US',true),('Mandan','ND','US',true),('Valley City ND','ND','US',true),
-- NE (2→8)
('Fremont NE','NE','US',true),('Hastings NE','NE','US',true),('North Platte','NE','US',true),('Norfolk NE','NE','US',true),('Columbus NE','NE','US',true),('Papillion','NE','US',true),
-- NH (2→8)
('Keene NH','NH','US',true),('Laconia','NH','US',true),('Lebanon NH','NH','US',true),('Claremont NH','NH','US',true),('Somersworth','NH','US',true),('Berlin NH','NH','US',true),
-- NM (2→8)
('Farmington NM','NM','US',true),('Clovis NM','NM','US',true),('Hobbs NM','NM','US',true),('Carlsbad NM','NM','US',true),('Gallup NM','NM','US',true),('Deming NM','NM','US',true),
-- NV (2→8)
('Sparks NV','NV','US',true),('Carson City','NV','US',true),('Elko NV','NV','US',true),('Mesquite NV','NV','US',true),('Boulder City','NV','US',true),('Fernley NV','NV','US',true),
-- OK (2→8)
('Stillwater OK','OK','US',true),('Lawton OK','OK','US',true),('Moore OK','OK','US',true),('Enid','OK','US',true),('Midwest City','OK','US',true),('Shawnee OK','OK','US',true),
-- SD (2→8)
('Watertown SD','SD','US',true),('Mitchell SD','SD','US',true),('Pierre SD','SD','US',true),('Huron SD','SD','US',true),('Vermillion SD','SD','US',true),('Yankton','SD','US',true),
-- UT (2→8)
('West Jordan','UT','US',true),('Ogden','UT','US',true),('Layton UT','UT','US',true),('St George UT','UT','US',true),('Logan UT','UT','US',true),('Lehi UT','UT','US',true),
-- WV (2→8)
('Wheeling WV','WV','US',true),('Weirton','WV','US',true),('Fairmont WV','WV','US',true),('Beckley','WV','US',true),('Clarksburg WV','WV','US',true),('Martinsburg WV','WV','US',true),
-- WY (2→8)
('Sheridan WY','WY','US',true),('Green River WY','WY','US',true),('Evanston WY','WY','US',true),('Riverton WY','WY','US',true),('Jackson WY','WY','US',true),('Cody WY','WY','US',true),
-- AL (3→8)
('Dothan','AL','US',true),('Decatur AL','AL','US',true),('Auburn AL','AL','US',true),('Florence AL','AL','US',true),('Gadsden','AL','US',true),
-- AZ (3→8)
('Scottsdale','AZ','US',true),('Tempe','AZ','US',true),('Peoria AZ','AZ','US',true),('Surprise AZ','AZ','US',true),('Yuma','AZ','US',true),
-- CO (3→8)
('Thornton CO','CO','US',true),('Westminster CO','CO','US',true),('Arvada','CO','US',true),('Centennial CO','CO','US',true),('Boulder CO','CO','US',true),
-- CT (3→8)
('Danbury','CT','US',true),('Stamford CT','CT','US',true),('Norwalk CT','CT','US',true),('West Hartford','CT','US',true),('Milford CT','CT','US',true),
-- GA (3→8)
('Athens GA','GA','US',true),('Sandy Springs','GA','US',true),('Roswell GA','GA','US',true),('Warner Robins','GA','US',true),('Albany GA','GA','US',true),
-- IN (3→8)
('South Bend IN','IN','US',true),('Fishers IN','IN','US',true),('Noblesville','IN','US',true),('Terre Haute','IN','US',true),('Kokomo','IN','US',true),
-- KS (3→8)
('Topeka','KS','US',true),('Manhattan KS','KS','US',true),('Lawrence KS','KS','US',true),('Lenexa','KS','US',true),('Salina KS','KS','US',true),
-- LA (3→8)
('Kenner','LA','US',true),('Bossier City','LA','US',true),('Monroe LA','LA','US',true),('Alexandria LA','LA','US',true),('Slidell','LA','US',true),
-- MA (3→8)
('New Bedford','MA','US',true),('Brockton','MA','US',true),('Quincy MA','MA','US',true),('Lynn MA','MA','US',true),('Fall River','MA','US',true),
-- MI (3→8)
('Sterling Heights MI','MI','US',true),('Warren MI','MI','US',true),('Dearborn','MI','US',true),('Livonia MI','MI','US',true),('Troy MI','MI','US',true),
-- MN (3→8)
('Plymouth MN','MN','US',true),('Woodbury MN','MN','US',true),('Maple Grove','MN','US',true),('Eagan','MN','US',true),('Eden Prairie','MN','US',true),
-- MO (3→8)
('Springfield MO','MO','US',true),('Lee Summit','MO','US',true),('O Fallon MO','MO','US',true),('St Joseph MO','MO','US',true),('St Charles MO','MO','US',true),
-- NJ (3→8)
('Clifton NJ','NJ','US',true),('Passaic NJ','NJ','US',true),('Union City NJ','NJ','US',true),('Hoboken','NJ','US',true),('Bayonne','NJ','US',true),
-- OR (3→8)
('Hillsboro OR','OR','US',true),('Beaverton','OR','US',true),('Medford OR','OR','US',true),('Corvallis','OR','US',true),('Lake Oswego','OR','US',true),
-- PA (3→8)
('Scranton PA','PA','US',true),('Bethlehem PA','PA','US',true),('Lancaster PA','PA','US',true),('Levittown PA','PA','US',true),('York PA','PA','US',true),
-- SC (3→8)
('Mount Pleasant SC','SC','US',true),('Spartanburg','SC','US',true),('Summerville SC','SC','US',true),('Goose Creek','SC','US',true),('Myrtle Beach','SC','US',true),
-- WA (3→8)
('Vancouver WA','WA','US',true),('Kent WA','WA','US',true),('Renton WA','WA','US',true),('Federal Way','WA','US',true),('Kirkland WA','WA','US',true),
-- WI (3→8)
('Appleton WI','WI','US',true),('Waukesha','WI','US',true),('Oshkosh WI','WI','US',true),('Eau Claire','WI','US',true),('Janesville WI','WI','US',true),
-- IL (4→8)
('Elgin IL','IL','US',true),('Champaign','IL','US',true),('Decatur IL','IL','US',true),('Bloomington IL','IL','US',true),
-- NC (4→8)
('Winston Salem','NC','US',true),('High Point NC','NC','US',true),('Wilmington NC','NC','US',true),('Concord NC','NC','US',true),
-- OH (4→8)
('Canton OH','OH','US',true),('Youngstown','OH','US',true),('Lorain','OH','US',true),('Parma OH','OH','US',true),
-- TN (4→8)
('Franklin TN','TN','US',true),('Hendersonville TN','TN','US',true),('Kingsport','TN','US',true),('Jackson TN','TN','US',true),
-- VA (4→8)
('Hampton VA','VA','US',true),('Roanoke','VA','US',true),('Lynchburg','VA','US',true),('Suffolk VA','VA','US',true),
-- FL (5→9)
('Tallahassee','FL','US',true),('Sarasota','FL','US',true),('Pembroke Pines','FL','US',true),('Coral Springs','FL','US',true),
-- NY (5→9)
('Yonkers','NY','US',true),('White Plains','NY','US',true),('Utica NY','NY','US',true),('Schenectady','NY','US',true),
-- CA (6→10)
('Stockton CA','CA','US',true),('Fremont CA','CA','US',true),('Modesto','CA','US',true),('Fontana CA','CA','US',true),
-- TX (6→10)
('Amarillo','TX','US',true),('Brownsville TX','TX','US',true),('Midland TX','TX','US',true),('Waco','TX','US',true)
ON CONFLICT (name) DO NOTHING;
;
