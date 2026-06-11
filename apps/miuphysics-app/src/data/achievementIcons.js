// ─────────────────────────────────────────────────────────
// MiuPhysics — Achievement SVG Icons
// Themed SVG strings for dangerouslySetInnerHTML rendering
// Palette: violet #8B5CF6, cyan #22D3EE, pink #EC4899,
//          green #10B981, amber #F59E0B, red #EF4444
// ─────────────────────────────────────────────────────────

export const ACHIEVEMENT_ICONS = {

  // ⭐ First correct answer — shining gold star
  ach_first_correct: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="starGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FBBF24"/>
        <stop offset="50%" stop-color="#F59E0B"/>
        <stop offset="100%" stop-color="#D97706"/>
      </linearGradient>
      <filter id="starShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#D97706" flood-opacity="0.4"/>
      </filter>
    </defs>
    <circle cx="24" cy="24" r="22" fill="#FEF3C7" opacity="0.3"/>
    <polygon points="24,4 29.5,17 44,17 32.5,27 37,42 24,33 11,42 15.5,27 4,17 18.5,17"
      fill="url(#starGold)" filter="url(#starShadow)"/>
    <circle cx="18" cy="14" r="1.5" fill="#FEF3C7" opacity="0.8"/>
    <circle cx="34" cy="10" r="1" fill="#FEF3C7" opacity="0.6"/>
    <circle cx="38" cy="30" r="1.2" fill="#FEF3C7" opacity="0.7"/>
  </svg>`,

  // 🥉 10 correct — bronze medal
  ach_correct_10: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bronze" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#D4A574"/>
        <stop offset="50%" stop-color="#B8860B"/>
        <stop offset="100%" stop-color="#8B6914"/>
      </linearGradient>
      <filter id="bronzeShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-color="#8B6914" flood-opacity="0.35"/>
      </filter>
    </defs>
    <rect x="20" y="2" width="8" height="10" rx="1" fill="#9CA3AF"/>
    <circle cx="24" cy="26" r="16" fill="url(#bronze)" filter="url(#bronzeShadow)"/>
    <circle cx="24" cy="26" r="13" fill="none" stroke="#D4A574" stroke-width="1.5" opacity="0.5"/>
    <text x="24" y="31" text-anchor="middle" fill="#FEF3C7" font-size="12" font-weight="bold" font-family="sans-serif">10</text>
  </svg>`,

  // 🥈 50 correct — silver medal
  ach_correct_50: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="silver" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#E5E7EB"/>
        <stop offset="50%" stop-color="#9CA3AF"/>
        <stop offset="100%" stop-color="#6B7280"/>
      </linearGradient>
      <filter id="silverShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-color="#6B7280" flood-opacity="0.35"/>
      </filter>
    </defs>
    <rect x="20" y="2" width="8" height="10" rx="1" fill="#6B7280"/>
    <circle cx="24" cy="26" r="16" fill="url(#silver)" filter="url(#silverShadow)"/>
    <circle cx="24" cy="26" r="13" fill="none" stroke="#E5E7EB" stroke-width="1.5" opacity="0.5"/>
    <text x="24" y="31" text-anchor="middle" fill="#1F2937" font-size="12" font-weight="bold" font-family="sans-serif">50</text>
  </svg>`,

  // 🏆 100 correct — gold trophy with sparkle
  ach_correct_100: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="trophyGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FDE68A"/>
        <stop offset="40%" stop-color="#F59E0B"/>
        <stop offset="100%" stop-color="#B45309"/>
      </linearGradient>
      <filter id="trophyShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#B45309" flood-opacity="0.4"/>
      </filter>
    </defs>
    <path d="M16,8 L32,8 L30,24 L26,28 L28,32 L20,32 L22,28 L18,24 Z"
      fill="url(#trophyGold)" filter="url(#trophyShadow)"/>
    <path d="M16,8 Q6,10 8,18 Q10,24 18,22" fill="url(#trophyGold)" opacity="0.8"/>
    <path d="M32,8 Q42,10 40,18 Q38,24 30,22" fill="url(#trophyGold)" opacity="0.8"/>
    <rect x="17" y="32" width="14" height="3" rx="1" fill="#D97706"/>
    <rect x="15" y="35" width="18" height="4" rx="2" fill="#B45309"/>
    <polygon points="10,4 11.5,7 10,6 8.5,7" fill="#FDE68A" opacity="0.9"/>
    <polygon points="38,6 39.5,9 38,8 36.5,9" fill="#FDE68A" opacity="0.7"/>
    <polygon points="24,2 25,4.5 24,3.8 23,4.5" fill="#FDE68A" opacity="0.8"/>
  </svg>`,

  // 🔥 3-day streak — small flame
  ach_streak_3: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="flame3" x1="50%" y1="100%" x2="50%" y2="0%">
        <stop offset="0%" stop-color="#EF4444"/>
        <stop offset="50%" stop-color="#F59E0B"/>
        <stop offset="100%" stop-color="#FDE68A"/>
      </linearGradient>
      <filter id="flameShadow3" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#EF4444" flood-opacity="0.4"/>
      </filter>
    </defs>
    <path d="M24,4 Q30,14 32,20 Q34,28 28,36 Q26,40 24,42 Q22,40 20,36 Q14,28 16,20 Q18,14 24,4 Z"
      fill="url(#flame3)" filter="url(#flameShadow3)"/>
    <path d="M24,18 Q27,24 26,30 Q25,34 24,36 Q23,34 22,30 Q21,24 24,18 Z"
      fill="#FEF3C7" opacity="0.6"/>
  </svg>`,

  // 🔥💎 7-day streak — larger flame with diamond sparkle
  ach_streak_7: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="flame7" x1="50%" y1="100%" x2="50%" y2="0%">
        <stop offset="0%" stop-color="#EF4444"/>
        <stop offset="40%" stop-color="#F59E0B"/>
        <stop offset="80%" stop-color="#8B5CF6"/>
        <stop offset="100%" stop-color="#C4B5FD"/>
      </linearGradient>
      <linearGradient id="diamond7" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#C4B5FD"/>
        <stop offset="100%" stop-color="#8B5CF6"/>
      </linearGradient>
      <filter id="flameShadow7" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" flood-color="#8B5CF6" flood-opacity="0.4"/>
      </filter>
    </defs>
    <path d="M24,2 Q32,12 35,20 Q38,30 30,38 Q27,42 24,44 Q21,42 18,38 Q10,30 13,20 Q16,12 24,2 Z"
      fill="url(#flame7)" filter="url(#flameShadow7)"/>
    <path d="M24,16 Q28,22 27,30 Q26,36 24,38 Q22,36 21,30 Q20,22 24,16 Z"
      fill="#FEF3C7" opacity="0.5"/>
    <polygon points="38,8 41,12 38,16 35,12" fill="url(#diamond7)" opacity="0.9"/>
    <circle cx="10" cy="14" r="1.5" fill="#C4B5FD" opacity="0.7"/>
  </svg>`,

  // 👑🔥 30-day streak — crown with flame
  ach_streak_30: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="crown30" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FDE68A"/>
        <stop offset="50%" stop-color="#F59E0B"/>
        <stop offset="100%" stop-color="#B45309"/>
      </linearGradient>
      <linearGradient id="crownFlame" x1="50%" y1="100%" x2="50%" y2="0%">
        <stop offset="0%" stop-color="#EF4444"/>
        <stop offset="100%" stop-color="#F59E0B"/>
      </linearGradient>
      <filter id="crownShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#B45309" flood-opacity="0.4"/>
      </filter>
    </defs>
    <path d="M24,2 Q27,8 28,12 Q29,8 28,4" fill="url(#crownFlame)" opacity="0.7"/>
    <path d="M20,4 Q22,10 22,14" fill="url(#crownFlame)" opacity="0.5"/>
    <path d="M28,4 Q26,10 26,14" fill="url(#crownFlame)" opacity="0.5"/>
    <polygon points="8,18 14,28 18,16 24,28 30,16 34,28 40,18 38,38 10,38"
      fill="url(#crown30)" filter="url(#crownShadow)"/>
    <rect x="10" y="38" width="28" height="5" rx="2" fill="#D97706"/>
    <circle cx="16" cy="28" r="2.5" fill="#EF4444" opacity="0.8"/>
    <circle cx="24" cy="26" r="2.5" fill="#8B5CF6" opacity="0.8"/>
    <circle cx="32" cy="28" r="2.5" fill="#22D3EE" opacity="0.8"/>
  </svg>`,

  // ⚡5 — 5 consecutive correct — lightning bolt with "5"
  ach_consecutive_5: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bolt5" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#22D3EE"/>
        <stop offset="100%" stop-color="#0891B2"/>
      </linearGradient>
      <filter id="boltShadow5" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-color="#0891B2" flood-opacity="0.4"/>
      </filter>
    </defs>
    <circle cx="24" cy="24" r="22" fill="#0891B2" opacity="0.1"/>
    <polygon points="28,2 16,22 24,22 20,46 34,24 26,24"
      fill="url(#bolt5)" filter="url(#boltShadow5)"/>
    <text x="36" y="16" text-anchor="middle" fill="#22D3EE" font-size="11" font-weight="bold" font-family="sans-serif">5</text>
  </svg>`,

  // ⚡⚡10 — 10 consecutive correct — double lightning with "10"
  ach_consecutive_10: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bolt10a" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#8B5CF6"/>
        <stop offset="100%" stop-color="#6D28D9"/>
      </linearGradient>
      <linearGradient id="bolt10b" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#22D3EE"/>
        <stop offset="100%" stop-color="#0891B2"/>
      </linearGradient>
      <filter id="boltShadow10" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" flood-color="#6D28D9" flood-opacity="0.4"/>
      </filter>
    </defs>
    <circle cx="24" cy="24" r="22" fill="#6D28D9" opacity="0.1"/>
    <polygon points="22,2 10,22 18,22 14,42 28,22 20,22"
      fill="url(#bolt10a)" filter="url(#boltShadow10)"/>
    <polygon points="32,4 22,20 28,20 25,38 36,20 30,20"
      fill="url(#bolt10b)" filter="url(#boltShadow10)"/>
    <text x="40" y="14" text-anchor="middle" fill="#C4B5FD" font-size="10" font-weight="bold" font-family="sans-serif">10</text>
  </svg>`,

  // ❓ Default fallback — circle badge with question mark
  default: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="defaultBadge" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#8B5CF6"/>
        <stop offset="100%" stop-color="#6D28D9"/>
      </linearGradient>
      <filter id="defaultShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-color="#6D28D9" flood-opacity="0.3"/>
      </filter>
    </defs>
    <circle cx="24" cy="24" r="20" fill="url(#defaultBadge)" filter="url(#defaultShadow)"/>
    <circle cx="24" cy="24" r="16" fill="none" stroke="#C4B5FD" stroke-width="1.5" opacity="0.4"/>
    <text x="24" y="30" text-anchor="middle" fill="#F5F3FF" font-size="18" font-weight="bold" font-family="sans-serif">?</text>
  </svg>`,

  // ===== ZONE EXPLORER BADGES =====

  // 🍳 Kitchen Lab zone badge
  ach_zone_kitchen: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="kitchenZone" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#EF4444"/>
        <stop offset="100%" stop-color="#F59E0B"/>
      </linearGradient>
      <filter id="kitchenShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#EF4444" flood-opacity="0.3"/>
      </filter>
    </defs>
    <circle cx="24" cy="24" r="21" fill="url(#kitchenZone)" filter="url(#kitchenShadow)"/>
    <circle cx="24" cy="24" r="17" fill="none" stroke="#FCA5A5" stroke-width="1.5" opacity="0.4"/>
    <text x="24" y="30" text-anchor="middle" fill="white" font-size="20">🍳</text>
  </svg>`,

  // 🌊 Water World zone badge
  ach_zone_water: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="waterZone" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0EA5E9"/>
        <stop offset="100%" stop-color="#22D3EE"/>
      </linearGradient>
      <filter id="waterShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#0EA5E9" flood-opacity="0.3"/>
      </filter>
    </defs>
    <circle cx="24" cy="24" r="21" fill="url(#waterZone)" filter="url(#waterShadow)"/>
    <circle cx="24" cy="24" r="17" fill="none" stroke="#7DD3FC" stroke-width="1.5" opacity="0.4"/>
    <text x="24" y="30" text-anchor="middle" fill="white" font-size="20">🌊</text>
  </svg>`,

  // 🚗 Street & Motion zone badge
  ach_zone_street: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="streetZone" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#10B981"/>
        <stop offset="100%" stop-color="#34D399"/>
      </linearGradient>
      <filter id="streetShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#10B981" flood-opacity="0.3"/>
      </filter>
    </defs>
    <circle cx="24" cy="24" r="21" fill="url(#streetZone)" filter="url(#streetShadow)"/>
    <circle cx="24" cy="24" r="17" fill="none" stroke="#6EE7B7" stroke-width="1.5" opacity="0.4"/>
    <text x="24" y="30" text-anchor="middle" fill="white" font-size="20">🏎️</text>
  </svg>`,

  // 🌌 Cosmic Sky zone badge
  ach_zone_cosmic: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cosmicZone" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#8B5CF6"/>
        <stop offset="100%" stop-color="#A78BFA"/>
      </linearGradient>
      <filter id="cosmicShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#8B5CF6" flood-opacity="0.3"/>
      </filter>
    </defs>
    <circle cx="24" cy="24" r="21" fill="url(#cosmicZone)" filter="url(#cosmicShadow)"/>
    <circle cx="24" cy="24" r="17" fill="none" stroke="#C4B5FD" stroke-width="1.5" opacity="0.4"/>
    <text x="24" y="30" text-anchor="middle" fill="white" font-size="20">🌌</text>
  </svg>`,

  // 🎵 Sound Arena zone badge
  ach_zone_sound: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="soundZone" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#EC4899"/>
        <stop offset="100%" stop-color="#F472B6"/>
      </linearGradient>
      <filter id="soundShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#EC4899" flood-opacity="0.3"/>
      </filter>
    </defs>
    <circle cx="24" cy="24" r="21" fill="url(#soundZone)" filter="url(#soundShadow)"/>
    <circle cx="24" cy="24" r="17" fill="none" stroke="#F9A8D4" stroke-width="1.5" opacity="0.4"/>
    <text x="24" y="30" text-anchor="middle" fill="white" font-size="20">🎵</text>
  </svg>`,

  // ⚡ Electric Workshop zone badge
  ach_zone_electric: `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="electricZone" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F59E0B"/>
        <stop offset="100%" stop-color="#FBBF24"/>
      </linearGradient>
      <filter id="electricShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#F59E0B" flood-opacity="0.3"/>
      </filter>
    </defs>
    <circle cx="24" cy="24" r="21" fill="url(#electricZone)" filter="url(#electricShadow)"/>
    <circle cx="24" cy="24" r="17" fill="none" stroke="#FDE68A" stroke-width="1.5" opacity="0.4"/>
    <text x="24" y="30" text-anchor="middle" fill="white" font-size="20">⚡</text>
  </svg>`,
};

/**
 * Get the SVG string for a given achievement id,
 * falling back to the default badge when unknown.
 * @param {string} achievementId
 * @returns {string} SVG markup
 */
export function getAchievementIcon(achievementId) {
  return ACHIEVEMENT_ICONS[achievementId] || ACHIEVEMENT_ICONS.default;
}
