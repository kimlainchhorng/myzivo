
INSERT INTO public.cities (name, state, country, is_active) VALUES
-- AZ (7→13)
('Goodyear AZ','AZ','US',true),('Avondale AZ','AZ','US',true),('Flagstaff','AZ','US',true),('Buckeye AZ','AZ','US',true),('Casa Grande','AZ','US',true),('Maricopa AZ','AZ','US',true),
-- KS (7→13)
('Hutchinson KS','KS','US',true),('Shawnee KS','KS','US',true),('Leavenworth','KS','US',true),('Garden City KS','KS','US',true),('Derby KS','KS','US',true),('Emporia KS','KS','US',true),
-- AK (7→12)
('Ketchikan','AK','US',true),('Homer AK','AK','US',true),('Bethel AK','AK','US',true),('Nome','AK','US',true),('Seward AK','AK','US',true),
-- DE (7→12)
('Dover DE','DE','US',true),('Rehoboth Beach','DE','US',true),('Claymont','DE','US',true),('Elsmere DE','DE','US',true),('Harrington DE','DE','US',true),
-- HI (7→12)
('Kaneohe','HI','US',true),('Wailuku','HI','US',true),('Kapaa','HI','US',true),('Lihue','HI','US',true),('Wailea','HI','US',true),
-- ND (7→12)
('Devils Lake','ND','US',true),('Grafton ND','ND','US',true),('Rugby ND','ND','US',true),('Bottineau','ND','US',true),('Harvey ND','ND','US',true),
-- RI (7→12)
('Central Falls','RI','US',true),('North Providence','RI','US',true),('Smithfield RI','RI','US',true),('Johnston RI','RI','US',true),('Barrington RI','RI','US',true),
-- SD (7→12)
('Spearfish','SD','US',true),('Box Elder SD','SD','US',true),('Brandon SD','SD','US',true),('Sturgis SD','SD','US',true),('Madison SD','SD','US',true),
-- UT (7→12)
('Taylorsville UT','UT','US',true),('South Jordan UT','UT','US',true),('Murray UT','UT','US',true),('Bountiful','UT','US',true),('Draper UT','UT','US',true),
-- VT (7→12)
('Bennington VT','VT','US',true),('Woodstock VT','VT','US',true),('Vergennes','VT','US',true),('Hartford VT','VT','US',true),('Northfield VT','VT','US',true),
-- DC (6→12)
('Anacostia','DC','US',true),('Columbia Heights DC','DC','US',true),('Shaw DC','DC','US',true),('NoMa DC','DC','US',true),('H Street DC','DC','US',true),('Chevy Chase DC','DC','US',true),
-- AR (8→13)
('Cabot AR','AR','US',true),('Searcy','AR','US',true),('Russellville AR','AR','US',true),('Sherwood AR','AR','US',true),('Texarkana AR','AR','US',true),
-- IA (8→13)
('Marion IA','IA','US',true),('Mason City','IA','US',true),('Fort Dodge','IA','US',true),('Bettendorf','IA','US',true),('Urbandale','IA','US',true),
-- ID (8→13)
('Eagle ID','ID','US',true),('Post Falls','ID','US',true),('Hayden ID','ID','US',true),('Ammon','ID','US',true),('Chubbuck','ID','US',true),
-- MD (8→13)
('Towson','MD','US',true),('Dundalk','MD','US',true),('Waldorf MD','MD','US',true),('Glen Burnie','MD','US',true),('Ellicott City','MD','US',true),
-- ME (8→13)
('Windham ME','ME','US',true),('Brunswick ME','ME','US',true),('Kennebunk','ME','US',true),('Waterville ME','ME','US',true),('Saco','ME','US',true),
-- MS (8→13)
('Columbus MS','MS','US',true),('Clinton MS','MS','US',true),('Brandon MS','MS','US',true),('Laurel MS','MS','US',true),('Pascagoula','MS','US',true),
-- MT (8→13)
('Belgrade MT','MT','US',true),('Livingston MT','MT','US',true),('Laurel MT','MT','US',true),('Sidney MT','MT','US',true),('Polson','MT','US',true),
-- NE (8→13)
('La Vista','NE','US',true),('Scottsbluff','NE','US',true),('South Sioux City','NE','US',true),('Gering','NE','US',true),('Ralston NE','NE','US',true),
-- NH (8→13)
('Hanover NH','NH','US',true),('Exeter NH','NH','US',true),('Derry NH','NH','US',true),('Salem NH','NH','US',true),('Merrimack NH','NH','US',true),
-- NM (8→13)
('Los Lunas','NM','US',true),('Alamogordo','NM','US',true),('Sunland Park','NM','US',true),('Las Vegas NM','NM','US',true),('Grants NM','NM','US',true),
-- NV (8→13)
('Summerlin','NV','US',true),('Pahrump','NV','US',true),('Spring Valley NV','NV','US',true),('Enterprise NV','NV','US',true),('Whitney NV','NV','US',true),
-- WV (8→13)
('Bluefield WV','WV','US',true),('South Charleston WV','WV','US',true),('Vienna WV','WV','US',true),('Bridgeport WV','WV','US',true),('Nitro WV','WV','US',true),
-- WY (8→13)
('Powell WY','WY','US',true),('Torrington WY','WY','US',true),('Rawlins','WY','US',true),('Lander WY','WY','US',true),('Douglas WY','WY','US',true)
ON CONFLICT (name) DO NOTHING;
;
