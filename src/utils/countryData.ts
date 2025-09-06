// Comprehensive worldwide country data for phone input
export interface Country {
  code: string;
  name: string;
  phoneCode: string;
  flag: string;
  pattern?: RegExp;
  placeholder?: string;
  maxLength?: number;
  validPrefixes?: string[];
}

export const COUNTRIES: Country[] = [
  // Asia Pacific
  {
    code: 'ID',
    name: 'Indonesia',
    phoneCode: '+62',
    flag: '🇮🇩',
    pattern: /^8[1-9][0-9]{7,12}$/,
    placeholder: '812-3456-7890',
    maxLength: 13,
    validPrefixes: ['81', '82', '83', '85', '87', '88', '89']
  },
  {
    code: 'MY',
    name: 'Malaysia',
    phoneCode: '+60',
    flag: '🇲🇾',
    pattern: /^[0-9]{9,10}$/,
    placeholder: '12-345-6789',
    maxLength: 11,
    validPrefixes: ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19']
  },
  {
    code: 'SG',
    name: 'Singapore',
    phoneCode: '+65',
    flag: '🇸🇬',
    pattern: /^[689][0-9]{7}$/,
    placeholder: '9123-4567',
    maxLength: 8,
    validPrefixes: ['6', '8', '9']
  },
  {
    code: 'TH',
    name: 'Thailand',
    phoneCode: '+66',
    flag: '🇹🇭',
    pattern: /^[689][0-9]{8}$/,
    placeholder: '81-234-5678',
    maxLength: 9,
    validPrefixes: ['6', '8', '9']
  },
  {
    code: 'VN',
    name: 'Vietnam',
    phoneCode: '+84',
    flag: '🇻🇳',
    pattern: /^[0-9]{9,10}$/,
    placeholder: '90-123-4567',
    maxLength: 10,
    validPrefixes: ['3', '5', '7', '8', '9']
  },
  {
    code: 'PH',
    name: 'Philippines',
    phoneCode: '+63',
    flag: '🇵🇭',
    pattern: /^9[0-9]{9}$/,
    placeholder: '917-123-4567',
    maxLength: 10,
    validPrefixes: ['9']
  },
  {
    code: 'CN',
    name: 'China',
    phoneCode: '+86',
    flag: '🇨🇳',
    pattern: /^1[0-9]{10}$/,
    placeholder: '138-0013-8000',
    maxLength: 11,
    validPrefixes: ['13', '14', '15', '16', '17', '18', '19']
  },
  {
    code: 'JP',
    name: 'Japan',
    phoneCode: '+81',
    flag: '🇯🇵',
    pattern: /^[0-9]{10,11}$/,
    placeholder: '90-1234-5678',
    maxLength: 11,
    validPrefixes: ['90', '80', '70']
  },
  {
    code: 'KR',
    name: 'South Korea',
    phoneCode: '+82',
    flag: '🇰🇷',
    pattern: /^1[0-9]{9}$/,
    placeholder: '10-1234-5678',
    maxLength: 10,
    validPrefixes: ['10', '11']
  },
  {
    code: 'IN',
    name: 'India',
    phoneCode: '+91',
    flag: '🇮🇳',
    pattern: /^[6-9][0-9]{9}$/,
    placeholder: '98765-43210',
    maxLength: 10,
    validPrefixes: ['6', '7', '8', '9']
  },
  {
    code: 'AU',
    name: 'Australia',
    phoneCode: '+61',
    flag: '🇦🇺',
    pattern: /^4[0-9]{8}$/,
    placeholder: '412-345-678',
    maxLength: 9,
    validPrefixes: ['4']
  },
  
  // Americas
  {
    code: 'US',
    name: 'United States',
    phoneCode: '+1',
    flag: '🇺🇸',
    pattern: /^[2-9][0-9]{9}$/,
    placeholder: '(555) 123-4567',
    maxLength: 10,
    validPrefixes: ['2', '3', '4', '5', '6', '7', '8', '9']
  },
  {
    code: 'CA',
    name: 'Canada',
    phoneCode: '+1',
    flag: '🇨🇦',
    pattern: /^[2-9][0-9]{9}$/,
    placeholder: '(555) 123-4567',
    maxLength: 10,
    validPrefixes: ['2', '3', '4', '5', '6', '7', '8', '9']
  },
  {
    code: 'BR',
    name: 'Brazil',
    phoneCode: '+55',
    flag: '🇧🇷',
    pattern: /^[0-9]{10,11}$/,
    placeholder: '11 91234-5678',
    maxLength: 11,
    validPrefixes: ['11', '12', '13', '14', '15', '16', '17', '18', '19', '21']
  },
  {
    code: 'MX',
    name: 'Mexico',
    phoneCode: '+52',
    flag: '🇲🇽',
    pattern: /^[0-9]{10}$/,
    placeholder: '55 1234 5678',
    maxLength: 10,
    validPrefixes: ['55', '33', '81']
  },
  {
    code: 'AR',
    name: 'Argentina',
    phoneCode: '+54',
    flag: '🇦🇷',
    pattern: /^9[0-9]{9}$/,
    placeholder: '9 11 1234-5678',
    maxLength: 10,
    validPrefixes: ['9']
  },
  {
    code: 'CL',
    name: 'Chile',
    phoneCode: '+56',
    flag: '🇨🇱',
    pattern: /^9[0-9]{8}$/,
    placeholder: '9 8765 4321',
    maxLength: 9,
    validPrefixes: ['9']
  },
  {
    code: 'CO',
    name: 'Colombia',
    phoneCode: '+57',
    flag: '🇨🇴',
    pattern: /^3[0-9]{9}$/,
    placeholder: '300 123 4567',
    maxLength: 10,
    validPrefixes: ['30', '31', '32', '33']
  },
  
  // Europe
  {
    code: 'GB',
    name: 'United Kingdom',
    phoneCode: '+44',
    flag: '🇬🇧',
    pattern: /^7[0-9]{9}$/,
    placeholder: '7700 900123',
    maxLength: 10,
    validPrefixes: ['7']
  },
  {
    code: 'DE',
    name: 'Germany',
    phoneCode: '+49',
    flag: '🇩🇪',
    pattern: /^1[5-7][0-9]{8,9}$/,
    placeholder: '151 23456789',
    maxLength: 11,
    validPrefixes: ['15', '16', '17']
  },
  {
    code: 'FR',
    name: 'France',
    phoneCode: '+33',
    flag: '🇫🇷',
    pattern: /^[67][0-9]{8}$/,
    placeholder: '6 12 34 56 78',
    maxLength: 9,
    validPrefixes: ['6', '7']
  },
  {
    code: 'IT',
    name: 'Italy',
    phoneCode: '+39',
    flag: '🇮🇹',
    pattern: /^3[0-9]{9}$/,
    placeholder: '312 345 6789',
    maxLength: 10,
    validPrefixes: ['31', '32', '33', '34', '35', '36', '37', '38', '39']
  },
  {
    code: 'ES',
    name: 'Spain',
    phoneCode: '+34',
    flag: '🇪🇸',
    pattern: /^[67][0-9]{8}$/,
    placeholder: '612 34 56 78',
    maxLength: 9,
    validPrefixes: ['6', '7']
  },
  {
    code: 'NL',
    name: 'Netherlands',
    phoneCode: '+31',
    flag: '🇳🇱',
    pattern: /^6[0-9]{8}$/,
    placeholder: '6 12345678',
    maxLength: 9,
    validPrefixes: ['6']
  },
  {
    code: 'RU',
    name: 'Russia',
    phoneCode: '+7',
    flag: '🇷🇺',
    pattern: /^9[0-9]{9}$/,
    placeholder: '912 345-67-89',
    maxLength: 10,
    validPrefixes: ['9']
  },
  {
    code: 'PL',
    name: 'Poland',
    phoneCode: '+48',
    flag: '🇵🇱',
    pattern: /^[4-9][0-9]{8}$/,
    placeholder: '512 345 678',
    maxLength: 9,
    validPrefixes: ['4', '5', '6', '7', '8', '9']
  },
  {
    code: 'TR',
    name: 'Turkey',
    phoneCode: '+90',
    flag: '🇹🇷',
    pattern: /^5[0-9]{9}$/,
    placeholder: '512 345 67 89',
    maxLength: 10,
    validPrefixes: ['50', '51', '52', '53', '54', '55', '56', '57', '58', '59']
  },
  
  // Middle East & Africa
  {
    code: 'AE',
    name: 'United Arab Emirates',
    phoneCode: '+971',
    flag: '🇦🇪',
    pattern: /^5[0-9]{8}$/,
    placeholder: '50 123 4567',
    maxLength: 9,
    validPrefixes: ['50', '52', '54', '55', '56', '58']
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    phoneCode: '+966',
    flag: '🇸🇦',
    pattern: /^5[0-9]{8}$/,
    placeholder: '50 123 4567',
    maxLength: 9,
    validPrefixes: ['50', '51', '53', '54', '55', '56', '57', '58', '59']
  },
  {
    code: 'EG',
    name: 'Egypt',
    phoneCode: '+20',
    flag: '🇪🇬',
    pattern: /^1[0-9]{9}$/,
    placeholder: '10 1234 5678',
    maxLength: 10,
    validPrefixes: ['10', '11', '12', '15']
  },
  {
    code: 'ZA',
    name: 'South Africa',
    phoneCode: '+27',
    flag: '🇿🇦',
    pattern: /^[6-8][0-9]{8}$/,
    placeholder: '71 123 4567',
    maxLength: 9,
    validPrefixes: ['6', '7', '8']
  },
  {
    code: 'NG',
    name: 'Nigeria',
    phoneCode: '+234',
    flag: '🇳🇬',
    pattern: /^[7-9][0-9]{9}$/,
    placeholder: '803 123 4567',
    maxLength: 10,
    validPrefixes: ['70', '80', '81', '90', '91']
  },
  
  // Additional Popular Countries
  {
    code: 'BD',
    name: 'Bangladesh',
    phoneCode: '+880',
    flag: '🇧🇩',
    pattern: /^1[3-9][0-9]{8}$/,
    placeholder: '171 234 5678',
    maxLength: 10,
    validPrefixes: ['13', '14', '15', '16', '17', '18', '19']
  },
  {
    code: 'PK',
    name: 'Pakistan',
    phoneCode: '+92',
    flag: '🇵🇰',
    pattern: /^3[0-9]{9}$/,
    placeholder: '301 234 5678',
    maxLength: 10,
    validPrefixes: ['30', '31', '32', '33', '34', '35']
  },
  {
    code: 'IR',
    name: 'Iran',
    phoneCode: '+98',
    flag: '🇮🇷',
    pattern: /^9[0-9]{9}$/,
    placeholder: '912 345 6789',
    maxLength: 10,
    validPrefixes: ['90', '91', '92', '93', '94', '99']
  },
  {
    code: 'IL',
    name: 'Israel',
    phoneCode: '+972',
    flag: '🇮🇱',
    pattern: /^5[0-9]{8}$/,
    placeholder: '50-123-4567',
    maxLength: 9,
    validPrefixes: ['50', '52', '53', '54', '55', '57', '58']
  },
  {
    code: 'LK',
    name: 'Sri Lanka',
    phoneCode: '+94',
    flag: '🇱🇰',
    pattern: /^7[0-9]{8}$/,
    placeholder: '71 234 5678',
    maxLength: 9,
    validPrefixes: ['70', '71', '72', '74', '75', '76', '77', '78']
  },
  {
    code: 'MM',
    name: 'Myanmar',
    phoneCode: '+95',
    flag: '🇲🇲',
    pattern: /^9[0-9]{8,9}$/,
    placeholder: '9 123 456 789',
    maxLength: 10,
    validPrefixes: ['9']
  },
  {
    code: 'KH',
    name: 'Cambodia',
    phoneCode: '+855',
    flag: '🇰🇭',
    pattern: /^[0-9]{8,9}$/,
    placeholder: '12 345 678',
    maxLength: 9,
    validPrefixes: ['1', '6', '7', '8', '9']
  },
  {
    code: 'LA',
    name: 'Laos',
    phoneCode: '+856',
    flag: '🇱🇦',
    pattern: /^20[0-9]{8}$/,
    placeholder: '20 1234 5678',
    maxLength: 10,
    validPrefixes: ['20']
  },
  {
    code: 'NP',
    name: 'Nepal',
    phoneCode: '+977',
    flag: '🇳🇵',
    pattern: /^98[0-9]{8}$/,
    placeholder: '984-123-4567',
    maxLength: 10,
    validPrefixes: ['98']
  },
  {
    code: 'BT',
    name: 'Bhutan',
    phoneCode: '+975',
    flag: '🇧🇹',
    pattern: /^[17][0-9]{7}$/,
    placeholder: '17-123-456',
    maxLength: 8,
    validPrefixes: ['1', '7']
  },
  {
    code: 'MV',
    name: 'Maldives',
    phoneCode: '+960',
    flag: '🇲🇻',
    pattern: /^[79][0-9]{6}$/,
    placeholder: '771-2345',
    maxLength: 7,
    validPrefixes: ['7', '9']
  },
  {
    code: 'LB',
    name: 'Lebanon',
    phoneCode: '+961',
    flag: '🇱🇧',
    pattern: /^[0-9]{7,8}$/,
    placeholder: '71-123456',
    maxLength: 8,
    validPrefixes: ['3', '7', '8']
  },
  {
    code: 'JO',
    name: 'Jordan',
    phoneCode: '+962',
    flag: '🇯🇴',
    pattern: /^7[0-9]{8}$/,
    placeholder: '79-1234567',
    maxLength: 9,
    validPrefixes: ['77', '78', '79']
  },
  {
    code: 'KW',
    name: 'Kuwait',
    phoneCode: '+965',
    flag: '🇰🇼',
    pattern: /^[569][0-9]{7}$/,
    placeholder: '512-34567',
    maxLength: 8,
    validPrefixes: ['5', '6', '9']
  },
  {
    code: 'BH',
    name: 'Bahrain',
    phoneCode: '+973',
    flag: '🇧🇭',
    pattern: /^[36][0-9]{7}$/,
    placeholder: '3612-3456',
    maxLength: 8,
    validPrefixes: ['3', '6']
  },
  {
    code: 'QA',
    name: 'Qatar',
    phoneCode: '+974',
    flag: '🇶🇦',
    pattern: /^[3567][0-9]{7}$/,
    placeholder: '3312-3456',
    maxLength: 8,
    validPrefixes: ['3', '5', '6', '7']
  },
  {
    code: 'OM',
    name: 'Oman',
    phoneCode: '+968',
    flag: '🇴🇲',
    pattern: /^9[0-9]{7}$/,
    placeholder: '9123-4567',
    maxLength: 8,
    validPrefixes: ['9']
  },
  {
    code: 'YE',
    name: 'Yemen',
    phoneCode: '+967',
    flag: '🇾🇪',
    pattern: /^7[0-9]{8}$/,
    placeholder: '712-345-678',
    maxLength: 9,
    validPrefixes: ['70', '71', '73', '77', '78']
  },
  {
    code: 'AF',
    name: 'Afghanistan',
    phoneCode: '+93',
    flag: '🇦🇫',
    pattern: /^7[0-9]{8}$/,
    placeholder: '701-234-567',
    maxLength: 9,
    validPrefixes: ['70', '77', '78', '79']
  },
  
  // Additional countries to make it comprehensive...
  {
    code: 'AD',
    name: 'Andorra',
    phoneCode: '+376',
    flag: '🇦🇩',
    pattern: /^[36][0-9]{5}$/,
    placeholder: '312-345',
    maxLength: 6,
    validPrefixes: ['3', '6']
  },
  {
    code: 'AL',
    name: 'Albania',
    phoneCode: '+355',
    flag: '🇦🇱',
    pattern: /^6[0-9]{8}$/,
    placeholder: '67-123-4567',
    maxLength: 9,
    validPrefixes: ['66', '67', '68', '69']
  },
  {
    code: 'AM',
    name: 'Armenia',
    phoneCode: '+374',
    flag: '🇦🇲',
    pattern: /^[0-9]{8}$/,
    placeholder: '77-123-456',
    maxLength: 8,
    validPrefixes: ['77', '91', '93', '94', '95', '96', '97', '98', '99']
  },
  {
    code: 'AT',
    name: 'Austria',
    phoneCode: '+43',
    flag: '🇦🇹',
    pattern: /^6[0-9]{8,9}$/,
    placeholder: '664 123456',
    maxLength: 10,
    validPrefixes: ['6']
  },
  {
    code: 'AZ',
    name: 'Azerbaijan',
    phoneCode: '+994',
    flag: '🇦🇿',
    pattern: /^[0-9]{9}$/,
    placeholder: '40-123-45-67',
    maxLength: 9,
    validPrefixes: ['40', '50', '51', '55', '70', '77']
  },
  {
    code: 'BA',
    name: 'Bosnia and Herzegovina',
    phoneCode: '+387',
    flag: '🇧🇦',
    pattern: /^6[0-9]{7}$/,
    placeholder: '61-123-456',
    maxLength: 8,
    validPrefixes: ['60', '61', '62', '63', '64', '65', '66', '67', '68']
  },
  {
    code: 'BE',
    name: 'Belgium',
    phoneCode: '+32',
    flag: '🇧🇪',
    pattern: /^4[0-9]{8}$/,
    placeholder: '470-12-34-56',
    maxLength: 9,
    validPrefixes: ['4']
  },
  {
    code: 'BG',
    name: 'Bulgaria',
    phoneCode: '+359',
    flag: '🇧🇬',
    pattern: /^[0-9]{8,9}$/,
    placeholder: '87-123-4567',
    maxLength: 9,
    validPrefixes: ['87', '88', '89', '98', '99']
  },
  {
    code: 'BY',
    name: 'Belarus',
    phoneCode: '+375',
    flag: '🇧🇾',
    pattern: /^[0-9]{9}$/,
    placeholder: '29-123-45-67',
    maxLength: 9,
    validPrefixes: ['25', '29', '33', '44']
  },
  {
    code: 'CH',
    name: 'Switzerland',
    phoneCode: '+41',
    flag: '🇨🇭',
    pattern: /^7[0-9]{8}$/,
    placeholder: '78 123 45 67',
    maxLength: 9,
    validPrefixes: ['74', '75', '76', '77', '78', '79']
  },
  {
    code: 'CY',
    name: 'Cyprus',
    phoneCode: '+357',
    flag: '🇨🇾',
    pattern: /^9[0-9]{7}$/,
    placeholder: '96-123456',
    maxLength: 8,
    validPrefixes: ['95', '96', '97', '99']
  },
  {
    code: 'CZ',
    name: 'Czech Republic',
    phoneCode: '+420',
    flag: '🇨🇿',
    pattern: /^[0-9]{9}$/,
    placeholder: '601-123-456',
    maxLength: 9,
    validPrefixes: ['60', '70', '72', '73', '77', '79']
  },
  {
    code: 'DK',
    name: 'Denmark',
    phoneCode: '+45',
    flag: '🇩🇰',
    pattern: /^[0-9]{8}$/,
    placeholder: '20-12-34-56',
    maxLength: 8,
    validPrefixes: ['2', '3', '4', '5', '6', '7', '8', '9']
  },
  {
    code: 'EE',
    name: 'Estonia',
    phoneCode: '+372',
    flag: '🇪🇪',
    pattern: /^5[0-9]{7}$/,
    placeholder: '512-3456',
    maxLength: 8,
    validPrefixes: ['5']
  },
  {
    code: 'FI',
    name: 'Finland',
    phoneCode: '+358',
    flag: '🇫🇮',
    pattern: /^[0-9]{9}$/,
    placeholder: '40-123-4567',
    maxLength: 9,
    validPrefixes: ['40', '41', '42', '43', '44', '45', '46', '50']
  },
  {
    code: 'GE',
    name: 'Georgia',
    phoneCode: '+995',
    flag: '🇬🇪',
    pattern: /^5[0-9]{8}$/,
    placeholder: '555-12-34-56',
    maxLength: 9,
    validPrefixes: ['5']
  },
  {
    code: 'GR',
    name: 'Greece',
    phoneCode: '+30',
    flag: '🇬🇷',
    pattern: /^6[0-9]{9}$/,
    placeholder: '694-123-4567',
    maxLength: 10,
    validPrefixes: ['69']
  },
  {
    code: 'HR',
    name: 'Croatia',
    phoneCode: '+385',
    flag: '🇭🇷',
    pattern: /^9[0-9]{8}$/,
    placeholder: '91-234-5678',
    maxLength: 9,
    validPrefixes: ['91', '92', '95', '97', '98', '99']
  },
  {
    code: 'HU',
    name: 'Hungary',
    phoneCode: '+36',
    flag: '🇭🇺',
    pattern: /^[0-9]{9}$/,
    placeholder: '20-123-4567',
    maxLength: 9,
    validPrefixes: ['20', '30', '31', '50', '70']
  },
  {
    code: 'IE',
    name: 'Ireland',
    phoneCode: '+353',
    flag: '🇮🇪',
    pattern: /^8[0-9]{8}$/,
    placeholder: '85-123-4567',
    maxLength: 9,
    validPrefixes: ['82', '83', '85', '86', '87', '88', '89']
  },
  {
    code: 'IS',
    name: 'Iceland',
    phoneCode: '+354',
    flag: '🇮🇸',
    pattern: /^[0-9]{7}$/,
    placeholder: '611-2345',
    maxLength: 7,
    validPrefixes: ['6', '7', '8']
  },
  {
    code: 'LI',
    name: 'Liechtenstein',
    phoneCode: '+423',
    flag: '🇱🇮',
    pattern: /^[0-9]{7}$/,
    placeholder: '661-2345',
    maxLength: 7,
    validPrefixes: ['6', '7']
  },
  {
    code: 'LT',
    name: 'Lithuania',
    phoneCode: '+370',
    flag: '🇱🇹',
    pattern: /^6[0-9]{7}$/,
    placeholder: '612-34567',
    maxLength: 8,
    validPrefixes: ['6']
  },
  {
    code: 'LU',
    name: 'Luxembourg',
    phoneCode: '+352',
    flag: '🇱🇺',
    pattern: /^6[0-9]{8}$/,
    placeholder: '621-123-456',
    maxLength: 9,
    validPrefixes: ['6']
  },
  {
    code: 'LV',
    name: 'Latvia',
    phoneCode: '+371',
    flag: '🇱🇻',
    pattern: /^2[0-9]{7}$/,
    placeholder: '21-234-567',
    maxLength: 8,
    validPrefixes: ['2']
  },
  {
    code: 'MC',
    name: 'Monaco',
    phoneCode: '+377',
    flag: '🇲🇨',
    pattern: /^[0-9]{8}$/,
    placeholder: '06-12-34-56-78',
    maxLength: 8,
    validPrefixes: ['4', '6']
  },
  {
    code: 'MD',
    name: 'Moldova',
    phoneCode: '+373',
    flag: '🇲🇩',
    pattern: /^[0-9]{8}$/,
    placeholder: '621-12-345',
    maxLength: 8,
    validPrefixes: ['6', '7']
  },
  {
    code: 'ME',
    name: 'Montenegro',
    phoneCode: '+382',
    flag: '🇲🇪',
    pattern: /^6[0-9]{7}$/,
    placeholder: '67-123-456',
    maxLength: 8,
    validPrefixes: ['6']
  },
  {
    code: 'MK',
    name: 'North Macedonia',
    phoneCode: '+389',
    flag: '🇲🇰',
    pattern: /^7[0-9]{7}$/,
    placeholder: '70-123-456',
    maxLength: 8,
    validPrefixes: ['70', '71', '72', '75', '76', '77', '78']
  },
  {
    code: 'MT',
    name: 'Malta',
    phoneCode: '+356',
    flag: '🇲🇹',
    pattern: /^[0-9]{8}$/,
    placeholder: '7921-2345',
    maxLength: 8,
    validPrefixes: ['77', '79', '99']
  },
  {
    code: 'NO',
    name: 'Norway',
    phoneCode: '+47',
    flag: '🇳🇴',
    pattern: /^[0-9]{8}$/,
    placeholder: '406-12-345',
    maxLength: 8,
    validPrefixes: ['4', '9']
  },
  {
    code: 'PT',
    name: 'Portugal',
    phoneCode: '+351',
    flag: '🇵🇹',
    pattern: /^9[0-9]{8}$/,
    placeholder: '912-345-678',
    maxLength: 9,
    validPrefixes: ['91', '92', '93', '96']
  },
  {
    code: 'RO',
    name: 'Romania',
    phoneCode: '+40',
    flag: '🇷🇴',
    pattern: /^7[0-9]{8}$/,
    placeholder: '712-345-678',
    maxLength: 9,
    validPrefixes: ['70', '72', '73', '74', '75', '76', '78']
  },
  {
    code: 'RS',
    name: 'Serbia',
    phoneCode: '+381',
    flag: '🇷🇸',
    pattern: /^6[0-9]{7,8}$/,
    placeholder: '60-1234567',
    maxLength: 9,
    validPrefixes: ['60', '61', '62', '63', '64', '65', '66', '67', '68', '69']
  },
  {
    code: 'SE',
    name: 'Sweden',
    phoneCode: '+46',
    flag: '🇸🇪',
    pattern: /^7[0-9]{8}$/,
    placeholder: '70-123-45-67',
    maxLength: 9,
    validPrefixes: ['70', '72', '73', '76']
  },
  {
    code: 'SI',
    name: 'Slovenia',
    phoneCode: '+386',
    flag: '🇸🇮',
    pattern: /^[0-9]{8}$/,
    placeholder: '31-123-456',
    maxLength: 8,
    validPrefixes: ['30', '31', '40', '41', '51', '64', '65', '70', '71']
  },
  {
    code: 'SK',
    name: 'Slovakia',
    phoneCode: '+421',
    flag: '🇸🇰',
    pattern: /^9[0-9]{8}$/,
    placeholder: '901-123-456',
    maxLength: 9,
    validPrefixes: ['90', '91', '94', '95', '96', '99']
  },
  {
    code: 'SM',
    name: 'San Marino',
    phoneCode: '+378',
    flag: '🇸🇲',
    pattern: /^[0-9]{6,10}$/,
    placeholder: '66-66-12-12',
    maxLength: 10,
    validPrefixes: ['3', '6']
  },
  {
    code: 'UA',
    name: 'Ukraine',
    phoneCode: '+380',
    flag: '🇺🇦',
    pattern: /^[0-9]{9}$/,
    placeholder: '50-123-4567',
    maxLength: 9,
    validPrefixes: ['39', '50', '63', '66', '67', '68', '73', '91', '92', '93', '94', '95', '96', '97', '98', '99']
  },
  {
    code: 'VA',
    name: 'Vatican City',
    phoneCode: '+39',
    flag: '🇻🇦',
    pattern: /^3[0-9]{9}$/,
    placeholder: '312-345-6789',
    maxLength: 10,
    validPrefixes: ['31', '32', '33', '34', '35', '36', '37', '38', '39']
  },
  {
    code: 'XK',
    name: 'Kosovo',
    phoneCode: '+383',
    flag: '🇽🇰',
    pattern: /^4[0-9]{7}$/,
    placeholder: '43-123-456',
    maxLength: 8,
    validPrefixes: ['43', '44', '45', '49']
  }
];

// Sort countries by name for better UX
COUNTRIES.sort((a, b) => a.name.localeCompare(b.name));
