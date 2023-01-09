import { useEffect, useState } from "react";

const loadDarkMode = () => {
  // To avoid NextJS error if run in server
  if (typeof localStorage === "undefined") {
    console.log("localStorage undefined, ran in server");
    return false;
  }

  const value = localStorage.getItem("darkMode");
  return value === null ? false : JSON.parse(value);
};

const ThemeSwitch = () => {
  const [darkMode, setDarkMode] = useState(false);

  // To avoid hydration mismatch errors https://nextjs.org/docs/messages/react-hydration-error
  useEffect(() => {
    setDarkMode(loadDarkMode);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  const handleModeClick = (isDarkMode: boolean) => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
    setDarkMode(isDarkMode);
  };

  return (
    <>
      {darkMode ? (
        // Light button - light bulb
        <svg
          onClick={() => handleModeClick(false)}
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ) : (
        <svg
          // Dark button - moon
          onClick={() => handleModeClick(true)}
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </>
  );
};

export default ThemeSwitch;
