
-- Seed categories
insert into public.bbq_menu_categories (name, slug, description, sort_order, image_url) values
('BBQ Mains','bbq-mains','Smoked low & slow, served fast.',1,'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80'),
('Burgers & Sandwiches','burgers','Stacked high with house-smoked meats.',2,'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80'),
('Sides','sides','Classic BBQ sides done right.',3,'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=800&q=80'),
('Drinks','drinks','Cold drinks to cool the heat.',4,'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80'),
('Desserts','desserts','Sweet endings.',5,'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80')
on conflict (slug) do nothing;

-- Seed items
with c as (select id, slug from public.bbq_menu_categories)
insert into public.bbq_menu_items (category_id, name, slug, description, price_cents, image_url, is_featured, prep_time_minutes, spicy_level, sort_order)
select c.id, x.name, x.slug, x.description, x.price_cents, x.image_url, x.featured, x.prep, x.spicy, x.sort
from c
join (values
  ('bbq-mains','Smoked Pork Ribs (Full Rack)','smoked-pork-ribs-full','Slow-smoked St. Louis cut, hickory rub, house BBQ sauce.', 2495,'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80', true, 20, 1, 1),
  ('bbq-mains','Beef Brisket Plate','beef-brisket-plate','12-hour smoked brisket, sliced to order. Served with 2 sides.', 1895,'https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=80', true, 15, 0, 2),
  ('bbq-mains','BBQ Chicken Half','bbq-chicken-half','Half chicken, dry rubbed, basted with Carolina gold.', 1295,'https://images.unsplash.com/photo-1626082929543-5bab6f17c248?w=800&q=80', false, 18, 1, 3),
  ('bbq-mains','Smoked Sausage Links','smoked-sausage-links','House-made jalapeño cheddar links.', 1095,'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80', false, 12, 2, 4),
  ('bbq-mains','Pulled Pork Bowl','pulled-pork-bowl','Pulled pork over slaw and rice, drizzle of vinegar sauce.', 1195,'https://images.unsplash.com/photo-1513185158878-8d8c2a2a3da3?w=800&q=80', false, 12, 0, 5),
  ('burgers','BBQ Brisket Burger','bbq-brisket-burger','Smashed patty, brisket chunks, cheddar, pickled onion.', 1295,'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80', true, 15, 1, 1),
  ('burgers','Pulled Pork Sandwich','pulled-pork-sandwich','Brioche bun, pulled pork, slaw, pickles.', 995,'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&q=80', false, 12, 0, 2),
  ('burgers','Spicy Chicken Sandwich','spicy-chicken-sandwich','Crispy chicken, Nashville hot, pickles, ranch.', 1095,'https://images.unsplash.com/photo-1606755456206-b25206cde27e?w=800&q=80', false, 14, 3, 3),
  ('sides','Mac & Cheese','mac-and-cheese','Three-cheese, crispy bread-crumb top.', 595,'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=800&q=80', false, 8, 0, 1),
  ('sides','Coleslaw','coleslaw','Crunchy, tangy, cooling.', 395,'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?w=800&q=80', false, 5, 0, 2),
  ('sides','Cornbread','cornbread','Honey butter on the side.', 395,'https://images.unsplash.com/photo-1583338917496-7a8e02b65bba?w=800&q=80', false, 5, 0, 3),
  ('sides','Smoked Beans','smoked-beans','Slow-cooked with brisket trimmings.', 495,'https://images.unsplash.com/photo-1547308283-b941a14638f3?w=800&q=80', false, 5, 0, 4),
  ('sides','Fries','seasoned-fries','Hand-cut, BBQ-spice dusted.', 395,'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80', false, 6, 0, 5),
  ('drinks','Sweet Tea','sweet-tea','Southern style, refillable.', 295,'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80', false, 2, 0, 1),
  ('drinks','Lemonade','lemonade','Fresh-squeezed.', 295,'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800&q=80', false, 2, 0, 2),
  ('drinks','Iced Coffee','iced-coffee','Cold brew, smooth.', 350,'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&q=80', false, 3, 0, 3),
  ('drinks','Coca-Cola','coca-cola','Classic.', 195,'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80', false, 1, 0, 4),
  ('desserts','Banana Pudding','banana-pudding','Layered with vanilla wafers.', 495,'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80', false, 3, 0, 1),
  ('desserts','Pecan Pie Slice','pecan-pie','Buttery, sticky, perfect.', 495,'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800&q=80', false, 3, 0, 2)
) as x(cat_slug, name, slug, description, price_cents, image_url, featured, prep, spicy, sort)
on x.cat_slug = c.slug
on conflict (slug) do nothing;

-- Seed promo code
insert into public.bbq_promo_codes (code, description, discount_type, discount_value, min_subtotal_cents)
values
  ('WELCOME10','10% off your first order','percent',10,0),
  ('FREEDELIVERY','Free delivery on $15+ orders','fixed',200,1500)
on conflict (code) do nothing;
;
