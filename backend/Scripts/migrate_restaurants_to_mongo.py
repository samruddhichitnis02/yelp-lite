import sys
import os
import re
import csv
from io import StringIO
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mongodb import db as mongo_db


SQL_INSERT = r"""
INSERT INTO restaurants (owner_id, name, address, city, state, zip_code, cuisine, price_range, phone, website, description, image, avg_rating, created_at, created_by_user_id, hours_of_operation, amenities) VALUES
(NULL, 'Bella Italia', '100 Columbus Ave', 'San Francisco', 'CA', '94133', 'Italian', '$$', '415-100-0001', 'https://bellaitalia.com', 'Authentic Italian cuisine with homemade pasta', NULL, 4.5, NOW(), 1, 'Mon-Sun 11AM-10PM', 'wifi,outdoor seating'),
(NULL, 'Sakura Garden', '200 Geary St', 'San Francisco', 'CA', '94102', 'Japanese', '$$$', '415-100-0002', 'https://sakuragarden.com', 'Premium sushi and Japanese fusion dishes', NULL, 4.7, NOW(), 1, 'Mon-Sun 12PM-11PM', 'parking,reservations'),
(NULL, 'Taco Loco', '300 Mission St', 'San Jose', 'CA', '95110', 'Mexican', '$', '408-100-0003', 'https://tacoloco.com', 'Authentic Mexican street tacos and burritos', NULL, 4.3, NOW(), 1, 'Mon-Sun 9AM-10PM', 'outdoor seating'),
(NULL, 'The Vegan Corner', '400 Castro St', 'Mountain View', 'CA', '94041', 'Vegan', '$$', '650-100-0004', 'https://vegancorner.com', 'Creative plant-based dishes for everyone', NULL, 4.6, NOW(), 1, 'Mon-Sat 10AM-9PM', 'wifi,outdoor seating'),
(NULL, 'Spice Route', '500 El Camino Real', 'Sunnyvale', 'CA', '94087', 'Indian', '$$', '408-100-0005', 'https://spiceroute.com', 'Traditional Indian curries and tandoor dishes', NULL, 4.4, NOW(), 1, 'Mon-Sun 11AM-10PM', 'parking,reservations'),
(NULL, 'Golden Dragon', '600 Grant Ave', 'San Francisco', 'CA', '94108', 'Chinese', '$$', '415-100-0006', 'https://goldendragon.com', 'Classic Cantonese cuisine in the heart of Chinatown', NULL, 4.2, NOW(), 1, 'Mon-Sun 10AM-11PM', 'parking'),
(NULL, 'Le Petit Bistro', '700 Union St', 'San Francisco', 'CA', '94133', 'French', '$$$', '415-100-0007', 'https://lepetitbistro.com', 'Cozy French bistro with classic Parisian dishes', NULL, 4.8, NOW(), 1, 'Tue-Sun 5PM-10PM', 'reservations,romantic'),
(NULL, 'Seoul Kitchen', '800 Saratoga Ave', 'San Jose', 'CA', '95117', 'Korean', '$$', '408-100-0008', 'https://seoulkitchen.com', 'Korean BBQ and traditional Korean dishes', NULL, 4.5, NOW(), 1, 'Mon-Sun 11AM-11PM', 'parking,outdoor seating'),
(NULL, 'Mediterranean Breeze', '900 Stevens Creek Blvd', 'Cupertino', 'CA', '95014', 'Mediterranean', '$$', '408-100-0009', 'https://medbreeze.com', 'Fresh Mediterranean food with a California twist', NULL, 4.3, NOW(), 1, 'Mon-Sat 11AM-9PM', 'wifi,outdoor seating,parking'),
(NULL, 'Bangkok Thai', '1000 Blossom Hill Rd', 'San Jose', 'CA', '95123', 'Thai', '$', '408-100-0010', 'https://bangkokthai.com', 'Authentic Thai cuisine with bold flavors', NULL, 4.4, NOW(), 1, 'Mon-Sun 11AM-10PM', 'parking'),
(NULL, 'The Smokehouse', '101 BBQ Lane', 'San Jose', 'CA', '95112', 'BBQ', '$$', '408-100-0011', 'https://thesmokehouse.com', 'Slow smoked meats and classic BBQ sides', NULL, 4.6, NOW(), 1, 'Wed-Sun 11AM-9PM', 'outdoor seating,parking'),
(NULL, 'Pasta Paradise', '202 Olive St', 'Santa Clara', 'CA', '95050', 'Italian', '$$', '408-100-0012', 'https://pastaparadise.com', 'Handmade pasta and wood-fired pizza', NULL, 4.7, NOW(), 1, 'Mon-Sun 12PM-10PM', 'wifi,reservations'),
(NULL, 'Burger Republic', '303 Hamilton Ave', 'Palo Alto', 'CA', '94301', 'American', '$', '650-100-0013', 'https://burgerrepublic.com', 'Gourmet burgers made with fresh ingredients', NULL, 4.2, NOW(), 1, 'Mon-Sun 10AM-11PM', 'outdoor seating'),
(NULL, 'Green Bowl', '404 Evelyn Ave', 'Mountain View', 'CA', '94041', 'Vegan', '$', '650-100-0014', 'https://greenbowl.com', 'Healthy grain bowls and salads for every diet', NULL, 4.5, NOW(), 1, 'Mon-Fri 9AM-8PM', 'wifi,outdoor seating'),
(NULL, 'Curry House', '505 Lawrence Expwy', 'Sunnyvale', 'CA', '94085', 'Indian', '$', '408-100-0015', 'https://curryhouse.com', 'Budget-friendly Indian curries and biryanis', NULL, 4.1, NOW(), 1, 'Mon-Sun 11AM-10PM', 'parking'),
(NULL, 'Pho Saigon', '606 Story Rd', 'San Jose', 'CA', '95122', 'Vietnamese', '$', '408-100-0016', 'https://phosaigon.com', 'Traditional Vietnamese pho and banh mi', NULL, 4.4, NOW(), 1, 'Mon-Sun 8AM-9PM', 'parking'),
(NULL, 'Tapas Bar Madrid', '707 Castro St', 'San Francisco', 'CA', '94114', 'Spanish', '$$$', '415-100-0017', 'https://tapasbar.com', 'Spanish tapas and an extensive wine list', NULL, 4.6, NOW(), 1, 'Tue-Sun 5PM-11PM', 'reservations,romantic,wifi'),
(NULL, 'Sichuan Palace', '808 Tully Rd', 'San Jose', 'CA', '95111', 'Chinese', '$', '408-100-0018', 'https://sichuanpalace.com', 'Spicy Sichuan dishes and dim sum', NULL, 4.3, NOW(), 1, 'Mon-Sun 10AM-10PM', 'parking'),
(NULL, 'The Steakhouse', '909 Winchester Blvd', 'Campbell', 'CA', '95008', 'American', '$$$$', '408-100-0019', 'https://thesteakhouse.com', 'Premium dry-aged steaks and fine dining', NULL, 4.8, NOW(), 1, 'Mon-Sun 5PM-11PM', 'reservations,romantic,parking'),
(NULL, 'Ramen Ichiban', '1010 Saratoga Ave', 'San Jose', 'CA', '95129', 'Japanese', '$$', '408-100-0020', 'https://ramenichiban.com', 'Rich tonkotsu and miso ramen bowls', NULL, 4.5, NOW(), 1, 'Mon-Sun 11AM-10PM', 'outdoor seating'),
(NULL, 'Greek Islands', '111 Santana Row', 'San Jose', 'CA', '95128', 'Mediterranean', '$$$', '408-100-0021', 'https://greekislands.com', 'Authentic Greek food with fresh seafood', NULL, 4.4, NOW(), 1, 'Mon-Sun 12PM-10PM', 'outdoor seating,reservations'),
(NULL, 'Falafel House', '222 El Camino Real', 'Santa Clara', 'CA', '95051', 'Mediterranean', '$', '408-100-0022', 'https://falafelhouse.com', 'Fresh falafel wraps and hummus plates', NULL, 4.2, NOW(), 1, 'Mon-Sat 10AM-9PM', 'wifi'),
(NULL, 'Dim Sum Palace', '333 Jackson St', 'San Francisco', 'CA', '94111', 'Chinese', '$$', '415-100-0023', 'https://dimsumpalace.com', 'Traditional Cantonese dim sum all day', NULL, 4.6, NOW(), 1, 'Mon-Sun 9AM-3PM', 'parking,reservations'),
(NULL, 'Churrasqueira', '444 Bascom Ave', 'San Jose', 'CA', '95128', 'Brazilian', '$$', '408-100-0024', 'https://churrasqueira.com', 'Brazilian churrasco and all-you-can-eat meats', NULL, 4.5, NOW(), 1, 'Mon-Sun 12PM-10PM', 'parking'),
(NULL, 'Naan Stop', '555 Mathilda Ave', 'Sunnyvale', 'CA', '94086', 'Indian', '$', '408-100-0025', 'https://naanstop.com', 'Quick Indian street food and naan wraps', NULL, 4.3, NOW(), 1, 'Mon-Sun 10AM-10PM', 'wifi,outdoor seating'),
(NULL, 'Izakaya Yuki', '666 Post St', 'San Francisco', 'CA', '94109', 'Japanese', '$$$', '415-100-0026', 'https://izakayayuki.com', 'Japanese pub-style food and sake', NULL, 4.7, NOW(), 1, 'Mon-Sun 5PM-12AM', 'reservations,romantic'),
(NULL, 'Tacos El Rey', '777 Alum Rock Ave', 'San Jose', 'CA', '95116', 'Mexican', '$', '408-100-0027', 'https://tacoselrey.com', 'Authentic Mexican tacos al pastor and carnitas', NULL, 4.4, NOW(), 1, 'Mon-Sun 8AM-11PM', 'outdoor seating'),
(NULL, 'The French Press', '888 Lincoln Ave', 'San Jose', 'CA', '95125', 'French', '$$', '408-100-0028', 'https://thefrenchpress.com', 'French cafe with crepes, croissants and coffee', NULL, 4.5, NOW(), 1, 'Mon-Sat 7AM-5PM', 'wifi,outdoor seating'),
(NULL, 'Lotus Vietnamese', '999 Story Rd', 'San Jose', 'CA', '95122', 'Vietnamese', '$', '408-100-0029', 'https://lotusviet.com', 'Fresh spring rolls and Vietnamese noodle soups', NULL, 4.3, NOW(), 1, 'Mon-Sun 9AM-9PM', 'parking'),
(NULL, 'Pizza Napoli', '1111 Stevens Creek Blvd', 'San Jose', 'CA', '95129', 'Italian', '$$', '408-100-0030', 'https://pizzanapoli.com', 'Neapolitan style wood-fired pizza', NULL, 4.6, NOW(), 1, 'Mon-Sun 11AM-11PM', 'outdoor seating,wifi'),
(NULL, 'Pad Thai House', '1212 Meridian Ave', 'San Jose', 'CA', '95125', 'Thai', '$', '408-100-0031', 'https://padthaihouse.com', 'Classic Thai noodles and curries', NULL, 4.2, NOW(), 1, 'Mon-Sun 11AM-10PM', 'parking'),
(NULL, 'Umami Burger', '1313 Burbank Ave', 'Santa Clara', 'CA', '95051', 'American', '$$', '408-100-0032', 'https://umamiburger.com', 'Gourmet burgers with Japanese-inspired flavors', NULL, 4.4, NOW(), 1, 'Mon-Sun 11AM-11PM', 'outdoor seating'),
(NULL, 'Havana Nights', '1414 The Alameda', 'San Jose', 'CA', '95126', 'Cuban', '$$', '408-100-0033', 'https://havananights.com', 'Cuban sandwiches and tropical cocktails', NULL, 4.3, NOW(), 1, 'Tue-Sun 12PM-10PM', 'outdoor seating,romantic'),
(NULL, 'Sushi Roku', '1515 Santana Row', 'San Jose', 'CA', '95128', 'Japanese', '$$$', '408-100-0034', 'https://sushiroku.com', 'Modern Japanese cuisine and omakase', NULL, 4.8, NOW(), 1, 'Mon-Sun 12PM-11PM', 'reservations,romantic'),
(NULL, 'Veggie Delight', '1616 Willow St', 'San Jose', 'CA', '95125', 'Vegan', '$', '408-100-0035', 'https://veggiedelight.com', 'Extensive vegan menu with seasonal specials', NULL, 4.5, NOW(), 1, 'Mon-Sat 10AM-8PM', 'wifi,outdoor seating'),
(NULL, 'Bombay Dreams', '1717 De Anza Blvd', 'Cupertino', 'CA', '95014', 'Indian', '$$', '408-100-0036', 'https://bombaydreams.com', 'North and South Indian cuisine', NULL, 4.4, NOW(), 1, 'Mon-Sun 11AM-10PM', 'parking,reservations'),
(NULL, 'Casa Mexico', '1818 Meridian Ave', 'San Jose', 'CA', '95124', 'Mexican', '$$', '408-100-0037', 'https://casamexico.com', 'Sit-down Mexican dining with margaritas', NULL, 4.3, NOW(), 1, 'Mon-Sun 11AM-10PM', 'outdoor seating,parking'),
(NULL, 'Seoul BBQ', '1919 Saratoga Ave', 'San Jose', 'CA', '95117', 'Korean', '$$$', '408-100-0038', 'https://seoulbbq.com', 'Premium Korean BBQ with tableside grilling', NULL, 4.7, NOW(), 1, 'Mon-Sun 12PM-11PM', 'parking,reservations'),
(NULL, 'Pita Palace', '2020 El Camino Real', 'Sunnyvale', 'CA', '94087', 'Mediterranean', '$', '408-100-0039', 'https://pitapalace.com', 'Fresh pita wraps and Mediterranean salads', NULL, 4.1, NOW(), 1, 'Mon-Sat 10AM-9PM', 'wifi'),
(NULL, 'Ristorante Roma', '2121 Stevens Creek Blvd', 'Cupertino', 'CA', '95014', 'Italian', '$$$', '408-100-0040', 'https://ristoranteroma.com', 'Fine Italian dining with imported ingredients', NULL, 4.8, NOW(), 1, 'Tue-Sun 5PM-10PM', 'reservations,romantic,parking'),
(NULL, 'Dragon Wok', '2222 Tully Rd', 'San Jose', 'CA', '95122', 'Chinese', '$', '408-100-0041', 'https://dragonwok.com', 'Quick Chinese stir-fry and noodle dishes', NULL, 4.0, NOW(), 1, 'Mon-Sun 10AM-10PM', 'parking'),
(NULL, 'La Boulangerie', '2323 Lincoln Ave', 'San Jose', 'CA', '95125', 'French', '$$', '408-100-0042', 'https://laboulangerie.com', 'Artisan French bakery and cafe', NULL, 4.6, NOW(), 1, 'Mon-Sat 6AM-6PM', 'wifi,outdoor seating'),
(NULL, 'Pho 99', '2424 McLaughlin Ave', 'San Jose', 'CA', '95121', 'Vietnamese', '$', '408-100-0043', 'https://pho99.com', 'Best pho in town open early morning', NULL, 4.3, NOW(), 1, 'Mon-Sun 7AM-9PM', 'parking'),
(NULL, 'Tandoori Flames', '2525 Hostetter Rd', 'San Jose', 'CA', '95132', 'Indian', '$$', '408-100-0044', 'https://tandooriflames.com', 'Tandoori specialties and Indian street food', NULL, 4.4, NOW(), 1, 'Mon-Sun 11AM-10PM', 'parking,wifi'),
(NULL, 'Yucatan Grill', '2626 Almaden Rd', 'San Jose', 'CA', '95125', 'Mexican', '$$', '408-100-0045', 'https://yucatangrill.com', 'Yucatan style Mexican food with fresh ingredients', NULL, 4.2, NOW(), 1, 'Mon-Sun 11AM-10PM', 'outdoor seating'),
(NULL, 'Udon House', '2727 Bascom Ave', 'Campbell', 'CA', '95008', 'Japanese', '$$', '408-100-0046', 'https://udonhouse.com', 'Japanese udon noodles in rich broths', NULL, 4.5, NOW(), 1, 'Mon-Sun 11AM-9PM', 'parking'),
(NULL, 'Smoky Bones', '2828 Camden Ave', 'San Jose', 'CA', '95124', 'BBQ', '$$', '408-100-0047', 'https://smokybones.com', 'Texas style BBQ with homemade sauces', NULL, 4.6, NOW(), 1, 'Wed-Sun 11AM-9PM', 'outdoor seating,parking'),
(NULL, 'The Salad Bar', '2929 Blossom Hill Rd', 'San Jose', 'CA', '95123', 'Vegan', '$', '408-100-0048', 'https://thesaladbar.com', 'Build your own salad with fresh toppings', NULL, 4.1, NOW(), 1, 'Mon-Fri 10AM-7PM', 'wifi'),
(NULL, 'Spice Garden', '3030 Monterey Rd', 'San Jose', 'CA', '95111', 'Indian', '$', '408-100-0049', 'https://spicegarden.com', 'Affordable Indian lunch buffet and dinner', NULL, 4.0, NOW(), 1, 'Mon-Sun 11AM-10PM', 'parking'),
(NULL, 'Carbone Italian', '3131 Meridian Ave', 'San Jose', 'CA', '95124', 'Italian', '$$$', '408-100-0050', 'https://carboneitalian.com', 'Classic red sauce Italian-American dishes', NULL, 4.7, NOW(), 1, 'Mon-Sun 5PM-11PM', 'reservations,romantic'),
(NULL, 'Wok This Way', '3232 Pearl Ave', 'San Jose', 'CA', '95136', 'Chinese', '$', '408-100-0051', 'https://wokthisway.com', 'Fast casual Chinese with fresh wok cooking', NULL, 4.2, NOW(), 1, 'Mon-Sun 10AM-9PM', 'parking'),
(NULL, 'Bibimbap House', '3333 Snell Ave', 'San Jose', 'CA', '95136', 'Korean', '$$', '408-100-0052', 'https://bibimbaphouse.com', 'Korean comfort food and stone bowl bibimbap', NULL, 4.4, NOW(), 1, 'Mon-Sun 11AM-10PM', 'parking'),
(NULL, 'El Rancho', '3434 Capitol Expwy', 'San Jose', 'CA', '95148', 'Mexican', '$', '408-100-0053', 'https://elrancho.com', 'Family style Mexican with large portions', NULL, 4.3, NOW(), 1, 'Mon-Sun 8AM-10PM', 'outdoor seating,parking'),
(NULL, 'Olive Branch', '3535 Almaden Expwy', 'San Jose', 'CA', '95118', 'Mediterranean', '$$', '408-100-0054', 'https://olivebranch.com', 'Lebanese and Mediterranean mezze platters', NULL, 4.5, NOW(), 1, 'Mon-Sat 11AM-9PM', 'wifi,outdoor seating'),
(NULL, 'Saffron Indian', '3636 Quimby Rd', 'San Jose', 'CA', '95148', 'Indian', '$$', '408-100-0055', 'https://saffronindian.com', 'Royal Indian cuisine with aromatic spices', NULL, 4.6, NOW(), 1, 'Mon-Sun 11AM-10PM', 'parking,reservations'),
(NULL, 'Yakitori Tora', '3737 Blossom Hill Rd', 'Los Gatos', 'CA', '95032', 'Japanese', '$$$', '408-100-0056', 'https://yakitoritora.com', 'Japanese charcoal grilled skewers and sake', NULL, 4.7, NOW(), 1, 'Tue-Sun 5PM-11PM', 'reservations,romantic'),
(NULL, 'Pho Bac', '3838 Senter Rd', 'San Jose', 'CA', '95111', 'Vietnamese', '$', '408-100-0057', 'https://phobac.com', 'Northern Vietnamese pho and vermicelli bowls', NULL, 4.2, NOW(), 1, 'Mon-Sun 8AM-8PM', 'parking'),
(NULL, 'Chipotle Style', '3939 Oakridge Mall', 'San Jose', 'CA', '95123', 'Mexican', '$', '408-100-0058', 'https://chipotlestyle.com', 'Build your own burrito bowl fast casual style', NULL, 4.0, NOW(), 1, 'Mon-Sun 10AM-10PM', 'wifi,outdoor seating'),
(NULL, 'Trattoria Venezia', '4040 Winchester Blvd', 'Los Gatos', 'CA', '95032', 'Italian', '$$$', '408-100-0059', 'https://trattoriavenezia.com', 'Northern Italian cuisine with fresh truffles', NULL, 4.9, NOW(), 1, 'Tue-Sun 5PM-10PM', 'reservations,romantic,parking'),
(NULL, 'Kimchi House', '4141 Union Ave', 'San Jose', 'CA', '95124', 'Korean', '$', '408-100-0060', 'https://kimchihouse.com', 'Korean home cooking with banchan and kimchi', NULL, 4.3, NOW(), 1, 'Mon-Sun 11AM-9PM', 'parking'),
(NULL, 'Cafe Marrakech', '4242 Almaden Rd', 'San Jose', 'CA', '95118', 'Mediterranean', '$$$', '408-100-0061', 'https://cafemarrakech.com', 'Moroccan tagines and couscous in a cozy setting', NULL, 4.6, NOW(), 1, 'Tue-Sun 5PM-10PM', 'romantic,reservations'),
(NULL, 'Mango Tree Thai', '4343 Blossom Hill Rd', 'San Jose', 'CA', '95118', 'Thai', '$$', '408-100-0062', 'https://mangotree.com', 'Thai food with a modern twist and mango desserts', NULL, 4.4, NOW(), 1, 'Mon-Sun 11AM-10PM', 'outdoor seating'),
(NULL, 'The Breakfast Club', '4444 Lincoln Ave', 'San Jose', 'CA', '95125', 'American', '$', '408-100-0063', 'https://thebreakfastclub.com', 'All day breakfast with classic American comfort food', NULL, 4.5, NOW(), 1, 'Mon-Sun 7AM-3PM', 'wifi,outdoor seating'),
(NULL, 'Dosa Corner', '4545 Fremont Ave', 'Sunnyvale', 'CA', '94087', 'Indian', '$', '408-100-0064', 'https://dosacorner.com', 'South Indian dosas and idlis', NULL, 4.4, NOW(), 1, 'Mon-Sun 8AM-9PM', 'parking'),
(NULL, 'Noodle Bar', '4646 El Camino Real', 'Los Altos', 'CA', '94022', 'Chinese', '$', '650-100-0065', 'https://noodlebar.com', 'Hand pulled noodles and Chinese dumplings', NULL, 4.3, NOW(), 1, 'Mon-Sun 11AM-9PM', 'parking'),
(NULL, 'La Piazza', '4747 Stevens Creek Blvd', 'San Jose', 'CA', '95129', 'Italian', '$$', '408-100-0066', 'https://lapiazza.com', 'Roman style pizza al taglio and antipasti', NULL, 4.5, NOW(), 1, 'Mon-Sun 11AM-10PM', 'outdoor seating'),
(NULL, 'Tikka Masala House', '4848 Hostetter Rd', 'San Jose', 'CA', '95132', 'Indian', '$$', '408-100-0067', 'https://tikkamasala.com', 'Butter chicken and tikka masala specialists', NULL, 4.6, NOW(), 1, 'Mon-Sun 11AM-10PM', 'parking,wifi'),
(NULL, 'Tacos de Birria', '4949 Alum Rock Ave', 'San Jose', 'CA', '95127', 'Mexican', '$', '408-100-0068', 'https://tacosdebirria.com', 'Authentic birria tacos with consomme', NULL, 4.7, NOW(), 1, 'Mon-Sun 9AM-10PM', 'outdoor seating'),
(NULL, 'Shoyu Ramen', '5050 Saratoga Ave', 'San Jose', 'CA', '95129', 'Japanese', '$$', '408-100-0069', 'https://shoyuramen.com', 'Tokyo style shoyu ramen and gyoza', NULL, 4.5, NOW(), 1, 'Mon-Sun 11AM-10PM', 'parking'),
(NULL, 'Green Leaf Cafe', '5151 Castro St', 'Mountain View', 'CA', '94041', 'Vegan', '$', '650-100-0070', 'https://greenleafcafe.com', '100 percent vegan menu with seasonal ingredients', NULL, 4.4, NOW(), 1, 'Mon-Sat 9AM-8PM', 'wifi,outdoor seating'),
(NULL, 'Santorini Greek', '5252 El Camino Real', 'Palo Alto', 'CA', '94306', 'Mediterranean', '$$$', '650-100-0071', 'https://santorinigreek.com', 'Authentic Greek cuisine with seafood specialties', NULL, 4.7, NOW(), 1, 'Mon-Sun 12PM-10PM', 'outdoor seating,reservations'),
(NULL, 'Kung Pao Kitchen', '5353 Monterey Hwy', 'San Jose', 'CA', '95138', 'Chinese', '$', '408-100-0072', 'https://kungpaokitchen.com', 'Sichuan and Hunan style Chinese dishes', NULL, 4.1, NOW(), 1, 'Mon-Sun 10AM-10PM', 'parking'),
(NULL, 'Empanada House', '5454 Branham Ln', 'San Jose', 'CA', '95118', 'Brazilian', '$', '408-100-0073', 'https://empanada.com', 'Fresh baked empanadas with various fillings', NULL, 4.3, NOW(), 1, 'Mon-Sat 10AM-8PM', 'wifi'),
(NULL, 'Thai Orchid', '5555 Pearl Ave', 'San Jose', 'CA', '95136', 'Thai', '$', '408-100-0074', 'https://thaiorchid.com', 'Traditional Thai curries and pad see ew', NULL, 4.2, NOW(), 1, 'Mon-Sun 11AM-10PM', 'parking'),
(NULL, 'The Chop House', '5656 Camden Ave', 'San Jose', 'CA', '95124', 'American', '$$$', '408-100-0075', 'https://thechophouse.com', 'Premium steaks and classic American sides', NULL, 4.7, NOW(), 1, 'Mon-Sun 5PM-11PM', 'reservations,romantic,parking'),
(NULL, 'Pav Bhaji House', '5757 Curtner Ave', 'San Jose', 'CA', '95125', 'Indian', '$', '408-100-0076', 'https://pavbhaji.com', 'Mumbai street food and Indian chaat', NULL, 4.3, NOW(), 1, 'Mon-Sun 10AM-9PM', 'wifi'),
(NULL, 'Enchilada Factory', '5858 Snell Ave', 'San Jose', 'CA', '95136', 'Mexican', '$', '408-100-0077', 'https://enchiladafactory.com', 'Homestyle Mexican enchiladas and tamales', NULL, 4.2, NOW(), 1, 'Mon-Sun 10AM-10PM', 'outdoor seating,parking'),
(NULL, 'Wagyu House', '5959 Saratoga Ave', 'Saratoga', 'CA', '95070', 'Japanese', '$$$$', '408-100-0078', 'https://wagyuhouse.com', 'Premium wagyu beef and omakase experience', NULL, 4.9, NOW(), 1, 'Tue-Sun 6PM-10PM', 'reservations,romantic'),
(NULL, 'Shawarma Palace', '6060 Santa Teresa Blvd', 'San Jose', 'CA', '95123', 'Mediterranean', '$', '408-100-0079', 'https://shawarmpalace.com', 'Freshly carved shawarma and falafel wraps', NULL, 4.4, NOW(), 1, 'Mon-Sun 10AM-11PM', 'outdoor seating'),
(NULL, 'Biryani Bowl', '6161 McLaughlin Ave', 'San Jose', 'CA', '95121', 'Indian', '$', '408-100-0080', 'https://biryanibowl.com', 'Hyderabadi dum biryani and kebabs', NULL, 4.5, NOW(), 1, 'Mon-Sun 11AM-10PM', 'parking'),
(NULL, 'Osteria Toscana', '6262 Los Gatos Blvd', 'Los Gatos', 'CA', '95032', 'Italian', '$$$', '408-100-0081', 'https://osteriatoscana.com', 'Tuscan Italian cuisine with local wines', NULL, 4.8, NOW(), 1, 'Tue-Sun 5PM-10PM', 'reservations,romantic,parking'),
(NULL, 'Peking Duck House', '6363 Blossom Hill Rd', 'San Jose', 'CA', '95123', 'Chinese', '$$$', '408-100-0082', 'https://pekingduck.com', 'Signature Peking duck and Mandarin cuisine', NULL, 4.6, NOW(), 1, 'Mon-Sun 11AM-10PM', 'reservations,parking'),
(NULL, 'Galbi Korean', '6464 Bollinger Rd', 'San Jose', 'CA', '95129', 'Korean', '$$', '408-100-0083', 'https://galbikorean.com', 'Korean short ribs and seafood pancakes', NULL, 4.5, NOW(), 1, 'Mon-Sun 12PM-11PM', 'parking'),
(NULL, 'Carnitas Express', '6565 Capitol Ave', 'San Jose', 'CA', '95127', 'Mexican', '$', '408-100-0084', 'https://carnitasexpress.com', 'Slow cooked carnitas tacos and burritos', NULL, 4.3, NOW(), 1, 'Mon-Sun 9AM-9PM', 'outdoor seating'),
(NULL, 'Bun Bo Hue', '6666 Story Rd', 'San Jose', 'CA', '95122', 'Vietnamese', '$', '408-100-0085', 'https://bunbohue.com', 'Central Vietnamese spicy beef noodle soup', NULL, 4.4, NOW(), 1, 'Mon-Sun 8AM-8PM', 'parking'),
(NULL, 'The Grill Room', '6767 Almaden Expwy', 'San Jose', 'CA', '95120', 'American', '$$$', '408-100-0086', 'https://thegrillroom.com', 'Fine dining American grill with seasonal menu', NULL, 4.7, NOW(), 1, 'Mon-Sun 5PM-11PM', 'reservations,romantic'),
(NULL, 'Kati Roll House', '6868 Saratoga Ave', 'San Jose', 'CA', '95130', 'Indian', '$', '408-100-0087', 'https://katiroll.com', 'Indian street style kati rolls and wraps', NULL, 4.2, NOW(), 1, 'Mon-Sun 10AM-9PM', 'wifi'),
(NULL, 'Oaxacan Kitchen', '6969 Camden Ave', 'San Jose', 'CA', '95124', 'Mexican', '$$', '408-100-0088', 'https://oaxacankitchen.com', 'Authentic Oaxacan mole and tlayudas', NULL, 4.6, NOW(), 1, 'Tue-Sun 11AM-10PM', 'outdoor seating'),
(NULL, 'Miso Happy', '7070 Blossom Hill Rd', 'San Jose', 'CA', '95123', 'Japanese', '$$', '408-100-0089', 'https://misohappy.com', 'Japanese comfort food and miso soup varieties', NULL, 4.3, NOW(), 1, 'Mon-Sun 11AM-9PM', 'wifi,outdoor seating'),
(NULL, 'Cauliflower Cafe', '7171 Lincoln Ave', 'San Jose', 'CA', '95125', 'Vegan', '$$', '408-100-0090', 'https://cauliflowercafe.com', 'Creative vegan dishes with cauliflower specialties', NULL, 4.5, NOW(), 1, 'Mon-Sat 10AM-8PM', 'wifi,outdoor seating'),
(NULL, 'Hummus Republic', '7272 Meridian Ave', 'San Jose', 'CA', '95124', 'Mediterranean', '$', '408-100-0091', 'https://hummusrepublic.com', 'Israeli style hummus bowls and pita', NULL, 4.4, NOW(), 1, 'Mon-Sat 10AM-9PM', 'outdoor seating'),
(NULL, 'Mapo Tofu House', '7373 Tully Rd', 'San Jose', 'CA', '95111', 'Chinese', '$', '408-100-0092', 'https://mapotofu.com', 'Authentic Sichuan mapo tofu and hot pot', NULL, 4.2, NOW(), 1, 'Mon-Sun 11AM-10PM', 'parking'),
(NULL, 'Fiesta Mexicana', '7474 Monterey Rd', 'San Jose', 'CA', '95138', 'Mexican', '$', '408-100-0093', 'https://fiestamexicana.com', 'Lively Mexican restaurant with live music weekends', NULL, 4.3, NOW(), 1, 'Mon-Sun 10AM-11PM', 'outdoor seating,parking'),
(NULL, 'Saigon Noodles', '7575 Senter Rd', 'San Jose', 'CA', '95111', 'Vietnamese', '$', '408-100-0094', 'https://saigonnoodles.com', 'Vietnamese noodle dishes and rice plates', NULL, 4.1, NOW(), 1, 'Mon-Sun 8AM-8PM', 'parking'),
(NULL, 'Diner 55', '7676 Almaden Rd', 'San Jose', 'CA', '95120', 'American', '$', '408-100-0095', 'https://diner55.com', 'Classic American diner open 24 hours', NULL, 4.0, NOW(), 1, 'Open 24 Hours', 'wifi,parking'),
(NULL, 'Masala Zone', '7777 Quimby Rd', 'San Jose', 'CA', '95148', 'Indian', '$$', '408-100-0096', 'https://masalazone.com', 'Modern Indian cuisine with regional specialties', NULL, 4.5, NOW(), 1, 'Mon-Sun 11AM-10PM', 'parking,reservations'),
(NULL, 'Gyoza Bar', '7878 Bascom Ave', 'Campbell', 'CA', '95008', 'Japanese', '$$', '408-100-0097', 'https://gyozabar.com', 'Handmade gyoza dumplings and Japanese small plates', NULL, 4.6, NOW(), 1, 'Mon-Sun 5PM-11PM', 'outdoor seating'),
(NULL, 'El Torito', '7979 Camden Ave', 'San Jose', 'CA', '95124', 'Mexican', '$$', '408-100-0098', 'https://eltorito.com', 'Mexican chain with margaritas and fajitas', NULL, 4.1, NOW(), 1, 'Mon-Sun 11AM-11PM', 'outdoor seating,parking'),
(NULL, 'Pho Thanh Long', '8080 McLaughlin Ave', 'San Jose', 'CA', '95121', 'Vietnamese', '$', '408-100-0099', 'https://phothanhlong.com', 'Southern Vietnamese pho and seafood dishes', NULL, 4.3, NOW(), 1, 'Mon-Sun 8AM-9PM', 'parking'),
(NULL, 'Candlelight Bistro', '8181 Los Gatos Blvd', 'Los Gatos', 'CA', '95032', 'French', '$$$$', '408-100-0100', 'https://candlelightbistro.com', 'Romantic French fine dining with tasting menus', NULL, 4.9, NOW(), 1, 'Tue-Sat 6PM-10PM', 'reservations,romantic,parking');
"""

FIELDS = [
    "owner_id",
    "name",
    "address",
    "city",
    "state",
    "zip_code",
    "cuisine",
    "price_range",
    "phone",
    "website",
    "description",
    "image",
    "avg_rating",
    "created_at",
    "created_by_user_id",
    "hours_of_operation",
    "amenities",
]


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def get_image_url(cuisine: str, name: str) -> str:
    cuisine_map = {
        "Italian": "italian-food",
        "Japanese": "sushi",
        "Mexican": "mexican-food",
        "Vegan": "vegan-food",
        "Indian": "indian-food",
        "Chinese": "chinese-food",
        "French": "french-food",
        "Korean": "korean-food",
        "Mediterranean": "mediterranean-food",
        "Thai": "thai-food",
        "BBQ": "bbq-food",
        "American": "american-food",
        "Vietnamese": "vietnamese-food",
        "Spanish": "spanish-tapas",
        "Brazilian": "brazilian-food",
        "Cuban": "cuban-food",
    }

    query = cuisine_map.get(cuisine, "restaurant-food")
    return f"https://source.unsplash.com/400x300/?{query}&sig={slugify(name)}"


def split_sql_tuples(values_sql: str) -> list[str]:
    tuples = []
    depth = 0
    in_quote = False
    current = []

    i = 0
    while i < len(values_sql):
        ch = values_sql[i]

        if ch == "'" and (i == 0 or values_sql[i - 1] != "\\"):
            in_quote = not in_quote
            current.append(ch)
        elif not in_quote and ch == "(":
            depth += 1
            current.append(ch)
        elif not in_quote and ch == ")":
            depth -= 1
            current.append(ch)
            if depth == 0:
                tuples.append("".join(current).strip())
                current = []
                while i + 1 < len(values_sql) and values_sql[i + 1] in ", \n\r\t":
                    i += 1
        else:
            current.append(ch)
        i += 1

    return tuples


def parse_tuple(tuple_sql: str) -> list[str]:
    inner = tuple_sql.strip()[1:-1]
    reader = csv.reader(
        StringIO(inner),
        delimiter=",",
        quotechar="'",
        skipinitialspace=True,
    )
    return next(reader)


def convert_value(field: str, raw: str):
    raw = raw.strip()

    if raw == "NULL":
        return None

    if raw == "NOW()":
        return datetime.utcnow()

    if field == "avg_rating":
        return float(raw)

    if field == "created_by_user_id":
        return str(raw)

    if field == "owner_id":
        return None if raw == "NULL" else str(raw)

    return raw


def parse_sql_insert(sql_text: str) -> list[dict]:
    match = re.search(r"VALUES\s*(.*)\s*;\s*$", sql_text, flags=re.DOTALL | re.IGNORECASE)
    if not match:
        raise ValueError("Could not find VALUES block in SQL text")

    values_sql = match.group(1)
    tuple_sqls = split_sql_tuples(values_sql)

    docs = []
    for tuple_sql in tuple_sqls:
        values = parse_tuple(tuple_sql)

        if len(values) != len(FIELDS):
            raise ValueError(
                f"Expected {len(FIELDS)} values but got {len(values)} for tuple: {tuple_sql[:120]}..."
            )

        row = {}
        for field, raw in zip(FIELDS, values):
            row[field] = convert_value(field, raw)

        amenities_raw = row["amenities"] or ""

        doc = {
            "owner_id": row["owner_id"],
            "name": row["name"],
            "address": row["address"],
            "city": row["city"],
            "state": row["state"],
            "zip_code": row["zip_code"],
            "cuisine": row["cuisine"],
            "price_range": row["price_range"],
            "phone": row["phone"],
            "website": row["website"],
            "description": row["description"],
            "image": get_image_url(row["cuisine"], row["name"]),
            "avg_rating": row["avg_rating"],
            "created_by_user_id": row["created_by_user_id"],
            "hours_of_operation": row["hours_of_operation"],
            "amenities": [a.strip() for a in amenities_raw.split(",") if a.strip()],
            "created_at": row["created_at"] if isinstance(row["created_at"], datetime) else datetime.utcnow(),
        }
        docs.append(doc)

    return docs


if __name__ == "__main__":
    mongo_docs = parse_sql_insert(SQL_INSERT)

    print("Parsed rows:", len(mongo_docs))
    print("First 5 names:", [doc["name"] for doc in mongo_docs[:5]])

    names = [doc["name"] for doc in mongo_docs]
    existing_names = set(
        doc["name"]
        for doc in mongo_db.restaurants.find(
            {"name": {"$in": names}},
            {"name": 1},
        )
    )

    docs_to_insert = [doc for doc in mongo_docs if doc["name"] not in existing_names]

    if not docs_to_insert:
        print("No new restaurants to insert. All parsed names already exist.")
    else:
        result = mongo_db.restaurants.insert_many(docs_to_insert)
        print("Inserted count:", len(result.inserted_ids))
        print("First 5 inserted IDs:")
        for inserted_id in result.inserted_ids[:5]:
            print(inserted_id)