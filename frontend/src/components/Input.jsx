import React, { useState } from "react";
import { FaEyeSlash, FaRegEye } from "react-icons/fa6";

export default function Input({ value, onChange, label, placeholder, type }) {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };
  return (
    <div className="flex flex-col gap-1 mb-2">
      <label className="text-sm text-muted tracking-wide">{label}</label>
      <div className="relative items-center">
        <input
          type={
            type === "password" ? (showPassword ? "text" : "password") : type
          }
          value={value}
          placeholder={placeholder}
          onChange={(e) => {
            onChange(e);
          }}
          className="bg-card/20 border-2 border-border rounded-md px-3 py-2 pr-10 w-full hover:border-muted hover:bg-card/30 focus:outline-none focus:border-accent-hover valid:border-accent transition duration-300 ease-in-out"
        />
        {type === "password" && (
          <>
            <div>
              {showPassword ? (
                <FaRegEye
                  size={22}
                  className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-foreground transition duration-300 ease-in-out"
                  onClick={() => {
                    toggleShowPassword();
                  }}
                />
              ) : (
                <FaEyeSlash
                  size={22}
                  className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-foreground transition duration-300 ease-in-out"
                  onClick={() => {
                    toggleShowPassword();
                  }}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
