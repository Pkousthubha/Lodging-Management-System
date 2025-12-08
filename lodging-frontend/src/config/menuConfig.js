// src/config/menuConfig.js

// Single source of truth for menus (Sidebar, Breadcrumb, Search)

export const MENU_SECTIONS = [
  {
    key: "masters",
    title: "MASTERS",
    icon: "🏨",
    children: [
      {
        to: "/masters/hotels",
        label: "Hotels",
        icon: "🏨"
      },
      {
        to: "/masters/branches",
        label: "Branches",
        icon: "🏨"
      },
      {
        to: "/masters/floors-rooms",
        label: "Floors / Rooms / Room Types",
        icon: "🛏️"
      },
      {
        to: "/masters/amenities",
        label: "Amenities",
        icon: "✨"
      },
      {
        to: "/masters/rate-plans",
        label: "Rate Plans & Seasonal",
        icon: "📅"
      },
      {
        to: "/masters/menu",
        label: "Menu (Food)",
        icon: "🍽️"
      },
      {
        to: "/masters/taxes-payments",
        label: "Taxes & Payments",
        icon: "💰"
      },
      {
        to: "/masters/users-roles",
        label: "Users & Roles",
        icon: "👥"
      }
    ]
  },
  {
    key: "frontoffice",
    title: "FRONT OFFICE (LODGING)",
    icon: "🛏️",
    children: [
      {
        to: "/frontoffice/availability",
        label: "Availability",
        icon: "📆"
      },
      {
        to: "/frontoffice/reservations",
        label: "Reservations",
        icon: "📑"
      },
      {
        to: "/frontoffice/check-in-out",
        label: "Check-in / Check-out",
        icon: "🔑"
      },
      {
        to: "/frontoffice/in-house",
        label: "In-house Guests",
        icon: "👤"
      },
      {
        to: "/frontoffice/room-status",
        label: "Room Status",
        icon: "🚪"
      }
    ]
  },
  {
    key: "boarding",
    title: "BOARDING (RESTAURANT / ROOM SERVICE)",
    icon: "🍽️",
    children: [
      {
        to: "/boarding/menu",
        label: "Boarding Menu",
        icon: "🍽️"
      },
      {
        to: "/boarding/room-service",
        label: "Room Service Orders (KOT)",
        icon: "🧾"
      },
      {
        to: "/boarding/restaurant-orders",
        label: "Restaurant Orders",
        icon: "🍛"
      },
      {
        to: "/boarding/link-folio",
        label: "Link Orders to Folio",
        icon: "🔗"
      }
    ]
  },
  {
    key: "housekeeping",
    title: "HOUSEKEEPING",
    icon: "🧹",
    children: [
      {
        to: "/housekeeping/board",
        label: "Room Status Board",
        icon: "🧼"
      },
      {
        to: "/housekeeping/tasks",
        label: "Cleaning / Maintenance Tasks",
        icon: "🧹"
      }
    ]
  },
  {
    key: "billing",
    title: "BILLING & PAYMENTS",
    icon: "💳",
    children: [
      {
        to: "/billing/folios",
        label: "Folios (Guest Bill)",
        icon: "📄"
      },
      {
        to: "/billing/charges-payments",
        label: "Charges & Payments",
        icon: "💳"
      },
      {
        to: "/billing/invoice-view",
        label: "Invoice View / Print",
        icon: "🖨️"
      }
    ]
  },
  {
    key: "reports",
    title: "ADMIN & REPORTS",
    icon: "📊",
    children: [
      {
        to: "/reports/occupancy",
        label: "Occupancy & Revenue",
        icon: "📊"
      },
      {
        to: "/reports/restaurant-sales",
        label: "Restaurant / RS Sales",
        icon: "📈"
      },
      {
        to: "/reports/audit-logs",
        label: "Audit Logs",
        icon: "📝"
      }
    ]
  },
  {
    key: "online",
    title: "ONLINE BOOKING",
    icon: "🌐",
    children: [
      {
        to: "/online/booking",
        label: "Online Booking",
        icon: "🌐"
      },
      {
        to: "/online/booking-razorpay",
        label: "Online Booking (Payment)",
        icon: "💸"
      }
    ]
  }
];

// Find section + item by pathname (for breadcrumb / active context)
export function findMenuMatch(pathname) {
  for (const section of MENU_SECTIONS) {
    for (const item of section.children) {
      if (
        pathname === item.to ||
        pathname.startsWith(item.to + "/") // handle sub-routes if any
      ) {
        return { section, item };
      }
    }
  }
  return null;
}

// --- fuzzy helpers ----------------------------------------------------

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function isSubsequence(pattern, text) {
  // pattern chars appear in order inside text
  let i = 0;
  for (let j = 0; j < text.length && i < pattern.length; j++) {
    if (pattern[i] === text[j]) i++;
  }
  return i === pattern.length;
}

// Fuzzy menu search: supports things like "resv" -> "Reservations"
export function searchMenu(query) {
  const q = normalize(query);
  if (!q) return [];

  const results = [];

  for (const section of MENU_SECTIONS) {
    for (const item of section.children) {
      const labelNorm = normalize(item.label + " " + section.title);
      if (!labelNorm) continue;

      const directHit = labelNorm.includes(q);
      const subseqHit = isSubsequence(q, labelNorm);

      if (!directHit && !subseqHit) continue;

      // scoring: lower is better
      const pos = labelNorm.indexOf(q);
      const basePosScore = pos === -1 ? 100 : pos; // direct match earlier = better
      const lenDiffScore = Math.abs(labelNorm.length - q.length);
      const score = basePosScore + lenDiffScore;

      results.push({ section, item, score });
    }
  }

  // Sort by score then label
  results.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    return a.item.label.localeCompare(b.item.label);
  });

  return results;
}
