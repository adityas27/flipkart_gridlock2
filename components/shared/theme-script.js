import Script from "next/script";

export function ThemeScript() {
  const script = `
    (() => {
      const stored = window.localStorage.getItem("gridlock-theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const theme = stored || (prefersDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", theme === "dark");
      document.documentElement.dataset.theme = theme;
    })();
  `;

  return (
    <Script id="gridlock-theme-script" strategy="beforeInteractive">
      {script}
    </Script>
  );
}
