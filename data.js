// CartWise dataset: 10 categories x 35 products = 350 products, 10 DEMO offers each (Amazon x4, Flipkart x3, Meesho x3).
// Prices/ratings are SIMULATED (seeded random) - not live marketplace data.
export const CATEGORIES = [
  { id: 'mobiles', name: 'Mobiles & Tablets', emoji: '📱', colors: ['#7c3aed', '#22d3ee'], items: [
    'iPhone 16|79900','iPhone 15|69900','iPhone 16 Pro|119900','iPhone 13|44900','Samsung Galaxy S25|74999','Samsung Galaxy S24 FE|54999','Samsung Galaxy A55|34999','Samsung Galaxy M35|19999','OnePlus 13|69999','OnePlus 12R|39999','OnePlus Nord CE4|24999','Redmi Note 14 Pro|26999','Redmi 13C|9999','Xiaomi 14 Civi|42999','Realme 13 Pro|25999','Realme Narzo 70|15999','Poco X7 Pro|27999','Poco M6|9499','Vivo V40|36999','Vivo T3 Lite|10999','Oppo Reno 12|32999','Oppo A3x|12499','iQOO Neo 9 Pro|34999','Motorola Edge 50|27999','Motorola G45|10999','Nothing Phone 3a|26999','Google Pixel 8a|52999','Realme C63|8999','Samsung Galaxy Tab S9 FE|36999','Apple iPad 10th Gen|34900','Lenovo Tab M10|14999','Xiaomi Pad 6|24999','OnePlus Pad 2|39999','Honor X9b|25999','Infinix Note 40|14999'] },
  { id: 'laptops', name: 'Laptops & PC', emoji: '💻', colors: ['#2563eb', '#a855f7'], items: [
    'Dell Inspiron 15|52990','Dell XPS 13|129990','HP Pavilion 15|61990','HP Victus 15|68990','Lenovo IdeaPad Slim 3|41990','Lenovo LOQ 15|74990','Lenovo ThinkPad E14|67990','Asus Vivobook 15|45990','Asus TUF F15|69990','Asus ROG Strix G16|134990','Acer Aspire 5|44990','Acer Nitro V|64990','MSI Thin GF63|56990','MSI Modern 14|38990','Apple MacBook Air M2|94900','Apple MacBook Air M3|114900','Apple MacBook Pro 14|169900','Samsung Galaxy Book4|55990','Microsoft Surface Laptop 5|109990','Infinix INBook Y1|24990','Honor MagicBook X14|42990','Dell Latitude 3440|58990','HP 15s|38990','Lenovo Yoga Slim 7|89990','Asus Zenbook 14 OLED|79990','Logitech MX Keys Keyboard|9995','Logitech MX Master 3S Mouse|9495','HP Wireless Mouse|799','Zebronics Gaming Keyboard|1299','Samsung 27 inch Monitor|15999','LG UltraGear Monitor|17999','Dell 24 inch Monitor|9999','Epson EcoTank Printer|13999','HP Deskjet Printer|5999','Seagate 1TB Hard Drive|4499'] },
  { id: 'audio', name: 'Audio & Wearables', emoji: '🎧', colors: ['#ec4899', '#8b5cf6'], items: [
    'Sony WH-1000XM5|29990','Sony WF-1000XM5|24990','Sony WH-CH720N|9990','Apple AirPods Pro 2|24900','Apple AirPods 4|12900','Bose QuietComfort Headphones|35990','JBL Tune 770NC|6999','JBL Tour One M2|24999','JBL Flip 6 Speaker|8999','JBL Go 3 Speaker|2999','boAt Rockerz 550|1799','boAt Airdopes 141|1299','boAt Stone 352 Speaker|1499','OnePlus Buds 3|5499','OnePlus Nord Buds 2|2499','Samsung Galaxy Buds3 Pro|17999','Samsung Galaxy Watch 7|29999','Noise ColorFit Pro 4 Watch|3499','Noise Buds VS104|999','Realme Buds T300|2299','Nothing Ear 2|9999','Sennheiser Momentum 4 Headphones|24990','Skullcandy Hesh ANC Headphones|8999','Marshall Emberton Speaker|12999','Ultimate Ears Boom 4 Speaker|9999','Fire-Boltt Ninja Call Pro Watch|1299','Apple Watch SE|29900','Fitbit Charge 6 Band|14999','Amazfit Bip 5 Watch|6999','Mi Smart Band 8|2999','Zebronics Zeb-Thunder Headphones|1099','Philips TAUH201 Headphones|1499','Anker Soundcore Q30 Headphones|7999','Mivi DuoPods A25|899','Sony SRS-XB100 Speaker|4990'] },
  { id: 'footwear', name: 'Footwear', emoji: '👟', colors: ['#f97316', '#ec4899'], items: [
    'Nike Air Max 270|12995','Nike Revolution 7|3495','Nike Air Force 1|8495','Nike Pegasus 41|11495','Nike Court Vision|5495','Adidas Ultraboost 22|16999','Adidas Grand Court|3999','Adidas Samba OG|9999','Adidas Runfalcon|3999','Adidas Adilette Slides|1999','Puma Softride Running Shoes|3499','Puma Smash V2|3299','Puma RS-X|9999','Puma Flip Flops|999','Skechers Go Walk|5499',"Skechers D'Lites|6999",'Campus Running Shoes|1499','Campus Sneakers|1299','ASICS Gel-Kayano 14|15999','ASICS Gel-Nimbus 26|14999','Reebok Sports Shoes|2499','Reebok Classic Leather|5999','New Balance 574|7999','New Balance Fresh Foam|8999','Converse Chuck Taylor|4499','Vans Old Skool|4999','Crocs Classic Clogs|3495','Bata Formal Shoes|1999','Woodland Trekking Boots|4995','Red Tape Sneakers|1999','Sparx Running Shoes|1099','Liberty Sandals|899','Hush Puppies Loafers|3999','Birkenstock Arizona Sandals|8995','Decathlon Kalenji Running Shoes|2999'] },
  { id: 'mens', name: "Men's Fashion", emoji: '🧥', colors: ['#14b8a6', '#6366f1'], items: [
    "Levi's 511 Slim Jeans|3299","Levi's Graphic T-Shirt|1299",'Allen Solly Formal Shirt|1799','Van Heusen Slim Shirt|1999','Peter England Chinos|1799','US Polo Assn Polo T-Shirt|1499','Roadster Hoodie|1199','Roadster Cargo Pants|1399','H&M Oversized Tee|999','Zara Bomber Jacket|5990','Puma Track Pants|1999','Nike Dri-FIT T-Shirt|1795','Adidas Training Shorts|1499','Jockey Innerwear Pack|899','Bewakoof Graphic Tee|599','Snitch Streetwear Shirt|1299','The Souled Store Tee|799','Wrangler Denim Jacket|3499','Raymond Blazer|6999','Fabindia Kurta|1599','Manyavar Sherwani Set|8999','Fastrack Sunglasses|1299','Ray-Ban Wayfarer Sunglasses|8990','Titan Neo Watch|5995','Casio Vintage Watch|3995','Fossil Gen Chronograph Watch|9995','Wildcraft Backpack|1899','American Tourister Backpack|2199','Skybags Laptop Bag|1599','Hidesign Leather Wallet|2499','Woodland Leather Belt|999','Tommy Hilfiger Cap|1999','Raymond Suit Set|12999','Mufti Jacket|3299','Bonkers Corner Joggers|899'] },
  { id: 'womens', name: "Women's Fashion", emoji: '👗', colors: ['#f43f5e', '#a855f7'], items: [
    'Libas Kurta Set|1299','W Anarkali Kurta|1899','Biba Palazzo Set|1599','Aurelia Straight Kurta|999','FabIndia Cotton Saree|2999','Kanjivaram Silk Saree|6999','Banarasi Georgette Saree|3499','Zara Satin Dress|3990','H&M Floral Dress|1999','Vero Moda Midi Dress|2499','Only Denim Jeans|2199',"Levi's High Rise Jeans|3499",'Forever 21 Crop Top|799','Tokyo Talkies Co-ord Set|1499','Souled Store Oversized Tee|799','Bewakoof Tie-Dye Hoodie|1299','Kazo Blazer|3299','AND Jumpsuit|3999','Mango Trench Coat|7990','Zudio Basic Tee|299','Westside Shirt Dress|1799','Titan Raga Watch|6995',"Fossil Women's Watch|8995",'Lavie Tote Bag|2499','Caprese Sling Bag|2999','Baggit Handbag|1999','Hidesign Leather Handbag|6999','Zaveri Pearls Jewellery Set|899','Giva Silver Earrings|1999','Bluestone Diamond Pendant|14999','Clovia Lingerie Set|799','Zivame Sports Bra|999','Marks & Spencer Nightwear|1999','Steve Madden Block Heels|4999','Metro Ballet Flats|1499'] },
  { id: 'beauty', name: 'Beauty & Care', emoji: '💄', colors: ['#ff4fa3', '#facc15'], items: [
    'CeraVe Moisturizing Cream|1450','Cetaphil Moisturizing Lotion|799','Neutrogena Hydro Boost Gel|899','Minimalist 10% Vitamin C Serum|599','Minimalist SPF 50 Sunscreen|399','The Derma Co SPF 50 Sunscreen|499','Neutrogena Ultra Sheer Sunscreen|699','La Roche-Posay Anthelios Sunscreen|1650','Maybelline Fit Me Foundation|599','Maybelline Sky High Mascara|699','Lakme 9to5 Lipstick|599','MAC Ruby Woo Lipstick|1950','Nykaa Matte Lipstick|499',"L'Oreal Paris Shampoo|399","L'Oreal Revitalift Serum|899",'Dove Hair Fall Shampoo|349','Tresemme Keratin Shampoo|450','Mamaearth Vitamin C Face Wash|299','Mamaearth Onion Hair Oil|399','Himalaya Neem Face Wash|199','Garnier Micellar Water|349','Plum Green Tea Face Wash|360','Cetaphil Gentle Cleanser|599','Philips Beard Trimmer|1499','Philips Hair Dryer|1299','Dyson Airwrap Styler|45900','Braun Epilator|5999','Nivea Body Lotion|399','Vaseline Body Lotion|349','Bath & Body Works Mist|1299','Fogg Perfume|249','Wild Stone Perfume|599','Bombay Shaving Company Razor|499','Gillette Fusion Razor|549','Beardo Beard Oil|399'] },
  { id: 'appliances', name: 'Home Appliances', emoji: '🏠', colors: ['#0ea5e9', '#c6ff3d'], items: [
    'Philips Air Fryer HD9252|8995','Havells Air Fryer|6495','Prestige Air Fryer|5999','LG Washing Machine 7kg|32990','Whirlpool Washing Machine 7.5kg|28990','Samsung Washing Machine 8kg|31990','IFB Front Load Washing Machine 8kg|36990','Bosch Washing Machine 7kg|34990','Samsung Refrigerator 253L|28990','LG Refrigerator 242L|27990','Whirlpool Refrigerator 235L|24990','Haier Refrigerator 190L|15990','Godrej Refrigerator 180L|14990','Bajaj Room Heater|2199','Havells Room Heater|3499','Orient Electric Room Heater|1999','Crompton Air Cooler|8999','Symphony Air Cooler|11999','Bajaj Air Cooler|7499','Crompton Ceiling Fan|2199','Havells Ceiling Fan|2899','Atomberg Renesa Fan|3299','Usha Table Fan|2499','Dyson V12 Vacuum Cleaner|49900','Eureka Forbes Vacuum Cleaner|5999','Roborock Robot Vacuum|29999','Mi Robot Vacuum|17999','LG 1.5 Ton Split AC|42990','Voltas 1.5 Ton Split AC|36990','Daikin 1.5 Ton Split AC|45990','Samsung 55 inch Smart TV|52990','LG 43 inch Smart TV|32990','Sony Bravia 55 inch TV|69990','Mi 43 inch TV|24999','Kent RO Water Purifier|14999'] },
  { id: 'kitchen', name: 'Kitchen & Dining', emoji: '🍳', colors: ['#eab308', '#ef4444'], items: [
    'Prestige Mixer Grinder|3299','Philips Mixer Grinder|3999','Bajaj Mixer Grinder|2799','Preethi Zodiac Mixer Grinder|8999','Butterfly Mixer Grinder|3499','Prestige Induction Cooktop|2299','Philips Induction Cooktop|2999','Pigeon Gas Stove|1999','Hawkins Pressure Cooker|1899','Prestige Pressure Cooker|1699','Pigeon Non-stick Cookware Set|1599','Tefal Frying Pan|1999','Milton Thermosteel Bottle|899','Cello Water Bottle|399','Borosil Glass Set|799','Borosil Lunch Box|999','Tupperware Container Set|1299','Prestige Electric Kettle|799','Philips Electric Kettle|1299','Bajaj Pop-up Toaster|1599','Morphy Richards Oven|6999','IFB Microwave Oven|8990','Samsung Microwave Oven|11990','Wonderchef Chopper|999','Nutribullet Blender|4999','Borosil Juicer|3999','Hamilton Beach Blender|5500','Philips Coffee Maker|5999','Nescafe Dolce Gusto Coffee Machine|7999','Prestige Rice Cooker|2299','Pigeon Idli Maker|1299','Sleek Knife Set|899','Solimo Dinner Set|1999','Amazon Basics Cutlery Set|699','Milton Insulated Casserole|799'] },
  { id: 'gaming', name: 'Gaming', emoji: '🎮', colors: ['#c6ff3d', '#7c3aed'], items: [
    'Sony PlayStation 5|49990','Sony PS5 DualSense Controller|5990','Xbox Series X Console|52990','Xbox Wireless Controller|5499','Nintendo Switch OLED Console|34999','Nintendo Joy-Con Controller Pair|7999','Valve Steam Deck Console|47999','Logitech G502 Mouse|3995','Logitech G Pro X Headset|12995','Razer DeathAdder Mouse|4999','Razer BlackWidow Keyboard|9999','Razer Kraken Headset|5999','HyperX Cloud II Headset|6999','HyperX Alloy Keyboard|5499','Redragon Gaming Mouse|999','Redragon Gaming Keyboard|2999','Corsair K70 Keyboard|12999','SteelSeries Arctis Headset|9999','Cosmic Byte Mouse Pad|699','Ant Esports Gaming Chair|8999','Green Soul Gaming Chair|11999','Asus ROG Phone 8|94999','Nvidia RTX 4060 GPU|29999','MSI RTX 4070 GPU|59999','AMD Ryzen 5 7600 Processor|16999','Intel Core i5 13400F Processor|15999','Samsung 980 Pro SSD|9999','Crucial 16GB RAM|3999','Cooler Master Cabinet|4999','Elgato Webcam|14999','Logitech C920 Webcam|5995','Blue Yeti Microphone|11999','Fantech Gaming Controller|1999','Ant Esports Gaming Mouse|599','Zebronics Gaming Headset|1199'] },
]

// [regex on lowercase name, emoji used in the product picture, subcategory label]
const RULES = [
  [/sunscreen|spf|anthelios/, '🧴', 'Sunscreen'], [/lipstick/, '💄', 'Lipstick'], [/foundation|mascara/, '💄', 'Makeup'],
  [/shampoo|hair oil/, '🧴', 'Hair Care'], [/trimmer|razor|epilator|hair dryer|airwrap|beard oil/, '🪒', 'Grooming'],
  [/perfume|mist/, '🌸', 'Fragrance'], [/serum|moisturi|lotion|cream|cleanser|face wash|micellar|hydro boost/, '🧴', 'Skincare'],
  [/air fryer/, '🍟', 'Air Fryer'], [/washing/, '🧺', 'Washing Machine'], [/refrigerator/, '🧊', 'Refrigerator'],
  [/heater/, '🔥', 'Room Heater'], [/cooler/, '❄️', 'Air Cooler'], [/\bfan\b/, '🌀', 'Fan'], [/vacuum|robot/, '🧹', 'Vacuum Cleaner'],
  [/\bac\b/, '❄️', 'Air Conditioner'], [/\btv\b/, '📺', 'Television'], [/purifier/, '💧', 'Water Purifier'],
  [/mixer|blender|chopper|juicer|nutribullet/, '🥤', 'Mixer & Blender'],
  [/cooker|cookware|frying pan|stove|cooktop|induction|kettle|toaster|oven|microwave|coffee|dolce|idli/, '🍳', 'Cookware & Appliances'],
  [/bottle|casserole|lunch|container|glass/, '🍶', 'Storage'], [/knife|cutlery|dinner/, '🍴', 'Tableware'],
  [/playstation|xbox|switch|steam deck/, '🎮', 'Console'], [/controller|joy-con|dualsense/, '🎮', 'Controller'],
  [/rtx|gpu/, '🖥️', 'Graphics Card'], [/ryzen|core i5|processor/, '🧠', 'Processor'], [/\bram\b/, '🧩', 'RAM'], [/cabinet/, '🖥️', 'PC Cabinet'],
  [/chair/, '🪑', 'Gaming Chair'], [/webcam/, '📷', 'Webcam'], [/microphone/, '🎙️', 'Microphone'],
  [/buds|airpods|airdopes|duopods|ear 2|wf-/, '🎧', 'Earbuds'],
  [/headphone|headset|wh-|tune 770|tour one|rockerz|momentum|hesh|q30|taud|kraken|cloud ii|arctis|zeb-thunder/, '🎧', 'Headphones'],
  [/speaker|stone|emberton|boom 4|srs-/, '🔊', 'Speaker'], [/watch|band|fitbit|bip/, '⌚', 'Smartwatch'],
  [/keyboard/, '⌨️', 'Keyboard'], [/mouse/, '🖱️', 'Mouse'], [/monitor/, '🖥️', 'Monitor'], [/printer/, '🖨️', 'Printer'], [/hard drive|ssd/, '💾', 'Storage'],
  [/ipad|\btab\b|pad \d/, '📱', 'Tablet'],
  [/macbook|inspiron|xps|pavilion|victus|ideapad|loq|thinkpad|vivobook|tuf|rog strix|aspire|nitro|thin gf|modern 14|galaxy book|surface|inbook|magicbook|latitude|hp 15s|yoga|zenbook/, '💻', 'Laptop'],
  [/iphone|galaxy|oneplus|redmi|realme|poco|vivo|oppo|iqoo|motorola|nothing phone|pixel|xiaomi 14|infinix|honor x|rog phone/, '📱', 'Smartphone'],
  [/sandal|slides|flip flop|crocs|clog|birkenstock/, '🩴', 'Sandals'], [/heels|ballet|loafer/, '👠', 'Formal Footwear'], [/boots/, '🥾', 'Boots'],
  [/shoe|sneaker|runn|air max|ultraboost|pegasus|samba|air force|court|revolution|smash|rs-x|go walk|d'lites|gel-|574|fresh foam|chuck|old skool|softride|runfalcon|kalenji|classic leather/, '👟', 'Shoes'],
  [/jeans|pants|cargo|chinos|joggers/, '👖', 'Bottomwear'], [/shorts/, '🩳', 'Shorts'], [/dress|jumpsuit|anarkali|kurta|palazzo|saree|co-ord|nightwear/, '👗', 'Ethnic & Dresses'],
  [/lingerie|bra\b|innerwear/, '🩲', 'Innerwear'], [/t-shirt|\btee\b|crop top|polo/, '👕', 'T-Shirts'], [/shirt/, '👔', 'Shirts'],
  [/hoodie|jacket|blazer|coat|bomber|sherwani|suit/, '🧥', 'Outerwear'], [/sunglasses|wayfarer/, '🕶️', 'Eyewear'],
  [/backpack|bag/, '🎒', 'Bags'], [/wallet|belt/, '👛', 'Accessories'], [/\bcap\b/, '🧢', 'Caps'], [/earrings|pendant|jewellery/, '💎', 'Jewellery'],
]
const BRAND2 = ['Van Heusen','Allen Solly','Peter England','US Polo Assn','Tommy Hilfiger','Ray-Ban','Hush Puppies','Red Tape','New Balance','Bath & Body Works','La Roche-Posay','Vero Moda','Forever 21','Tokyo Talkies','Marks & Spencer','Steve Madden','Eureka Forbes','Orient Electric','Hamilton Beach','Cooler Master','Cosmic Byte','Ant Esports','Green Soul','The Derma Co','The Souled Store','Bombay Shaving Company','Morphy Richards','Samsung Galaxy','Amazon Basics','Fire-Boltt']
const ALIAS = { iPhone: 'Apple', iPad: 'Apple', Redmi: 'Xiaomi', Poco: 'Xiaomi', Xbox: 'Microsoft', PS5: 'Sony', Mi: 'Xiaomi', Samsung: 'Samsung' }
const SELLERS = { Amazon: ['Appario Retail','Cloudtail India','RetailEZ','Amazon Retail'], Flipkart: ['SuperComNet','RetailNet','Flipkart Assured','OmniTech Retail'], Meesho: ['Trendy Mart','Shree Traders','Urban Hub','Value Bazaar'] }
const PLAN = ['Amazon','Amazon','Amazon','Amazon','Flipkart','Flipkart','Flipkart','Meesho','Meesho','Meesho']

export const fmt = (n) => Number(n).toLocaleString('en-IN')
const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) } return h >>> 0 }
const rng = (seed) => { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
const clamp = (x, a, b) => Math.max(a, Math.min(b, x))
const r1 = (x) => Math.round(x * 10) / 10
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

function picture(name, emoji, c) {
  const label = esc(name.length > 30 ? name.slice(0, 29) + '…' : name)
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${c[0]}'/><stop offset='1' stop-color='${c[1]}'/></linearGradient></defs><rect width='400' height='300' fill='url(#g)'/><circle cx='340' cy='50' r='80' fill='white' opacity='.13'/><circle cx='50' cy='260' r='60' fill='black' opacity='.12'/><text x='200' y='165' font-size='120' text-anchor='middle'>${emoji}</text><text x='200' y='262' font-size='20' font-weight='800' fill='white' text-anchor='middle' font-family='Arial,sans-serif'>${label}</text></svg>`
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}

function build(cat, line, idx) {
  const [name, priceStr] = line.split('|'); const base = Number(priceStr)
  const id = cat.id.slice(0, 3).toUpperCase() + String(idx + 1).padStart(2, '0')
  const r = rng(hash(id + name)); const lower = name.toLowerCase()
  const rule = RULES.find((x) => x[0].test(lower)) || [null, cat.emoji, cat.name]
  const brand = BRAND2.find((b) => name.startsWith(b)) || ALIAS[name.split(' ')[0]] || name.split(' ')[0]
  const baseRating = 3.7 + r() * 0.95, pop = 0.4 + r() * 1.6
  const px = (x) => (x > 500 ? Math.round(x / 10) * 10 - 1 : Math.round(x))
  const offers = PLAN.map((m, i) => {
    const mee = m === 'Meesho'
    const price = px(base * (mee ? 0.82 + r() * 0.16 : 0.92 + r() * 0.14))
    const original = px(price * (1.08 + r() * 0.25))
    const stockRoll = r()
    return { market: m, seller: SELLERS[m][i % 4 === 0 ? 0 : (i + 1) % 4], price, original, discount: Math.round((1 - price / original) * 100),
      delivery: r() < 0.6 ? 0 : [40, 59, 99][Math.floor(r() * 3)], eta: (m === 'Amazon' ? 1 : m === 'Flipkart' ? 2 : 4) + Math.floor(r() * 3) + ' days',
      rating: clamp(r1(baseRating + (r() - 0.5) * 0.7 - (mee ? 0.15 : 0)), 3, 5),
      reviews: Math.round(pop * (base < 5000 ? 30000 : 8000) * (0.2 + r() * 0.8) * (mee ? 0.5 : 1)),
      stock: stockRoll < 0.07 ? 'Out of stock' : stockRoll < 0.2 ? 'Only few left' : 'In stock' }
  })
  const live = offers.filter((o) => o.stock !== 'Out of stock')
  const tot = (o) => o.price + o.delivery
  const lo = Math.min(...live.map(tot)), hi = Math.max(...live.map(tot))
  offers.forEach((o) => {
    if (o.stock === 'Out of stock') { o.score = 0; return }
    const priceScore = (hi - tot(o)) / (hi - lo || 1)
    const ratingScore = clamp((o.rating - 3) / 2, 0, 1)
    const conf = Math.min(1, Math.log10(o.reviews + 1) / 4)
    o.score = Math.round(100 * (0.45 * priceScore + 0.55 * ratingScore * conf)) // 45% price, 55% reviews
  })
  offers.sort((a, b) => b.score - a.score)
  const best = offers[0]
  const prices = live.map((o) => o.price)
  const totalReviews = offers.reduce((s, o) => s + o.reviews, 0)
  const rating = r1(offers.reduce((s, o) => s + o.rating * o.reviews, 0) / totalReviews)
  const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
  const pct = Math.round((1 - best.price / avg) * 100)
  return { id, name, brand, catId: cat.id, category: cat.name, sub: rule[2],
    image: picture(name, rule[1], cat.colors), offers, best, rating, reviews: totalReviews,
    minPrice: Math.min(...prices), maxPrice: Math.max(...prices), avgPrice: avg,
    aiScore: Math.round(0.5 * best.score + 0.5 * clamp((rating - 3) / 2, 0, 1) * 100),
    keywords: [/Earbuds|Headphones|Speaker|Smartwatch/.test(rule[2]) ? 'wireless bluetooth' : '', rule[2] === 'Smartphone' ? 'mobile 5g' : '', rule[2] === 'Laptop' ? 'notebook' : '', rule[2] === 'Shoes' ? 'running footwear' : '', base >= 20000 ? 'premium' : '', base <= 3000 ? 'budget' : ''].join(' '),
    headline: `${best.market} (${best.seller}) – ₹${fmt(best.price)} is ${pct > 0 ? pct + '% below' : 'about'} the average listing price, and it is rated ${best.rating}★ by ${fmt(best.reviews)} reviews.` }
}

export const PRODUCTS = CATEGORIES.flatMap((c) => c.items.map((l, i) => build(c, l, i)))
export const BY_ID = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]))
