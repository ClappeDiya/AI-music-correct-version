import React from "react";
import {
  useLanguageStore,
  getLanguageName,
} from "../../services/languageService";
import styles from "./LanguageSelector.module.css";

export const LanguageSelector: React.FC = () => {
  const { preferredLanguage, supportedLanguages, setPreferredLanguage } =
    useLanguageStore();

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setPreferredLanguage(event.target.value);
  };

  return (
    <div className={styles.container}>
      <label htmlFor="language-select" className={styles.label}>
        Voice Command Language
      </label>
      <select
        id="language-select"
        value={preferredLanguage}
        onChange={handleLanguageChange}
        className={styles.select}
      >
        {supportedLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {getLanguageName(lang)}
          </option>
        ))}
      </select>
    </div>
  );
};
