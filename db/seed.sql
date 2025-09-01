-- Ryd tabellen (kun til test)
TRUNCATE TABLE public.item RESTART IDENTITY CASCADE;

-- Tops (20)
INSERT INTO public.item (category, description, brand, color, tone, type, season, active) VALUES
('top','Hvid t-shirt','H&M','white','light','tshirt','summer',true),
('top','Sort t-shirt','Zara','black','dark','tshirt','all-season',true),
('top','Blå skjorte','Vero Moda','blue','medium','shirt','spring',true),
('top','Rød bluse','Only','red','medium','blouse','summer',true),
('top','Grøn tanktop','H&M','green','medium','tanktop','summer',true),
('top','Beige cardigan','COS','beige','light','cardigan','autumn',true),
('top','Grå hoodie','Adidas','gray','medium','hoodie','all-season',true),
('top','Sort crop top','Zara','black','dark','croptop','summer',true),
('top','Hvid skjorte','H&M','white','light','shirt','all-season',true),
('top','Blå t-shirt','Nike','blue','medium','tshirt','summer',true),
('top','Rosa bluse','Monki','pink','light','blouse','spring',true),
('top','Lilla top','Only','purple','medium','tanktop','summer',true),
('top','Sort kjole','Vero Moda','black','dark','dress','all-season',true),
('top','Sort skjorte','COS','black','dark','shirt','autumn',true),
('top','Beige bluse','Monki','beige','light','blouse','summer',true),
('top','Gul top','Zara','yellow','light','tanktop','summer',true),
('top','Mørkeblå bluse','H&M','blue','dark','blouse','winter',true),
('top','Orange t-shirt','Only','orange','medium','tshirt','summer',true);

-- Bottoms (20)
INSERT INTO public.item (category, description, brand, color, tone, type, season, active) VALUES
('bottom','Blå jeans','Levis','blue','medium','jeans','all-season',true),
('bottom','Sort nederdel','Monki','black','dark','skirt','summer',true),
('bottom','Beige chinos','Uniqlo','beige','light','pants','spring',true),
('bottom','Grå leggings','H&M','gray','medium','leggings','all-season',true),
('bottom','Sort shorts','Zara','black','dark','shorts','summer',true),
('bottom','Hvide bukser','Only','white','light','pants','summer',true),
('bottom','Grøn nederdel','Monki','green','medium','skirt','spring',true),
('bottom','Blå shorts','Nike','blue','medium','shorts','summer',true),
('bottom','Brune bukser','COS','brown','dark','pants','autumn',true),
('bottom','Røde jeans','Levis','red','medium','jeans','spring',true),
('bottom','Mørkegrå bukser','Zara','gray','dark','pants','winter',true),
('bottom','Beige shorts','H&M','beige','light','shorts','summer',true),
('bottom','Lilla nederdel','Only','purple','medium','skirt','summer',true),
('bottom','Sort jeans','Levis','black','dark','jeans','all-season',true),
('bottom','Blå nederdel','Monki','blue','medium','skirt','spring',true),
('bottom','Hvide jeans','Zara','white','light','jeans','summer',true),
('bottom','Mørkebrun bukser','COS','brown','dark','pants','autumn',true),
('bottom','Grønne jeans','Levis','green','medium','jeans','spring',true),
('bottom','Lyserød nederdel','Only','pink','light','skirt','summer',true),
('bottom','Mørkeblå jeans','H&M','blue','dark','jeans','winter',true);

-- Shoes (20)
INSERT INTO public.item (category, description, brand, color, tone, type, season, active) VALUES
('shoes','Hvide sneakers','Nike','white','light','sneakers','summer',true),
('shoes','Sorte støvler','Dr. Martens','black','dark','boots','winter',true),
('shoes','Sandaler','Birkenstock','brown','medium','sandals','summer',true),
('shoes','Røde højhælede','Aldo','red','medium','heels','all-season',true),
('shoes','Grå sneakers','Adidas','gray','medium','sneakers','all-season',true),
('shoes','Blå loafers','COS','blue','medium','loafers','spring',true),
('shoes','Beige sandaler','H&M','beige','light','sandals','summer',true),
('shoes','Mørkebrune boots','Zara','brown','dark','boots','autumn',true),
('shoes','Sorte loafers','Gucci','black','dark','loafers','spring',true),
('shoes','Grønne sneakers','Nike','green','medium','sneakers','summer',true),
('shoes','Gule sandaler','Birkenstock','yellow','light','sandals','summer',true),
('shoes','Røde sneakers','Adidas','red','medium','sneakers','all-season',true),
('shoes','Sorte højhælede','Aldo','black','dark','heels','all-season',true),
('shoes','Lyserøde sneakers','Nike','pink','light','sneakers','summer',true),
('shoes','Blå støvler','Zara','blue','dark','boots','winter',true),
('shoes','Grå loafers','COS','gray','medium','loafers','spring',true),
('shoes','Brune sandaler','H&M','brown','medium','sandals','summer',true),
('shoes','Mørkeblå sneakers','Nike','blue','dark','sneakers','autumn',true),
('shoes','Orange sneakers','Adidas','orange','medium','sneakers','summer',true),
('shoes','Hvide højhælede','Aldo','white','light','heels','summer',true);

-- Jackets (15)
INSERT INTO public.item (category, description, brand, color, tone, type, season, active) VALUES
('jacket','Denim jakke','Levis','blue','medium','denim_jacket','spring',true),
('jacket','Sort læderjakke','Only','black','dark','leather_jacket','autumn',true),
('jacket','Vinterfrakke','H&M','gray','dark','overcoat','winter',true),
('jacket','Beige trenchcoat','COS','beige','light','trenchcoat','spring',true),
('jacket','Grøn bomberjakke','Zara','green','medium','bomber','autumn',true),
('jacket','Rød frakke','Vero Moda','red','medium','coat','winter',true),
('jacket','Sort blazer','H&M','black','dark','blazer','all-season',true),
('jacket','Grå cardigan-jakke','COS','gray','medium','cardigan','autumn',true),
('jacket','Lyseblå denimjakke','Levis','blue','light','denim_jacket','summer',true),
('jacket','Mørkeblå uldfrakke','Only','blue','dark','coat','winter',true),
('jacket','Brun læderjakke','Zara','brown','dark','leather_jacket','autumn',true),
('jacket','Orange regnjakke','Helly Hansen','orange','medium','raincoat','spring',true),
('jacket','Hvid bomberjakke','Nike','white','light','bomber','summer',true),
('jacket','Pink trenchcoat','H&M','pink','light','trenchcoat','spring',true),
('jacket','Sort vinterfrakke','Vero Moda','black','dark','overcoat','winter',true);

-- Jewelry (15)
INSERT INTO public.item (category, description, brand, color, tone, type, season, active) VALUES
('jewelry','Sølv halskæde','Pandora','silver','light','necklace','all-season',true),
('jewelry','Guld armbånd','Pilgrim','gold','light','bracelet','all-season',true),
('jewelry','Diamant ring','Georg Jensen','white','light','ring','all-season',true),
('jewelry','Perleøreringe','H&M','white','light','earrings','all-season',true),
('jewelry','Sort choker','Zara','black','dark','necklace','all-season',true),
('jewelry','Rød ring','Pilgrim','red','medium','ring','all-season',true),
('jewelry','Blå armbånd','Pandora','blue','medium','bracelet','all-season',true),
('jewelry','Guld halskæde','Pilgrim','gold','light','necklace','all-season',true),
('jewelry','Sølv armbånd','Pandora','silver','light','bracelet','all-season',true),
('jewelry','Grøn ring','H&M','green','medium','ring','all-season',true),
('jewelry','Lyserød halskæde','Zara','pink','light','necklace','summer',true),
('jewelry','Sort armbånd','Only','black','dark','bracelet','autumn',true),
('jewelry','Orange øreringe','H&M','orange','medium','earrings','summer',true),
('jewelry','Lilla halskæde','Pilgrim','purple','medium','necklace','spring',true),
('jewelry','Mørkeblå ring','Pandora','blue','dark','ring','winter',true);

-- Hairclips (10)
INSERT INTO public.item (category, description, brand, color, tone, type, season, active) VALUES
('hairclip','Sort hårklemme','Matas','black','dark','hairclip','all-season',true),
('hairclip','Pink hårspænde','H&M','pink','light','hairclip','summer',true),
('hairclip','Blå hårspænde','Monki','blue','medium','hairclip','spring',true),
('hairclip','Hvid hårklemme','H&M','white','light','hairclip','summer',true),
('hairclip','Grøn hårspænde','Only','green','medium','hairclip','summer',true),
('hairclip','Gul hårklemme','Zara','yellow','light','hairclip','summer',true),
('hairclip','Rød hårspænde','Matas','red','medium','hairclip','summer',true),
('hairclip','Brun hårklemme','H&M','brown','dark','hairclip','autumn',true),
('hairclip','Sølv hårspænde','Pilgrim','silver','light','hairclip','all-season',true),
('hairclip','Guld hårspænde','Pilgrim','gold','light','hairclip','all-season',true);
