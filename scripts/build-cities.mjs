#!/usr/bin/env node
/**
 * Builds data/places/cities.json — the 64 districts of Bangladesh + ~85 major world cities with
 * large Muslim / diaspora populations — with coordinates and IANA time zones from the free,
 * keyless Open-Meteo geocoding API (GeoNames-derived).
 *
 *   node scripts/build-cities.mjs            # fetch, verify, write the JSON
 *   (behind a proxy: NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/path/ca.pem node scripts/build-cities.mjs)
 *
 * Every result is verified: the country code must match and (when given) the admin-area hint must
 * appear in admin1/admin2; unverified entries abort the build so wrong coordinates never get committed.
 * Names (en/bn), aliases, default method and Asr madhab are curated below.
 */
import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data', 'places', 'cities.json')

/** [slug, english name, bangla name, division (admin1 hint), geocoder queries, aliases, isDivisionalCity] */
const BD = [
  // Dhaka division
  ['dhaka', 'Dhaka', 'ঢাকা', 'Dhaka', ['Dhaka'], [], 1],
  ['faridpur', 'Faridpur', 'ফরিদপুর', 'Dhaka', ['Faridpur'], []],
  ['gazipur', 'Gazipur', 'গাজীপুর', 'Dhaka', ['Gazipur', 'Joydebpur'], []],
  ['gopalganj', 'Gopalganj', 'গোপালগঞ্জ', 'Dhaka', ['Gopalganj'], []],
  ['kishoreganj', 'Kishoreganj', 'কিশোরগঞ্জ', 'Dhaka', ['Kishoreganj', 'Kishorganj'], []],
  ['madaripur', 'Madaripur', 'মাদারীপুর', 'Dhaka', ['Madaripur'], []],
  ['manikganj', 'Manikganj', 'মানিকগঞ্জ', 'Dhaka', ['Manikganj', 'Manikgonj'], []],
  ['munshiganj', 'Munshiganj', 'মুন্সীগঞ্জ', 'Dhaka', ['Munshiganj', 'Munshiganj Sadar'], []],
  ['narayanganj', 'Narayanganj', 'নারায়ণগঞ্জ', 'Dhaka', ['Narayanganj', 'Narayanganj Sadar'], []],
  ['narsingdi', 'Narsingdi', 'নরসিংদী', 'Dhaka', ['Narsingdi', 'Narsingdi Sadar'], []],
  ['rajbari', 'Rajbari', 'রাজবাড়ী', 'Dhaka', ['Rajbari'], []],
  ['shariatpur', 'Shariatpur', 'শরীয়তপুর', 'Dhaka', ['Shariatpur', 'Shariatpur Sadar', 'Palong'], []],
  ['tangail', 'Tangail', 'টাঙ্গাইল', 'Dhaka', ['Tangail'], []],
  // Chattogram division
  ['chattogram', 'Chattogram', 'চট্টগ্রাম', 'Chittagong|Chattogram', ['Chittagong', 'Chattogram'], ['chittagong', 'chittagonj'], 1],
  ['bandarban', 'Bandarban', 'বান্দরবান', 'Chittagong|Chattogram', ['Bandarban'], []],
  ['brahmanbaria', 'Brahmanbaria', 'ব্রাহ্মণবাড়িয়া', 'Chittagong|Chattogram', ['Brahmanbaria', 'Brahmanbaria Sadar'], []],
  ['chandpur', 'Chandpur', 'চাঁদপুর', 'Chittagong|Chattogram', ['Chandpur'], []],
  ['cumilla', 'Cumilla', 'কুমিল্লা', 'Chittagong|Chattogram', ['Comilla', 'Cumilla'], ['comilla']],
  ['coxs-bazar', 'Cox’s Bazar', 'কক্সবাজার', 'Chittagong|Chattogram', ['Cox\'s Bazar', 'Coxs Bazar'], ['cox-s-bazar', 'coxsbazar']],
  ['feni', 'Feni', 'ফেনী', 'Chittagong|Chattogram', ['Feni'], []],
  ['khagrachhari', 'Khagrachhari', 'খাগড়াছড়ি', 'Chittagong|Chattogram', ['Khagrachari', 'Khagrachhari'], ['khagrachari']],
  ['lakshmipur', 'Lakshmipur', 'লক্ষ্মীপুর', 'Chittagong|Chattogram', ['Lakshmipur', 'Laxmipur'], ['laxmipur']],
  ['noakhali', 'Noakhali', 'নোয়াখালী', 'Chittagong|Chattogram', ['Noakhali', 'Maijdee'], []],
  ['rangamati', 'Rangamati', 'রাঙ্গামাটি', 'Chittagong|Chattogram', ['Rangamati'], []],
  // Rajshahi division
  ['rajshahi', 'Rajshahi', 'রাজশাহী', 'Rajshahi', ['Rajshahi'], [], 1],
  ['bogura', 'Bogura', 'বগুড়া', 'Rajshahi', ['Bogra', 'Bogura'], ['bogra']],
  ['joypurhat', 'Joypurhat', 'জয়পুরহাট', 'Rajshahi', ['Joypurhat', 'Jaipurhat'], ['jaipurhat']],
  ['naogaon', 'Naogaon', 'নওগাঁ', 'Rajshahi', ['Naogaon'], []],
  ['natore', 'Natore', 'নাটোর', 'Rajshahi', ['Natore'], []],
  ['chapainawabganj', 'Chapainawabganj', 'চাঁপাইনবাবগঞ্জ', 'Rajshahi', ['Nawabganj', 'Chapai Nawabganj', 'Chapainawabganj'], ['nawabganj']],
  ['pabna', 'Pabna', 'পাবনা', 'Rajshahi', ['Pabna'], []],
  ['sirajganj', 'Sirajganj', 'সিরাজগঞ্জ', 'Rajshahi', ['Sirajganj', 'Sirajgonj'], []],
  // Khulna division
  ['khulna', 'Khulna', 'খুলনা', 'Khulna', ['Khulna'], [], 1],
  ['bagerhat', 'Bagerhat', 'বাগেরহাট', 'Khulna', ['Bagerhat'], []],
  ['chuadanga', 'Chuadanga', 'চুয়াডাঙ্গা', 'Khulna', ['Chuadanga'], []],
  ['jashore', 'Jashore', 'যশোর', 'Khulna', ['Jessore', 'Jashore'], ['jessore']],
  ['jhenaidah', 'Jhenaidah', 'ঝিনাইদহ', 'Khulna', ['Jhenaidah', 'Jhenida'], ['jhenida']],
  ['kushtia', 'Kushtia', 'কুষ্টিয়া', 'Khulna', ['Kushtia'], []],
  ['magura', 'Magura', 'মাগুরা', 'Khulna', ['Magura'], []],
  ['meherpur', 'Meherpur', 'মেহেরপুর', 'Khulna', ['Meherpur'], []],
  ['narail', 'Narail', 'নড়াইল', 'Khulna', ['Narail'], []],
  ['satkhira', 'Satkhira', 'সাতক্ষীরা', 'Khulna', ['Satkhira'], []],
  // Barishal division
  ['barishal', 'Barishal', 'বরিশাল', 'Barisal|Barishal', ['Barisal', 'Barishal'], ['barisal'], 1],
  ['barguna', 'Barguna', 'বরগুনা', 'Barisal|Barishal', ['Barguna'], []],
  ['bhola', 'Bhola', 'ভোলা', 'Barisal|Barishal', ['Bhola'], []],
  ['jhalokati', 'Jhalokati', 'ঝালকাঠি', 'Barisal|Barishal|Dhaka', ['Jhalakati'], ['jhalakathi']],
  ['patuakhali', 'Patuakhali', 'পটুয়াখালী', 'Barisal|Barishal', ['Patuakhali'], []],
  ['pirojpur', 'Pirojpur', 'পিরোজপুর', 'Barisal|Barishal', ['Pirojpur'], []],
  // Sylhet division
  ['sylhet', 'Sylhet', 'সিলেট', 'Sylhet', ['Sylhet'], [], 1],
  ['habiganj', 'Habiganj', 'হবিগঞ্জ', 'Sylhet', ['Habiganj', 'Hobiganj'], []],
  ['moulvibazar', 'Moulvibazar', 'মৌলভীবাজার', 'Sylhet', ['Moulvi Bazar', 'Maulvi Bazar'], ['maulvibazar']],
  ['sunamganj', 'Sunamganj', 'সুনামগঞ্জ', 'Sylhet', ['Sunamganj', 'Sunamgonj'], []],
  // Rangpur division
  ['rangpur', 'Rangpur', 'রংপুর', 'Rangpur', ['Rangpur'], [], 1],
  ['dinajpur', 'Dinajpur', 'দিনাজপুর', 'Rangpur', ['Dinajpur'], []],
  ['gaibandha', 'Gaibandha', 'গাইবান্ধা', 'Rangpur', ['Gaibandha'], []],
  ['kurigram', 'Kurigram', 'কুড়িগ্রাম', 'Rangpur', ['Kurigram'], []],
  ['lalmonirhat', 'Lalmonirhat', 'লালমনিরহাট', 'Rangpur', ['Lalmonirhat', 'Lalmanirhat'], []],
  ['nilphamari', 'Nilphamari', 'নীলফামারী', 'Rangpur', ['Nilphamari'], []],
  ['panchagarh', 'Panchagarh', 'পঞ্চগড়', 'Rangpur', ['Panchagarh'], []],
  ['thakurgaon', 'Thakurgaon', 'ঠাকুরগাঁও', 'Rangpur', ['Thakurgaon'], []],
  // Mymensingh division
  ['mymensingh', 'Mymensingh', 'ময়মনসিংহ', 'Mymensingh', ['Mymensingh'], [], 1],
  ['jamalpur', 'Jamalpur', 'জামালপুর', 'Mymensingh', ['Jamalpur'], []],
  ['netrokona', 'Netrokona', 'নেত্রকোণা', 'Mymensingh', ['Netrakona', 'Netrokona'], ['netrakona']],
  ['sherpur', 'Sherpur', 'শেরপুর', 'Mymensingh', ['Sherpur'], []],
]

// method ids = adhan CalculationMethod keys (same ids as components/prayer/prayer-view.tsx)
const SA = 'UmmAlQura', KARACHI = 'Karachi', MWL = 'MuslimWorldLeague', SG = 'Singapore', NA = 'NorthAmerica'
/** [slug, english, bangla, country code, geocoder query, admin hint (optional, '' = none), method, madhab, aliases] */
const WORLD = [
  // Saudi Arabia
  ['makkah', 'Makkah', 'মক্কা', 'SA', 'Mecca', 'Mecca', SA, 'shafi', ['mecca', 'makka']],
  ['madinah', 'Madinah', 'মদিনা', 'SA', 'Medina', 'Medina', SA, 'shafi', ['medina', 'madina']],
  ['riyadh', 'Riyadh', 'রিয়াদ', 'SA', 'Riyadh', '', SA, 'shafi', []],
  ['jeddah', 'Jeddah', 'জেদ্দা', 'SA', 'Jeddah', '', SA, 'shafi', ['jiddah']],
  ['dammam', 'Dammam', 'দাম্মাম', 'SA', 'Dammam', '', SA, 'shafi', []],
  ['taif', 'Taif', 'তায়েফ', 'SA', 'Taif', '', SA, 'shafi', []],
  // Gulf
  ['dubai', 'Dubai', 'দুবাই', 'AE', 'Dubai', 'Dubai', 'Dubai', 'shafi', []],
  ['abu-dhabi', 'Abu Dhabi', 'আবুধাবি', 'AE', 'Abu Dhabi', '', 'Dubai', 'shafi', []],
  ['sharjah', 'Sharjah', 'শারজাহ', 'AE', 'Sharjah', '', 'Dubai', 'shafi', []],
  ['doha', 'Doha', 'দোহা', 'QA', 'Doha', '', 'Qatar', 'shafi', []],
  ['kuwait-city', 'Kuwait City', 'কুয়েত সিটি', 'KW', 'Kuwait City', '', 'Kuwait', 'shafi', []],
  ['muscat', 'Muscat', 'মাসকাট', 'OM', 'Muscat', '', 'Dubai', 'shafi', []],
  ['manama', 'Manama', 'মানামা', 'BH', 'Manama', '', 'Kuwait', 'shafi', []],
  // Middle East & North Africa
  ['cairo', 'Cairo', 'কায়রো', 'EG', 'Cairo', '', 'Egyptian', 'shafi', []],
  ['alexandria', 'Alexandria', 'আলেকজান্দ্রিয়া', 'EG', 'Alexandria', '', 'Egyptian', 'shafi', []],
  ['amman', 'Amman', 'আম্মান', 'JO', 'Amman', '', MWL, 'shafi', []],
  ['baghdad', 'Baghdad', 'বাগদাদ', 'IQ', 'Baghdad', '', MWL, 'shafi', []],
  ['tehran', 'Tehran', 'তেহরান', 'IR', 'Tehran', '', 'Tehran', 'shafi', []],
  ['damascus', 'Damascus', 'দামেস্ক', 'SY', 'Damascus', '', MWL, 'shafi', []],
  ['beirut', 'Beirut', 'বৈরুত', 'LB', 'Beirut', '', MWL, 'shafi', []],
  ['jerusalem', 'Jerusalem', 'জেরুজালেম', 'IL', 'Jerusalem', '', MWL, 'shafi', ['al-quds']],
  ['istanbul', 'Istanbul', 'ইস্তাম্বুল', 'TR', 'Istanbul', 'Istanbul', 'Turkey', 'shafi', []],
  ['ankara', 'Ankara', 'আঙ্কারা', 'TR', 'Ankara', '', 'Turkey', 'shafi', []],
  ['casablanca', 'Casablanca', 'কাসাব্লাঙ্কা', 'MA', 'Casablanca', '', MWL, 'shafi', []],
  ['algiers', 'Algiers', 'আলজিয়ার্স', 'DZ', 'Algiers', '', MWL, 'shafi', []],
  ['tunis', 'Tunis', 'তিউনিস', 'TN', 'Tunis', '', MWL, 'shafi', []],
  ['khartoum', 'Khartoum', 'খার্তুম', 'SD', 'Khartoum', '', 'Egyptian', 'shafi', []],
  // South & Central Asia
  ['karachi', 'Karachi', 'করাচি', 'PK', 'Karachi', 'Sindh', KARACHI, 'hanafi', []],
  ['lahore', 'Lahore', 'লাহোর', 'PK', 'Lahore', 'Punjab', KARACHI, 'hanafi', []],
  ['islamabad', 'Islamabad', 'ইসলামাবাদ', 'PK', 'Islamabad', '', KARACHI, 'hanafi', []],
  ['delhi', 'Delhi', 'দিল্লি', 'IN', 'Delhi', 'Delhi', KARACHI, 'hanafi', ['new-delhi']],
  ['mumbai', 'Mumbai', 'মুম্বাই', 'IN', 'Mumbai', 'Maharashtra', KARACHI, 'hanafi', ['bombay']],
  ['kolkata', 'Kolkata', 'কলকাতা', 'IN', 'Kolkata', 'West Bengal', KARACHI, 'hanafi', ['calcutta']],
  ['hyderabad', 'Hyderabad', 'হায়দরাবাদ', 'IN', 'Hyderabad', 'Telangana', KARACHI, 'hanafi', []],
  ['kabul', 'Kabul', 'কাবুল', 'AF', 'Kabul', '', KARACHI, 'hanafi', []],
  ['tashkent', 'Tashkent', 'তাশখন্দ', 'UZ', 'Tashkent', '', MWL, 'hanafi', []],
  ['colombo', 'Colombo', 'কলম্বো', 'LK', 'Colombo', '', KARACHI, 'shafi', []],
  // South-east & East Asia
  ['kuala-lumpur', 'Kuala Lumpur', 'কুয়ালালামপুর', 'MY', 'Kuala Lumpur', '', SG, 'shafi', []],
  ['jakarta', 'Jakarta', 'জাকার্তা', 'ID', 'Jakarta', '', SG, 'shafi', []],
  ['singapore', 'Singapore', 'সিঙ্গাপুর', 'SG', 'Singapore', '', SG, 'shafi', []],
  ['bandar-seri-begawan', 'Bandar Seri Begawan', 'বন্দর সেরি বেগাওয়ান', 'BN', 'Bandar Seri Begawan', '', SG, 'shafi', ['brunei']],
  ['bangkok', 'Bangkok', 'ব্যাংকক', 'TH', 'Bangkok', '', SG, 'shafi', []],
  ['manila', 'Manila', 'ম্যানিলা', 'PH', 'Manila', '', MWL, 'shafi', []],
  ['tokyo', 'Tokyo', 'টোকিও', 'JP', 'Tokyo', '', MWL, 'shafi', []],
  ['seoul', 'Seoul', 'সিউল', 'KR', 'Seoul', '', MWL, 'shafi', []],
  ['beijing', 'Beijing', 'বেইজিং', 'CN', 'Beijing', '', MWL, 'shafi', ['peking']],
  ['hong-kong', 'Hong Kong', 'হংকং', 'HK', 'Hong Kong', '', MWL, 'shafi', []],
  // Europe
  ['london', 'London', 'লন্ডন', 'GB', 'London', 'England', MWL, 'hanafi', []],
  ['birmingham', 'Birmingham', 'বার্মিংহাম', 'GB', 'Birmingham', 'England', MWL, 'hanafi', []],
  ['manchester', 'Manchester', 'ম্যানচেস্টার', 'GB', 'Manchester', 'England', MWL, 'hanafi', []],
  ['bradford', 'Bradford', 'ব্র্যাডফোর্ড', 'GB', 'Bradford', 'England', MWL, 'hanafi', []],
  ['leicester', 'Leicester', 'লেস্টার', 'GB', 'Leicester', 'England', MWL, 'hanafi', []],
  ['glasgow', 'Glasgow', 'গ্লাসগো', 'GB', 'Glasgow', 'Scotland', MWL, 'hanafi', []],
  ['paris', 'Paris', 'প্যারিস', 'FR', 'Paris', 'Île-de-France|Ile-de-France', MWL, 'shafi', []],
  ['marseille', 'Marseille', 'মার্সেই', 'FR', 'Marseille', '', MWL, 'shafi', []],
  ['berlin', 'Berlin', 'বার্লিন', 'DE', 'Berlin', 'Berlin', MWL, 'shafi', []],
  ['rome', 'Rome', 'রোম', 'IT', 'Rome', 'Lazio', MWL, 'shafi', []],
  ['madrid', 'Madrid', 'মাদ্রিদ', 'ES', 'Madrid', '', MWL, 'shafi', []],
  ['amsterdam', 'Amsterdam', 'আমস্টারডাম', 'NL', 'Amsterdam', '', MWL, 'shafi', []],
  ['brussels', 'Brussels', 'ব্রাসেলস', 'BE', 'Brussels', '', MWL, 'shafi', []],
  ['stockholm', 'Stockholm', 'স্টকহোম', 'SE', 'Stockholm', '', MWL, 'shafi', []],
  ['moscow', 'Moscow', 'মস্কো', 'RU', 'Moscow', '', MWL, 'shafi', []],
  ['sarajevo', 'Sarajevo', 'সারায়েভো', 'BA', 'Sarajevo', '', MWL, 'shafi', []],
  // North America
  ['new-york', 'New York', 'নিউ ইয়র্ক', 'US', 'New York City', 'New York', NA, 'shafi', ['new-york-city', 'nyc']],
  ['chicago', 'Chicago', 'শিকাগো', 'US', 'Chicago', 'Illinois', NA, 'shafi', []],
  ['los-angeles', 'Los Angeles', 'লস অ্যাঞ্জেলেস', 'US', 'Los Angeles', 'California', NA, 'shafi', []],
  ['houston', 'Houston', 'হিউস্টন', 'US', 'Houston', 'Texas', NA, 'shafi', []],
  ['detroit', 'Detroit', 'ডেট্রয়েট', 'US', 'Detroit', 'Michigan', NA, 'shafi', []],
  ['washington-dc', 'Washington, D.C.', 'ওয়াশিংটন, ডি.সি.', 'US', 'Washington', 'District of Columbia', NA, 'shafi', ['washington']],
  ['toronto', 'Toronto', 'টরন্টো', 'CA', 'Toronto', 'Ontario', NA, 'shafi', []],
  ['montreal', 'Montréal', 'মন্ট্রিয়াল', 'CA', 'Montreal', 'Quebec', NA, 'shafi', ['montreal']],
  ['vancouver', 'Vancouver', 'ভ্যাঙ্কুভার', 'CA', 'Vancouver', 'British Columbia', NA, 'shafi', []],
  // Oceania
  ['sydney', 'Sydney', 'সিডনি', 'AU', 'Sydney', 'New South Wales', MWL, 'shafi', []],
  ['melbourne', 'Melbourne', 'মেলবোর্ন', 'AU', 'Melbourne', 'Victoria', MWL, 'shafi', []],
  ['auckland', 'Auckland', 'অকল্যান্ড', 'NZ', 'Auckland', '', MWL, 'shafi', []],
  // Sub-Saharan Africa
  ['johannesburg', 'Johannesburg', 'জোহানেসবার্গ', 'ZA', 'Johannesburg', '', MWL, 'shafi', []],
  ['cape-town', 'Cape Town', 'কেপ টাউন', 'ZA', 'Cape Town', '', MWL, 'shafi', []],
  ['lagos', 'Lagos', 'লাগোস', 'NG', 'Lagos', '', MWL, 'shafi', []],
  ['kano', 'Kano', 'কানো', 'NG', 'Kano', '', MWL, 'shafi', []],
  ['nairobi', 'Nairobi', 'নাইরোবি', 'KE', 'Nairobi', '', MWL, 'shafi', []],
  ['addis-ababa', 'Addis Ababa', 'আদ্দিস আবাবা', 'ET', 'Addis Ababa', '', MWL, 'shafi', []],
  ['dakar', 'Dakar', 'ডাকার', 'SN', 'Dakar', '', MWL, 'shafi', []],
  ['mogadishu', 'Mogadishu', 'মোগাদিশু', 'SO', 'Mogadishu', '', MWL, 'shafi', []],
]

const COUNTRY = {
  BD: { en: 'Bangladesh', bn: 'বাংলাদেশ' }, SA: { en: 'Saudi Arabia', bn: 'সৌদি আরব' }, AE: { en: 'United Arab Emirates', bn: 'সংযুক্ত আরব আমিরাত' },
  QA: { en: 'Qatar', bn: 'কাতার' }, KW: { en: 'Kuwait', bn: 'কুয়েত' }, OM: { en: 'Oman', bn: 'ওমান' }, BH: { en: 'Bahrain', bn: 'বাহরাইন' },
  EG: { en: 'Egypt', bn: 'মিসর' }, JO: { en: 'Jordan', bn: 'জর্ডান' }, IQ: { en: 'Iraq', bn: 'ইরাক' }, IR: { en: 'Iran', bn: 'ইরান' },
  SY: { en: 'Syria', bn: 'সিরিয়া' }, LB: { en: 'Lebanon', bn: 'লেবানন' }, IL: { en: 'Palestine', bn: 'ফিলিস্তিন' }, TR: { en: 'Türkiye', bn: 'তুরস্ক' },
  MA: { en: 'Morocco', bn: 'মরক্কো' }, DZ: { en: 'Algeria', bn: 'আলজেরিয়া' }, TN: { en: 'Tunisia', bn: 'তিউনিসিয়া' }, SD: { en: 'Sudan', bn: 'সুদান' },
  PK: { en: 'Pakistan', bn: 'পাকিস্তান' }, IN: { en: 'India', bn: 'ভারত' }, AF: { en: 'Afghanistan', bn: 'আফগানিস্তান' }, UZ: { en: 'Uzbekistan', bn: 'উজবেকিস্তান' },
  LK: { en: 'Sri Lanka', bn: 'শ্রীলঙ্কা' }, MY: { en: 'Malaysia', bn: 'মালয়েশিয়া' }, ID: { en: 'Indonesia', bn: 'ইন্দোনেশিয়া' }, SG: { en: 'Singapore', bn: 'সিঙ্গাপুর' },
  BN: { en: 'Brunei', bn: 'ব্রুনেই' }, TH: { en: 'Thailand', bn: 'থাইল্যান্ড' }, PH: { en: 'Philippines', bn: 'ফিলিপাইন' }, JP: { en: 'Japan', bn: 'জাপান' },
  KR: { en: 'South Korea', bn: 'দক্ষিণ কোরিয়া' }, CN: { en: 'China', bn: 'চীন' }, HK: { en: 'Hong Kong', bn: 'হংকং' }, GB: { en: 'United Kingdom', bn: 'যুক্তরাজ্য' },
  FR: { en: 'France', bn: 'ফ্রান্স' }, DE: { en: 'Germany', bn: 'জার্মানি' }, IT: { en: 'Italy', bn: 'ইতালি' }, ES: { en: 'Spain', bn: 'স্পেন' },
  NL: { en: 'Netherlands', bn: 'নেদারল্যান্ডস' }, BE: { en: 'Belgium', bn: 'বেলজিয়াম' }, SE: { en: 'Sweden', bn: 'সুইডেন' }, RU: { en: 'Russia', bn: 'রাশিয়া' },
  BA: { en: 'Bosnia and Herzegovina', bn: 'বসনিয়া ও হার্জেগোভিনা' }, US: { en: 'United States', bn: 'যুক্তরাষ্ট্র' }, CA: { en: 'Canada', bn: 'কানাডা' },
  AU: { en: 'Australia', bn: 'অস্ট্রেলিয়া' }, NZ: { en: 'New Zealand', bn: 'নিউজিল্যান্ড' }, ZA: { en: 'South Africa', bn: 'দক্ষিণ আফ্রিকা' },
  NG: { en: 'Nigeria', bn: 'নাইজেরিয়া' }, KE: { en: 'Kenya', bn: 'কেনিয়া' }, ET: { en: 'Ethiopia', bn: 'ইথিওপিয়া' }, SN: { en: 'Senegal', bn: 'সেনেগাল' },
  SO: { en: 'Somalia', bn: 'সোমালিয়া' },
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const norm = (s) => (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const CITYISH = /^(PPLC|PPLA|PPLA2|PPLA3|PPLA4|PPLG|PPL)$/

async function geocode(name) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=10&language=en&format=json`
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(url)
      if (r.ok) return (await r.json()).results ?? []
    } catch {}
    await sleep(800 * (i + 1))
  }
  throw new Error(`geocoding failed for ${name}`)
}

/** Best hit: right country, city-like feature, admin hint (|-separated alternatives) matches admin1/admin2, then highest population. */
function choose(results, cc, hint) {
  const hints = hint ? hint.split('|').map(norm) : []
  const ok = results.filter((r) => r.country_code === cc && CITYISH.test(r.feature_code ?? '') && r.timezone)
  const withHint = hints.length ? ok.filter((r) => hints.some((h) => norm(r.admin1).includes(h) || norm(r.admin2).includes(h) || norm(r.name).includes(h))) : ok
  const pool = withHint.length ? withHint : []
  const rank = (r) => (r.feature_code === 'PPLC' ? 4 : r.feature_code?.startsWith('PPLA') ? 3 : 1)
  pool.sort((a, b) => rank(b) - rank(a) || (b.population ?? 0) - (a.population ?? 0))
  return pool[0]
}

const out = []
const problems = []

async function resolve(label, queries, cc, hint) {
  for (const q of queries) {
    const hit = choose(await geocode(q), cc, hint)
    await sleep(120)
    if (hit) return hit
  }
  problems.push(`${label}: no ${cc} result${hint ? ` in "${hint}"` : ''} for ${queries.join(' / ')}`)
  return null
}

for (const [slug, en, bn, division, queries, aliases, isDiv] of BD) {
  const hit = await resolve(slug, queries, 'BD', division)
  if (!hit) continue
  out.push({ slug, name: { en, bn }, country: 'BD', admin: hit.admin1 ?? null, lat: +hit.latitude.toFixed(4), lng: +hit.longitude.toFixed(4), tz: hit.timezone, method: KARACHI, madhab: 'hanafi', ...(isDiv ? { division: true } : {}), ...(aliases.length ? { aliases } : {}), geonamesId: hit.id })
}
for (const [slug, en, bn, cc, query, hint, method, madhab, aliases] of WORLD) {
  const hit = await resolve(slug, [query], cc, hint)
  if (!hit) continue
  out.push({ slug, name: { en, bn }, country: cc, admin: hit.admin1 ?? null, lat: +hit.latitude.toFixed(4), lng: +hit.longitude.toFixed(4), tz: hit.timezone, method, madhab, ...(aliases.length ? { aliases } : {}), geonamesId: hit.id })
}

// sanity: unique slugs, plausible coordinates / zones
const seen = new Set()
for (const c of out) {
  if (seen.has(c.slug)) problems.push(`duplicate slug ${c.slug}`)
  seen.add(c.slug)
  if (!COUNTRY[c.country]) problems.push(`${c.slug}: country ${c.country} missing from COUNTRY map`)
  if (c.country === 'BD' && (c.lat < 20.5 || c.lat > 26.7 || c.lng < 88 || c.lng > 92.7 || c.tz !== 'Asia/Dhaka')) problems.push(`${c.slug}: outside Bangladesh (${c.lat}, ${c.lng}, ${c.tz})`)
}
if (problems.length) {
  console.error('PROBLEMS:\n' + problems.join('\n'))
  process.exit(1)
}
await mkdir(path.dirname(OUT), { recursive: true })
await writeFile(OUT, JSON.stringify({ source: 'Open-Meteo geocoding API (GeoNames) — https://open-meteo.com/en/docs/geocoding-api', countries: COUNTRY, cities: out }, null, 1) + '\n')
console.log(`wrote ${out.length} places (${out.filter((c) => c.country === 'BD').length} Bangladesh) → ${OUT}`)
