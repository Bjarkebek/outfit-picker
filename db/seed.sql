-- Ryd tabellen (kun til test)
TRUNCATE TABLE public.item RESTART IDENTITY CASCADE;

-- Tops (20)
INSERT INTO public.item (category, description, brand, color, tone, type, season, active, owner_id) VALUES
('top','Hvid t-shirt','H&M','white','light','tshirt','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('top','Sort t-shirt','Zara','black','dark','tshirt','all-season',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('top','Blå skjorte','Vero Moda','blue','medium','shirt','spring',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('top','Rød bluse','Only','red','medium','blouse','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('top','Grøn tanktop','H&M','green','medium','tanktop','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('top','Beige cardigan','COS','beige','light','cardigan','autumn',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('top','Grå hoodie','Adidas','gray','medium','hoodie','all-season',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('top','Sort crop top','Zara','black','dark','croptop','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('top','Hvid skjorte','H&M','white','light','shirt','all-season',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('top','Blå t-shirt','Nike','blue','medium','tshirt','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('top','Rosa bluse','Monki','pink','light','blouse','spring',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('top','Lilla top','Only','purple','medium','tanktop','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('top','Sort kjole','Vero Moda','black','dark','dress','all-season',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('top','Sort skjorte','COS','black','dark','shirt','autumn',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('top','Beige bluse','Monki','beige','light','blouse','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('top','Gul top','Zara','yellow','light','tanktop','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('top','Mørkeblå bluse','H&M','blue','dark','blouse','winter',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('top','Orange t-shirt','Only','orange','medium','tshirt','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac');

-- Bottoms (20)
INSERT INTO public.item (category, description, brand, color, tone, type, season, active, owner_id) VALUES
('bottom','Blå jeans','Levis','blue','medium','jeans','all-season',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('bottom','Sort nederdel','Monki','black','dark','skirt','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('bottom','Beige chinos','Uniqlo','beige','light','pants','spring',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('bottom','Grå leggings','H&M','gray','medium','leggings','all-season',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('bottom','Sort shorts','Zara','black','dark','shorts','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('bottom','Hvide bukser','Only','white','light','pants','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('bottom','Grøn nederdel','Monki','green','medium','skirt','spring',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('bottom','Blå shorts','Nike','blue','medium','shorts','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('bottom','Brune bukser','COS','brown','dark','pants','autumn',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('bottom','Røde jeans','Levis','red','medium','jeans','spring',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('bottom','Mørkegrå bukser','Zara','gray','dark','pants','winter',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('bottom','Beige shorts','H&M','beige','light','shorts','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('bottom','Lilla nederdel','Only','purple','medium','skirt','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('bottom','Sort jeans','Levis','black','dark','jeans','all-season',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('bottom','Blå nederdel','Monki','blue','medium','skirt','spring',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('bottom','Hvide jeans','Zara','white','light','jeans','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('bottom','Mørkebrun bukser','COS','brown','dark','pants','autumn',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('bottom','Grønne jeans','Levis','green','medium','jeans','spring',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('bottom','Lyserød nederdel','Only','pink','light','skirt','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('bottom','Mørkeblå jeans','H&M','blue','dark','jeans','winter',true,'df993ff7-5bb6-47c8-9268-d078138d0eac');

-- Shoes (20)
INSERT INTO public.item (category, description, brand, color, tone, type, season, active, owner_id) VALUES
('shoes','Hvide sneakers','Nike','white','light','sneakers','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('shoes','Sorte støvler','Dr. Martens','black','dark','boots','winter',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('shoes','Sandaler','Birkenstock','brown','medium','sandals','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('shoes','Røde højhælede','Aldo','red','medium','heels','all-season',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('shoes','Grå sneakers','Adidas','gray','medium','sneakers','all-season',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('shoes','Blå loafers','COS','blue','medium','loafers','spring',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('shoes','Beige sandaler','H&M','beige','light','sandals','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('shoes','Mørkebrune boots','Zara','brown','dark','boots','autumn',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('shoes','Sorte loafers','Gucci','black','dark','loafers','spring',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('shoes','Grønne sneakers','Nike','green','medium','sneakers','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('shoes','Gule sandaler','Birkenstock','yellow','light','sandals','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('shoes','Røde sneakers','Adidas','red','medium','sneakers','all-season',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('shoes','Sorte højhælede','Aldo','black','dark','heels','all-season',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('shoes','Lyserøde sneakers','Nike','pink','light','sneakers','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('shoes','Blå støvler','Zara','blue','dark','boots','winter',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('shoes','Grå loafers','COS','gray','medium','loafers','spring',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('shoes','Brune sandaler','H&M','brown','medium','sandals','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('shoes','Mørkeblå sneakers','Nike','blue','dark','sneakers','autumn',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('shoes','Orange sneakers','Adidas','orange','medium','sneakers','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('shoes','Hvide højhælede','Aldo','white','light','heels','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac');

-- Jackets (15)
INSERT INTO public.item (category, description, brand, color, tone, type, season, active, owner_id) VALUES
('jacket','Denim jakke','Levis','blue','medium','denim_jacket','spring',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('jacket','Sort læderjakke','Only','black','dark','leather_jacket','autumn',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('jacket','Vinterfrakke','H&M','gray','dark','overcoat','winter',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('jacket','Beige trenchcoat','COS','beige','light','trenchcoat','spring',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('jacket','Grøn bomberjakke','Zara','green','medium','bomber','autumn',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('jacket','Rød frakke','Vero Moda','red','medium','coat','winter',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('jacket','Sort blazer','H&M','black','dark','blazer','all-season',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('jacket','Grå cardigan-jakke','COS','gray','medium','cardigan','autumn',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('jacket','Lyseblå denimjakke','Levis','blue','light','denim_jacket','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('jacket','Mørkeblå uldfrakke','Only','blue','dark','coat','winter',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('jacket','Brun læderjakke','Zara','brown','dark','leather_jacket','autumn',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('jacket','Orange regnjakke','Helly Hansen','orange','medium','raincoat','spring',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('jacket','Hvid bomberjakke','Nike','white','light','bomber','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('jacket','Pink trenchcoat','H&M','pink','light','trenchcoat','spring',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('jacket','Sort vinterfrakke','Vero Moda','black','dark','overcoat','winter',true,'df993ff7-5bb6-47c8-9268-d078138d0eac');

-- Jewelry (15)
INSERT INTO public.item (category, description, brand, color, tone, type, season, active, owner_id) VALUES
('jewelry','Sølv halskæde','Pandora','silver','light','necklace','all-season',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('jewelry','Guld armbånd','Pilgrim','gold','light','bracelet','all-season',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('jewelry','Diamant ring','Georg Jensen','white','light','ring','all-season',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('jewelry','Perleøreringe','H&M','white','light','earrings','all-season',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('jewelry','Sort choker','Zara','black','dark','necklace','all-season',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('jewelry','Rød ring','Pilgrim','red','medium','ring','all-season',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('jewelry','Blå armbånd','Pandora','blue','medium','bracelet','all-season',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('jewelry','Guld halskæde','Pilgrim','gold','light','necklace','all-season',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('jewelry','Sølv armbånd','Pandora','silver','light','bracelet','all-season',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('jewelry','Grøn ring','H&M','green','medium','ring','all-season',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('jewelry','Lyserød halskæde','Zara','pink','light','necklace','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('jewelry','Sort armbånd','Only','black','dark','bracelet','autumn',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('jewelry','Orange øreringe','H&M','orange','medium','earrings','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('jewelry','Lilla halskæde','Pilgrim','purple','medium','necklace','spring',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('jewelry','Mørkeblå ring','Pandora','blue','dark','ring','winter',true,'df993ff7-5bb6-47c8-9268-d078138d0eac');

-- Hairclips (10)
INSERT INTO public.item (category, description, brand, color, tone, type, season, active, owner_id) VALUES
('hairclip','Sort hårklemme','Matas','black','dark','hairclip','all-season',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('hairclip','Pink hårspænde','H&M','pink','light','hairclip','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('hairclip','Blå hårspænde','Monki','blue','medium','hairclip','spring',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('hairclip','Hvid hårklemme','H&M','white','light','hairclip','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('hairclip','Grøn hårspænde','Only','green','medium','hairclip','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('hairclip','Gul hårklemme','Zara','yellow','light','hairclip','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('hairclip','Rød hårspænde','Matas','red','medium','hairclip','summer',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('hairclip','Brun hårklemme','H&M','brown','dark','hairclip','autumn',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('hairclip','Sølv hårspænde','Pilgrim','silver','light','hairclip','all-season',true,'df993ff7-5bb6-47c8-9268-d078138d0eac'),
('hairclip','Guld hårspænde','Pilgrim','gold','light','hairclip','all-season',true,'df993ff7-5bb6-47c8-9268-d078138d0eac');
