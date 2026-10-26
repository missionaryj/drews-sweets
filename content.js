/**
 * Drew's Sweets — site config
 * Fill remaining [bracketed] placeholders before going live.
 */
window.SITE = {
  businessName: "Drew's Sweets",
  tagline: "Handcrafted cookies, baked fresh for you",
  location: "[City / Area]",
  about:
    "[A short note about Drew — why she started baking, what makes her cookies special. Replace with her own words.]",
  bakerFirstName: "Drew",

  contact: {
    // Shown in footer / mailto fallback. Order delivery uses formSubmit.endpoint.
    email: "drewlyons05@gmail.com",
    phone: "[555-555-5555]",
    displayPhone: "[phone number]",
    instagram: "[@handle]",
  },

  /**
   * FormSubmit (https://formsubmit.co) — AJAX: POST https://formsubmit.co/ajax/<endpoint>
   * Default endpoint is the inbox email. After Drew clicks Activate in the first
   * FormSubmit email, replace this with the random alias string they send
   * (e.g. "abc123xyz") so the public site does not expose her address.
   */
  formSubmit: {
    endpoint: "drewlyons05@gmail.com",
    subject: "New Drew's Sweets order",
    template: "table",
  },

  delivery: {
    areaNote: "[Delivery area — e.g. Champaign–Urbana only]",
    feeNote: "[Delivery fee — or free over $X]",
    leadTimeNote: "[e.g. Orders need 24 hours notice]",
    // Slot labels shown in the order form; edit freely
    timeSlots: ["4:00 – 6:00 pm", "6:00 – 8:00 pm", "8:00 – 10:00 pm"],
  },

  // Bundle pricing (exact)
  bundles: [
    { id: "3", qty: 3, price: 2, label: "3 cookies", display: "3 for $2" },
    { id: "5", qty: 5, price: 4, label: "5 cookies", display: "5 for $4" },
  ],

  flavors: [
    {
      id: "fruity-pebbles",
      name: "Fruity Pebbles Crunch",
      blurb: "Soft cookie packed with colorful cereal crunch and a white drizzle.",
      image: "tray-assorted",
      alt: "Fruity Pebbles cookies with white drizzle on a tray",
    },
    {
      id: "cookies-cream",
      name: "Cookies & Cream Kiss",
      blurb: "Soft cookie topped with an Oreo, cookie-dough ball, and a white chocolate kiss.",
      image: "cookies-cream-closeup",
      alt: "Cookies and cream cookie with Oreo, dough ball, and white chocolate kiss",
    },
    {
      id: "turtle",
      name: "Turtle",
      blurb: "Chocolate chip cookie with pecans, caramel drizzle, and a chocolate chunk.",
      image: "turtle",
      alt: "Turtle cookie with pecans, caramel, and chocolate chunk",
    },
    {
      id: "red-velvet",
      name: "Red Velvet",
      blurb: "Red velvet cookie with white chocolate chips and a white drizzle.",
      image: "red-velvet",
      alt: "Red velvet cookies with white chocolate drizzle",
    },
    {
      id: "lemon-blueberry",
      name: "Lemon Blueberry",
      blurb: "Bright lemon cookie with blueberries and a dusting of powdered sugar.",
      image: "lemon-blueberry-tray",
      alt: "Lemon blueberry cookies dusted with powdered sugar",
    },
    {
      id: "reeses",
      name: "Reese's PB Brownie",
      blurb: "Chocolate cookie with a peanut butter cup, peanut butter drizzle, and candy pieces.",
      image: "reeses",
      alt: "Chocolate peanut butter cookie with Reese's cup",
    },
    {
      id: "strawberry-shortcake",
      name: "Strawberry Shortcake",
      blurb: "Pink cookie with Golden Oreo, strawberry wafer, and shortcake crumble.",
      image: "strawberry-shortcake",
      alt: "Strawberry shortcake cookie with Golden Oreo and wafer",
    },
    {
      id: "smores",
      name: "S'mores",
      blurb: "Cookie topped with graham cracker, marshmallow, chocolate, and white drizzle.",
      image: "smores",
      alt: "S'mores cookie with marshmallow, graham, and chocolate",
    },
    {
      id: "mint-oreo",
      name: "Mint Oreo",
      blurb: "Mint-green cookie with an Oreo, cookie-dough ball, and mint drizzle.",
      image: "mint-oreo",
      alt: "Mint Oreo cookie with Oreo and cookie dough ball",
    },
  ],

  hero: {
    image: "tray-assorted",
    alt: "Assorted Fruity Pebbles and cookies-and-cream cookies on a tray with fall decor",
  },
};
