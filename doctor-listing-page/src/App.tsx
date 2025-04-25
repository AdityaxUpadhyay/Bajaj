import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

interface Doctor {
  name: string;
  experience: number;
  fees: number;
  mode: string;
  speciality: string[];
}

const API_URL = "https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json";

const SPECIALTIES = [
  "General Physician", "Dentist", "Dermatologist", "Paediatrician",
  "Gynaecologist", "ENT", "Diabetologist", "Cardiologist",
  "Physiotherapist", "Endocrinologist", "Orthopaedic", "Ophthalmologist",
  "Gastroenterologist", "Pulmonologist", "Psychiatrist", "Urologist",
  "Dietitian/Nutritionist", "Psychologist", "Sexologist", "Nephrologist",
  "Neurologist", "Oncologist", "Ayurveda", "Homeopath"
];

function App() {
  const [data, setData] = useState<Doctor[]>([]);
  const [filtered, setFiltered] = useState<Doctor[]>([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Doctor[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const moc = searchParams.get("moc") || "";
  const specs = searchParams.get("specialty")?.split(",") || [];
  const sort = searchParams.get("sort") || "";

  useEffect(() => {
    axios.get(API_URL).then((res) => setData(res.data));
  }, []);

  useEffect(() => {
    let result = [...data];
    if (query) result = result.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()));
    if (moc) result = result.filter((d) => d.mode === moc);
    if (specs.length) result = result.filter((d) => Array.isArray(d.speciality) && specs.every((s) => d.speciality.includes(s)));
    if (sort === "fees") result.sort((a, b) => a.fees - b.fees);
    if (sort === "experience") result.sort((a, b) => b.experience - a.experience);
    setFiltered(result);
  }, [query, moc, specs, sort, data]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (!value) return setSuggestions([]);
    const match = data.filter((d) => d.name.toLowerCase().includes(value.toLowerCase())).slice(0, 3);
    setSuggestions(match);
  };

  const updateParam = (key: string, value: string | string[]) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || (Array.isArray(value) && value.length === 0)) {
      newParams.delete(key);
    } else {
      newParams.set(key, Array.isArray(value) ? value.join(",") : value);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-900 p-4">
        <div className="max-w-7xl mx-auto">
          <input
            data-testid="autocomplete-input"
            className="w-full p-2 rounded text-black"
            placeholder="Search doctor..."
            value={query}
            onChange={handleSearch}
            onKeyDown={(e) => e.key === "Enter" && setQuery(query)}
          />
          {suggestions.length > 0 && (
            <ul className="bg-white shadow rounded mt-1">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  data-testid="suggestion-item"
                  className="p-2 hover:bg-gray-200 cursor-pointer"
                  onClick={() => setQuery(s.name)}
                >
                  {s.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto p-4">
        {/* Filters */}
        <aside className="w-1/3 p-4 bg-white shadow rounded mr-4">
          <div className="mb-4">
            <h3 className="font-semibold mb-2" data-testid="filter-header-moc">Mode of Consultation</h3>
            {['Video Consult', 'In Clinic'].map(mode => (
              <label key={mode} className="block mb-1">
                <input
                  type="radio"
                  data-testid={`filter-${mode.toLowerCase().replace(" ", "-")}`}
                  name="moc"
                  checked={moc === mode}
                  onChange={() => updateParam("moc", mode)}
                /> {mode}
              </label>
            ))}
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2" data-testid="filter-header-speciality">Specialties</h3>
            <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto">
              {SPECIALTIES.map(spec => (
                <label key={spec} className="text-sm">
                  <input
                    type="checkbox"
                    data-testid={`filter-specialty-${spec.replaceAll("/", "-").replaceAll(" ", "-")}`}
                    checked={specs.includes(spec)}
                    onChange={() => {
                      const newSpecs = specs.includes(spec)
                        ? specs.filter(s => s !== spec)
                        : [...specs, spec];
                      updateParam("specialty", newSpecs);
                    }}
                  /> {spec}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2" data-testid="filter-header-sort">Sort</h3>
            <label className="block mb-1">
              <input
                type="radio"
                name="sort"
                data-testid="sort-fees"
                checked={sort === "fees"}
                onChange={() => updateParam("sort", "fees")}
              /> Fees (asc)
            </label>
            <label className="block">
              <input
                type="radio"
                name="sort"
                data-testid="sort-experience"
                checked={sort === "experience"}
                onChange={() => updateParam("sort", "experience")}
              /> Experience (desc)
            </label>
          </div>
        </aside>

        {/* Doctor List */}
        <section className="w-2/3 space-y-4">
          {filtered.map((doc, i) => (
            <div key={i} className="bg-white shadow p-4 rounded" data-testid="doctor-card">
              <h4 className="text-lg font-semibold" data-testid="doctor-name">{doc.name}</h4>
              <p className="text-sm text-gray-600" data-testid="doctor-specialty">
                {Array.isArray(doc.speciality) ? doc.speciality.join(", ") : "N/A"}
              </p>
              <p className="text-sm" data-testid="doctor-experience">{doc.experience} Years of experience</p>
              <p className="text-sm font-medium" data-testid="doctor-fee">₹{doc.fees}</p>
              <button className="mt-2 border border-blue-700 text-blue-700 px-3 py-1 rounded hover:bg-blue-100">
                Book Appointment
              </button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default App;
