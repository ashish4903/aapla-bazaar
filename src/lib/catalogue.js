/**
 * Common produce a shop can pick from, so the vendor never has to type a name
 * or pick a picture. No prices here: every price is typed by the vendor.
 * `unit` is only the usual unit; the vendor can change it.
 */
const row = (id, icon, cat, unit, mr, en) => ({ id, icon, cat, unit, name: { mr, en } });

export const CATEGORIES = ['veg', 'leafy', 'fruit', 'other'];

export const CATALOGUE = [
  row('tomato', '🍅', 'veg', 'kg', 'टोमॅटो', 'Tomato'),
  row('onion', '🧅', 'veg', 'kg', 'कांदा', 'Onion'),
  row('potato', '🥔', 'veg', 'kg', 'बटाटा', 'Potato'),
  row('brinjal', '🍆', 'veg', 'kg', 'वांगी', 'Brinjal'),
  row('okra', '🌱', 'veg', 'kg', 'भेंडी', 'Okra'),
  row('cauliflower', '🥦', 'veg', 'piece', 'फुलकोबी', 'Cauliflower'),
  row('cabbage', '🥬', 'veg', 'piece', 'पत्ताकोबी', 'Cabbage'),
  row('carrot', '🥕', 'veg', 'kg', 'गाजर', 'Carrot'),
  row('cucumber', '🥒', 'veg', 'kg', 'काकडी', 'Cucumber'),
  row('capsicum', '🫑', 'veg', 'kg', 'ढोबळी मिरची', 'Capsicum'),
  row('chilli', '🌶️', 'veg', 'kg', 'हिरवी मिरची', 'Green chilli'),
  row('garlic', '🧄', 'veg', 'kg', 'लसूण', 'Garlic'),
  row('ginger', '🫚', 'veg', 'kg', 'आले', 'Ginger'),
  row('peas', '🫛', 'veg', 'kg', 'मटार', 'Green peas'),
  row('cluster-beans', '🫛', 'veg', 'kg', 'गवार', 'Cluster beans'),
  row('french-beans', '🫛', 'veg', 'kg', 'फरसबी', 'French beans'),
  row('bottle-gourd', '🥒', 'veg', 'piece', 'दुधी भोपळा', 'Bottle gourd'),
  row('bitter-gourd', '🥒', 'veg', 'kg', 'कारले', 'Bitter gourd'),
  row('ridge-gourd', '🥒', 'veg', 'kg', 'दोडका', 'Ridge gourd'),
  row('pumpkin', '🎃', 'veg', 'kg', 'लाल भोपळा', 'Pumpkin'),
  row('drumstick', '🌿', 'veg', 'kg', 'शेवगा', 'Drumstick'),
  row('beetroot', '🧺', 'veg', 'kg', 'बीट', 'Beetroot'),
  row('radish', '🧺', 'veg', 'kg', 'मुळा', 'Radish'),
  row('corn', '🌽', 'veg', 'piece', 'मका कणीस', 'Sweet corn'),
  row('sweet-potato', '🍠', 'veg', 'kg', 'रताळे', 'Sweet potato'),
  row('lemon', '🍋', 'veg', 'piece', 'लिंबू', 'Lemon'),
  row('coconut', '🥥', 'veg', 'piece', 'नारळ', 'Coconut'),

  row('methi', '🌿', 'leafy', 'bunch', 'मेथी', 'Fenugreek'),
  row('spinach', '🥬', 'leafy', 'bunch', 'पालक', 'Spinach'),
  row('coriander', '🌿', 'leafy', 'bunch', 'कोथिंबीर', 'Coriander'),
  row('dill', '🌿', 'leafy', 'bunch', 'शेपू', 'Dill'),
  row('mint', '🌿', 'leafy', 'bunch', 'पुदिना', 'Mint'),
  row('spring-onion', '🌱', 'leafy', 'bunch', 'कांदा पात', 'Spring onion'),
  row('amaranth', '🌿', 'leafy', 'bunch', 'लाल माठ', 'Red amaranth'),
  row('sorrel', '🌿', 'leafy', 'bunch', 'अंबाडी', 'Sorrel leaves'),
  row('curry-leaves', '🍃', 'leafy', 'bunch', 'कढीपत्ता', 'Curry leaves'),

  row('banana', '🍌', 'fruit', 'dozen', 'केळी', 'Banana'),
  row('apple', '🍎', 'fruit', 'kg', 'सफरचंद', 'Apple'),
  row('orange', '🍊', 'fruit', 'kg', 'संत्री', 'Orange'),
  row('sweet-lime', '🍋', 'fruit', 'kg', 'मोसंबी', 'Sweet lime'),
  row('grapes', '🍇', 'fruit', 'kg', 'द्राक्षे', 'Grapes'),
  row('pomegranate', '🧺', 'fruit', 'kg', 'डाळिंब', 'Pomegranate'),
  row('mango', '🥭', 'fruit', 'kg', 'आंबा', 'Mango'),
  row('guava', '🍐', 'fruit', 'kg', 'पेरू', 'Guava'),
  row('papaya', '🍈', 'fruit', 'kg', 'पपई', 'Papaya'),
  row('watermelon', '🍉', 'fruit', 'piece', 'कलिंगड', 'Watermelon'),
  row('pineapple', '🍍', 'fruit', 'piece', 'अननस', 'Pineapple'),

  row('eggs', '🥚', 'other', 'dozen', 'अंडी', 'Eggs'),
  row('groundnut', '🥜', 'other', 'kg', 'शेंगदाणे', 'Groundnuts'),
];

const BY_ID = new Map(CATALOGUE.map((item) => [item.id, item]));

export const catalogueItem = (id) => BY_ID.get(id);
