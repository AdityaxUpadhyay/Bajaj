import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

interface Doctor {
  name: string;
  mode: string;
  speciality: string[];
  qualification?: string;
  hospital?: string;
  location?: string;
  languages?: string[];
  experience: number;
  fees: number;
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

export default function App() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const nameQuery = searchParams.get("name") || "";
  const moc = searchParams.get("moc") || "";
  const specs = useMemo(() => searchParams.get("specialty")?.split(",") || [], [searchParams]);
  const sort = searchParams.get("sort") || "";

  // Fetch data
  useEffect(() => {
    axios.get<Doctor[]>(API_URL).then((res) => setDoctors(res.data));
  }, []);

  // Derived: suggestions for autocomplete
  const suggestions = useMemo(() => {
    if (!nameQuery) return [];
    return doctors
      .filter((d) => d.name.toLowerCase().includes(nameQuery.toLowerCase()))
      .slice(0, 3);
  }, [nameQuery, doctors]);

  // Derived: filtered list
  const filtered = useMemo(() => {
    let result = doctors;

    if (nameQuery) {
      const q = nameQuery.toLowerCase();
      result = result.filter((d) => d.name.toLowerCase().includes(q));
    }
    if (moc) {
      const m = moc.toLowerCase();
      result = result.filter((d) => d.mode.toLowerCase() === m);
    }
    if (specs.length) {
      result = result.filter((d) =>
        d.speciality.some((s) => specs.includes(s))
      );
    }
    if (sort === "fees") {
      result = [...result].sort((a, b) => a.fees - b.fees);
    } else if (sort === "experience") {
      result = [...result].sort((a, b) => b.experience - a.experience);
    }
    return result;
  }, [doctors, nameQuery, moc, specs, sort]);

  // Update a query param
  const updateParam = (key: string, value?: string | string[]) => {
    const params = new URLSearchParams(searchParams);
    if (!value || (Array.isArray(value) && value.length === 0)) {
      params.delete(key);
    } else {
      params.set(key, Array.isArray(value) ? value.join(",") : value);
    }
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Search */}
      <header className="bg-blue-900 p-4">
        <div className="max-w-5xl mx-auto relative">
          <input
            data-testid="autocomplete-input"
            className="w-full p-2 rounded text-black"
            placeholder="Search doctor..."
            value={nameQuery}
            onChange={(e) => updateParam("name", e.target.value)}
          />
          {suggestions.length > 0 && (
            <ul className="absolute bg-white shadow mt-1 w-full rounded z-10">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  data-testid="suggestion-item"
                  className="p-2 hover:bg-gray-200 cursor-pointer"
                  onClick={() => updateParam("name", s.name)}
                >
                  {s.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <div className="flex max-w-5xl mx-auto p-4 space-x-4">
        {/* Filters */}
        <aside className="w-1/3 bg-white p-4 shadow rounded">
          {/* Mode */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2" data-testid="filter-header-moc">
              Mode of Consultation
            </h3>
            {[
              { label: "Video Consult", id: "filter-video-consult" },
              { label: "In Clinic", id: "filter-in-clinic" },
            ].map((m) => (
              <label key={m.label} className="block mb-1">
                <input
                  type="radio"
                  name="moc"
                  data-testid={m.id}
                  checked={moc === m.label}
                  onChange={() => updateParam("moc", m.label)}
                />
                <span className="ml-2">{m.label}</span>
              </label>
            ))}
          </div>

          {/* Specialties */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2" data-testid="filter-header-speciality">
              Specialties
            </h3>
            <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto">
              {SPECIALTIES.map((spec) => {
                const id = spec.replace(/[ /]+/g, "-");
                return (
                  <label key={spec} className="text-sm">
                    <input
                      type="checkbox"
                      data-testid={`filter-specialty-${id}`}
                      checked={specs.includes(spec)}
                      onChange={() => {
                        const next = specs.includes(spec)
                          ? specs.filter((s) => s !== spec)
                          : [...specs, spec];
                        updateParam("specialty", next);
                      }}
                    />
                    <span className="ml-1">{spec}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Sort */}
          <div>
            <h3 className="font-semibold mb-2" data-testid="filter-header-sort">
              Sort
            </h3>
            <label className="block mb-1">
              <input
                type="radio"
                name="sort"
                data-testid="sort-fees"
                checked={sort === "fees"}
                onChange={() => updateParam("sort", "fees")}
              />
              <span className="ml-2">Fees (asc)</span>
            </label>
            <label className="block">
              <input
                type="radio"
                name="sort"
                data-testid="sort-experience"
                checked={sort === "experience"}
                onChange={() => updateParam("sort", "experience")}
              />
              <span className="ml-2">Experience (desc)</span>
            </label>
          </div>
        </aside>

        {/* Doctor Cards */}
        <section className="w-2/3 space-y-4">
          {filtered.map((doc, i) => (
            <div
              key={i}
              className="bg-white shadow p-4 rounded"
              data-testid="doctor-card"
            >
              <h4
                className="text-xl font-bold mb-1"
                data-testid="doctor-name"
              >
                {doc.name}
              </h4>
              <p className="text-gray-700 mb-1" data-testid="doctor-specialty">
                {doc.speciality.join(", ")}
              </p>
              <p className="text-gray-600 mb-1">
                Languages: {doc.languages?.join(", ") || "N/A"}
              </p>
              <p className="text-gray-600 mb-1">
                {doc.qualification || "N/A"}, {doc.hospital || "N/A"}
              </p>
              <p className="text-gray-600 mb-1">
                Location: {doc.location || "N/A"}
              </p>
              <p className="font-semibold mb-1" data-testid="doctor-experience">
                {doc.experience} Years of experience
              </p>
              <p className="font-semibold mb-2" data-testid="doctor-fee">
                ₹{doc.fees}
              </p>
              <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50">
                Book Appointment
              </button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

