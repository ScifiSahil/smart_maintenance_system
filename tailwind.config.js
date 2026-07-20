module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // ── SINGLE SOURCE OF TRUTH — font sizes ───────────────────────────
      // Poore Admin/Configuration UI mein text-xs/sm/base/lg/xl/2xl/3xl
      // yahi values use karenge. Kahin bhi text-[Npx] arbitrary value
      // likhne ki zarurat nahi — is scale ko hi refer karo.
      fontSize: {
        xs: "11px",    // badges, uppercase labels, tiny meta text
        sm: "13px",    // secondary text, descriptions, table cells
        base: "14px",  // default body text, form inputs, buttons
        lg: "16px",    // card titles, sidebar nav, sub-headings
        xl: "18px",    // section headers
        "2xl": "22px", // page titles
        "3xl": "26px", // large stat numbers
      },
      // ── SINGLE SOURCE OF TRUTH — font weights ─────────────────────────
      // font-normal(400) / font-medium(500) / font-semibold(600) / font-bold(700)
      // — Tailwind ke defaults hi standard maane gaye hain, dobara define
      // karne ki zarurat nahi. Poore app mein sirf yehi 4 weights use karo.
    },
  },
  plugins: [],
}