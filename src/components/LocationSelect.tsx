"use client";

import React, { useState, useEffect, useRef } from "react";
import { City, State } from "country-state-city";
import { FiChevronDown, FiSearch } from "react-icons/fi";

interface LocationSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const LocationSelect: React.FC<LocationSelectProps> = ({
  value,
  onChange,
  placeholder = "Search city…",
}) => {
  const [showList, setShowList] = useState(false);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const allCities = City.getCitiesOfCountry("IN") || [];
    const merged = allCities.map((city: any) => {
      const state = State.getStateByCodeAndCountry(city.stateCode, "IN");
      return `${city.name}, ${state?.name}`;
    });
    setCityOptions(merged);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "480px",
      }}
    >
      {/* Input Box */}
      <div
        onClick={() => setShowList(true)}
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          padding: "12px 16px",
          border: "2px solid #e2e8f0",
          borderRadius: "10px",
          background: "white",
          cursor: "pointer",
          position: "relative",
          fontSize: "15px",
          boxSizing: "border-box",
        }}
      >
        <input
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowList(true);
          }}
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            fontSize: "15px",
            background: "transparent",
          }}
        />

        {/* Down arrow icon */}
        <FiChevronDown
          size={20}
          style={{
            marginLeft: "8px",
            color: "#64748b",
            transition: "0.2s",
            transform: showList ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </div>

      {/* Dropdown */}
      {showList && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: "8px",
            width: "100%",
            maxHeight: "260px",
            overflowY: "auto",
            background: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
            zIndex: 5000,
            paddingTop: "6px",
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {/* Search UI inside dropdown */}
          {/* <div
            style={{
              position: "sticky",
              top: 0,
              background: "white",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              borderBottom: "1px solid #f1f5f9",
              zIndex: 10,
            }}
          >
            <FiSearch size={18} style={{ color: "#64748b", marginRight: "8px" }} />
            <span style={{ fontSize: "14px", color: "#64748b" }}>
              Showing results for “{value || "city"}”
            </span>
          </div> */}

          {/* City List */}
          {cityOptions
            .filter((c) => c.toLowerCase().includes(value.toLowerCase()))
            .slice(0, 50)
            .map((city) => (
              <div
                key={city}
                onClick={() => {
                  onChange(city);
                  setShowList(false);
                }}
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  borderBottom: "1px solid #f8fafc",
                  fontSize: "15px",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f8fafc")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "white")
                }
              >
                {city}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default LocationSelect;
