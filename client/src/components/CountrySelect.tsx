import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia","Austria","Azerbaijan",
  "Bahrain","Bangladesh","Belarus","Belgium","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil",
  "Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile",
  "China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark",
  "Djibouti","Dominican Republic","DR Congo","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini",
  "Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece",
  "Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia",
  "Iran","Iraq","Ireland","Israel","Italy","Ivory Coast","Jamaica","Japan","Jordan","Kazakhstan",
  "Kenya","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein",
  "Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius",
  "Mexico","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nepal",
  "Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan",
  "Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania",
  "Russia","Rwanda","Saudi Arabia","Senegal","Serbia","Sierra Leone","Singapore","Slovakia","Slovenia","Somalia",
  "South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria",
  "Taiwan","Tajikistan","Tanzania","Thailand","Togo","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Uganda",
  "Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
];

// Country code to flag emoji mapping for phone codes
const PHONE_CODES: { country: string; code: string; flag: string }[] = [
  { country: "Afghanistan", code: "+93", flag: "🇦🇫" },
  { country: "Albania", code: "+355", flag: "🇦🇱" },
  { country: "Algeria", code: "+213", flag: "🇩🇿" },
  { country: "Argentina", code: "+54", flag: "🇦🇷" },
  { country: "Armenia", code: "+374", flag: "🇦🇲" },
  { country: "Australia", code: "+61", flag: "🇦🇺" },
  { country: "Austria", code: "+43", flag: "🇦🇹" },
  { country: "Azerbaijan", code: "+994", flag: "🇦🇿" },
  { country: "Bahrain", code: "+973", flag: "🇧🇭" },
  { country: "Bangladesh", code: "+880", flag: "🇧🇩" },
  { country: "Belarus", code: "+375", flag: "🇧🇾" },
  { country: "Belgium", code: "+32", flag: "🇧🇪" },
  { country: "Bolivia", code: "+591", flag: "🇧🇴" },
  { country: "Brazil", code: "+55", flag: "🇧🇷" },
  { country: "Bulgaria", code: "+359", flag: "🇧🇬" },
  { country: "Cambodia", code: "+855", flag: "🇰🇭" },
  { country: "Cameroon", code: "+237", flag: "🇨🇲" },
  { country: "Canada", code: "+1", flag: "🇨🇦" },
  { country: "Chile", code: "+56", flag: "🇨🇱" },
  { country: "China", code: "+86", flag: "🇨🇳" },
  { country: "Colombia", code: "+57", flag: "🇨🇴" },
  { country: "Costa Rica", code: "+506", flag: "🇨🇷" },
  { country: "Croatia", code: "+385", flag: "🇭🇷" },
  { country: "Cuba", code: "+53", flag: "🇨🇺" },
  { country: "Cyprus", code: "+357", flag: "🇨🇾" },
  { country: "Czech Republic", code: "+420", flag: "🇨🇿" },
  { country: "Denmark", code: "+45", flag: "🇩🇰" },
  { country: "Dominican Republic", code: "+1-809", flag: "🇩🇴" },
  { country: "Ecuador", code: "+593", flag: "🇪🇨" },
  { country: "Egypt", code: "+20", flag: "🇪🇬" },
  { country: "Estonia", code: "+372", flag: "🇪🇪" },
  { country: "Ethiopia", code: "+251", flag: "🇪🇹" },
  { country: "Finland", code: "+358", flag: "🇫🇮" },
  { country: "France", code: "+33", flag: "🇫🇷" },
  { country: "Georgia", code: "+995", flag: "🇬🇪" },
  { country: "Germany", code: "+49", flag: "🇩🇪" },
  { country: "Ghana", code: "+233", flag: "🇬🇭" },
  { country: "Greece", code: "+30", flag: "🇬🇷" },
  { country: "Guatemala", code: "+502", flag: "🇬🇹" },
  { country: "Honduras", code: "+504", flag: "🇭🇳" },
  { country: "Hungary", code: "+36", flag: "🇭🇺" },
  { country: "Iceland", code: "+354", flag: "🇮🇸" },
  { country: "India", code: "+91", flag: "🇮🇳" },
  { country: "Indonesia", code: "+62", flag: "🇮🇩" },
  { country: "Iran", code: "+98", flag: "🇮🇷" },
  { country: "Iraq", code: "+964", flag: "🇮🇶" },
  { country: "Ireland", code: "+353", flag: "🇮🇪" },
  { country: "Israel", code: "+972", flag: "🇮🇱" },
  { country: "Italy", code: "+39", flag: "🇮🇹" },
  { country: "Jamaica", code: "+1-876", flag: "🇯🇲" },
  { country: "Japan", code: "+81", flag: "🇯🇵" },
  { country: "Jordan", code: "+962", flag: "🇯🇴" },
  { country: "Kazakhstan", code: "+7", flag: "🇰🇿" },
  { country: "Kenya", code: "+254", flag: "🇰🇪" },
  { country: "Kuwait", code: "+965", flag: "🇰🇼" },
  { country: "Latvia", code: "+371", flag: "🇱🇻" },
  { country: "Lebanon", code: "+961", flag: "🇱🇧" },
  { country: "Libya", code: "+218", flag: "🇱🇾" },
  { country: "Lithuania", code: "+370", flag: "🇱🇹" },
  { country: "Luxembourg", code: "+352", flag: "🇱🇺" },
  { country: "Malaysia", code: "+60", flag: "🇲🇾" },
  { country: "Malta", code: "+356", flag: "🇲🇹" },
  { country: "Mexico", code: "+52", flag: "🇲🇽" },
  { country: "Moldova", code: "+373", flag: "🇲🇩" },
  { country: "Mongolia", code: "+976", flag: "🇲🇳" },
  { country: "Montenegro", code: "+382", flag: "🇲🇪" },
  { country: "Morocco", code: "+212", flag: "🇲🇦" },
  { country: "Mozambique", code: "+258", flag: "🇲🇿" },
  { country: "Myanmar", code: "+95", flag: "🇲🇲" },
  { country: "Nepal", code: "+977", flag: "🇳🇵" },
  { country: "Netherlands", code: "+31", flag: "🇳🇱" },
  { country: "New Zealand", code: "+64", flag: "🇳🇿" },
  { country: "Nigeria", code: "+234", flag: "🇳🇬" },
  { country: "North Macedonia", code: "+389", flag: "🇲🇰" },
  { country: "Norway", code: "+47", flag: "🇳🇴" },
  { country: "Oman", code: "+968", flag: "🇴🇲" },
  { country: "Pakistan", code: "+92", flag: "🇵🇰" },
  { country: "Palestine", code: "+970", flag: "🇵🇸" },
  { country: "Panama", code: "+507", flag: "🇵🇦" },
  { country: "Paraguay", code: "+595", flag: "🇵🇾" },
  { country: "Peru", code: "+51", flag: "🇵🇪" },
  { country: "Philippines", code: "+63", flag: "🇵🇭" },
  { country: "Poland", code: "+48", flag: "🇵🇱" },
  { country: "Portugal", code: "+351", flag: "🇵🇹" },
  { country: "Qatar", code: "+974", flag: "🇶🇦" },
  { country: "Romania", code: "+40", flag: "🇷🇴" },
  { country: "Russia", code: "+7", flag: "🇷🇺" },
  { country: "Saudi Arabia", code: "+966", flag: "🇸🇦" },
  { country: "Senegal", code: "+221", flag: "🇸🇳" },
  { country: "Serbia", code: "+381", flag: "🇷🇸" },
  { country: "Singapore", code: "+65", flag: "🇸🇬" },
  { country: "Slovakia", code: "+421", flag: "🇸🇰" },
  { country: "Slovenia", code: "+386", flag: "🇸🇮" },
  { country: "Somalia", code: "+252", flag: "🇸🇴" },
  { country: "South Africa", code: "+27", flag: "🇿🇦" },
  { country: "South Korea", code: "+82", flag: "🇰🇷" },
  { country: "Spain", code: "+34", flag: "🇪🇸" },
  { country: "Sri Lanka", code: "+94", flag: "🇱🇰" },
  { country: "Sudan", code: "+249", flag: "🇸🇩" },
  { country: "Sweden", code: "+46", flag: "🇸🇪" },
  { country: "Switzerland", code: "+41", flag: "🇨🇭" },
  { country: "Syria", code: "+963", flag: "🇸🇾" },
  { country: "Taiwan", code: "+886", flag: "🇹🇼" },
  { country: "Tanzania", code: "+255", flag: "🇹🇿" },
  { country: "Thailand", code: "+66", flag: "🇹🇭" },
  { country: "Tunisia", code: "+216", flag: "🇹🇳" },
  { country: "Turkey", code: "+90", flag: "🇹🇷" },
  { country: "Uganda", code: "+256", flag: "🇺🇬" },
  { country: "Ukraine", code: "+380", flag: "🇺🇦" },
  { country: "United Arab Emirates", code: "+971", flag: "🇦🇪" },
  { country: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { country: "United States", code: "+1", flag: "🇺🇸" },
  { country: "Uruguay", code: "+598", flag: "🇺🇾" },
  { country: "Uzbekistan", code: "+998", flag: "🇺🇿" },
  { country: "Venezuela", code: "+58", flag: "🇻🇪" },
  { country: "Vietnam", code: "+84", flag: "🇻🇳" },
  { country: "Yemen", code: "+967", flag: "🇾🇪" },
  { country: "Zambia", code: "+260", flag: "🇿🇲" },
  { country: "Zimbabwe", code: "+263", flag: "🇿🇼" },
];

// City data per country
const CITIES: Record<string, string[]> = {
  "Lebanon": ["Beirut","Tripoli","Sidon","Tyre","Jounieh","Zahle","Baalbek","Byblos","Aley","Batroun","Nabatieh","Bcharre","Broummana","Ehden","Jbeil"],
  "United Arab Emirates": ["Abu Dhabi","Dubai","Sharjah","Ajman","Ras Al Khaimah","Fujairah","Umm Al Quwain","Al Ain"],
  "Saudi Arabia": ["Riyadh","Jeddah","Mecca","Medina","Dammam","Khobar","Dhahran","Tabuk","Abha","Taif","Hail","Najran","Jubail","Yanbu"],
  "Egypt": ["Cairo","Alexandria","Giza","Sharm El Sheikh","Luxor","Aswan","Hurghada","Port Said","Suez","Mansoura","Tanta","Ismailia"],
  "Jordan": ["Amman","Zarqa","Irbid","Aqaba","Madaba","Jerash","Salt","Mafraq","Karak","Ajloun"],
  "Iraq": ["Baghdad","Basra","Erbil","Sulaymaniyah","Mosul","Kirkuk","Najaf","Karbala","Duhok","Nasiriyah"],
  "Kuwait": ["Kuwait City","Hawalli","Salmiya","Farwaniya","Jahra","Ahmadi","Mangaf","Fahaheel"],
  "Qatar": ["Doha","Al Wakrah","Al Khor","Lusail","Dukhan","Mesaieed","Al Rayyan"],
  "Bahrain": ["Manama","Muharraq","Riffa","Hamad Town","Isa Town","Sitra","Budaiya","Jidhafs"],
  "Oman": ["Muscat","Salalah","Sohar","Nizwa","Sur","Ibri","Barka","Rustaq","Seeb"],
  "Syria": ["Damascus","Aleppo","Homs","Latakia","Hama","Tartus","Deir ez-Zor","Raqqa","Idlib","Daraa"],
  "Palestine": ["Ramallah","Gaza","Nablus","Hebron","Bethlehem","Jenin","Tulkarm","Jericho","Qalqilya"],
  "France": ["Paris","Marseille","Lyon","Toulouse","Nice","Nantes","Strasbourg","Montpellier","Bordeaux","Lille"],
  "Germany": ["Berlin","Munich","Hamburg","Frankfurt","Cologne","Stuttgart","Dusseldorf","Leipzig","Dortmund","Essen"],
  "United Kingdom": ["London","Manchester","Birmingham","Leeds","Glasgow","Liverpool","Edinburgh","Bristol","Sheffield","Cardiff"],
  "United States": ["New York","Los Angeles","Chicago","Houston","Phoenix","Philadelphia","San Antonio","San Diego","Dallas","San Jose"],
  "Canada": ["Toronto","Montreal","Vancouver","Calgary","Edmonton","Ottawa","Winnipeg","Quebec City","Hamilton","Kitchener"],
  "Turkey": ["Istanbul","Ankara","Izmir","Bursa","Antalya","Adana","Gaziantep","Konya","Mersin","Kayseri"],
  "India": ["Mumbai","Delhi","Bangalore","Hyderabad","Chennai","Kolkata","Pune","Ahmedabad","Jaipur","Lucknow"],
};

export { COUNTRIES, CITIES, PHONE_CODES };

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  allowEmpty?: boolean;
}

export function CountrySelect({ value, onChange, placeholder = "Select country", className = "", allowEmpty = false }: CountrySelectProps) {
  return (
    <Select value={value || "__empty__"} onValueChange={(v) => onChange(v === "__empty__" ? "" : v)}>
      <SelectTrigger className={`rounded-lg h-10 ${className}`}><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent className="max-h-60">
        {allowEmpty && <SelectItem value="__empty__">All / Default</SelectItem>}
        {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

interface CitySelectProps {
  country: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  allowEmpty?: boolean;
}

export function CitySelect({ country, value, onChange, placeholder = "Select city", className = "", allowEmpty = false }: CitySelectProps) {
  const cities = CITIES[country] || [];

  if (cities.length === 0) {
    return (
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`rounded-lg h-10 ${className}`}
      />
    );
  }

  return (
    <Select value={value || "__empty__"} onValueChange={(v) => onChange(v === "__empty__" ? "" : v)}>
      <SelectTrigger className={`rounded-lg h-10 ${className}`}><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent className="max-h-60">
        {allowEmpty && <SelectItem value="__empty__">All / Default</SelectItem>}
        {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function PhoneInput({ value, onChange, className = "" }: PhoneInputProps) {
  // Parse existing value to extract code and number
  const [searchTerm, setSearchTerm] = useState("");

  const matchedCode = useMemo(() => {
    if (!value) return null;
    // Find the longest matching phone code
    const sorted = [...PHONE_CODES].sort((a, b) => b.code.length - a.code.length);
    for (const pc of sorted) {
      if (value.startsWith(pc.code)) return pc;
    }
    return null;
  }, [value]);

  const phoneNumber = matchedCode ? value.slice(matchedCode.code.length) : value?.replace(/^\+\d{1,4}/, "") || "";
  const selectedCode = matchedCode?.code || "+1";

  const filteredCodes = useMemo(() => {
    if (!searchTerm) return PHONE_CODES;
    const lower = searchTerm.toLowerCase();
    return PHONE_CODES.filter(pc =>
      pc.country.toLowerCase().includes(lower) || pc.code.includes(searchTerm)
    );
  }, [searchTerm]);

  return (
    <div className={`flex gap-1.5 ${className}`}>
      <Select value={selectedCode} onValueChange={(code) => onChange(code + phoneNumber)}>
        <SelectTrigger className="w-28 rounded-lg h-10 shrink-0">
          <SelectValue>
            {matchedCode ? `${matchedCode.flag} ${matchedCode.code}` : selectedCode}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-60">
          <div className="px-2 pb-2 sticky top-0 bg-popover">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 pl-7 text-xs rounded-md"
              />
            </div>
          </div>
          {filteredCodes.map(pc => (
            <SelectItem key={`${pc.country}-${pc.code}`} value={pc.code}>
              {pc.flag} {pc.code} {pc.country}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="tel"
        value={phoneNumber}
        onChange={(e) => {
          const num = e.target.value.replace(/[^\d]/g, "");
          onChange(selectedCode + num);
        }}
        placeholder="Phone number"
        className="flex-1 rounded-lg h-10"
      />
    </div>
  );
}
