# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a11y.spec.ts >> a11y (light): /
- Location: tests/e2e/a11y.spec.ts:24:9

# Error details

```
Error: NEW serious/critical a11y violations on /. Fix them, or (only if unfixable now) add to tests/e2e/a11y-known-issues.json

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 4

- Array []
+ Array [
+   "serious color-contrast: Elements must meet minimum color contrast ratio thresholds (3 nodes) e.g. .min-w-0 > .tracking-\\[0\\.18em\\].uppercase — https://dequeuniversity.com/rules/axe/4.14/color-contrast?application=playwright",
+   "serious label-content-name-mismatch: Elements must have their visible text as part of their accessible name (2 nodes) e.g. .h-16 > .gap-2\\.5[aria-label=\"Noor Quran home\"][href=\"/\"] — https://dequeuniversity.com/rules/axe/4.14/label-content-name-mismatch?application=playwright",
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - link "Skip to content" [ref=f1e2] [cursor=pointer]:
    - /url: "#main"
  - banner [ref=f1e3]:
    - generic [ref=f1e4]:
      - link "Noor Quran home" [ref=f1e5] [cursor=pointer]:
        - /url: /
        - generic [ref=f1e6]:
          - generic [ref=f1e7]: Noor Quran
          - generic [ref=f1e8]: نُورُ القُرْآن
      - navigation "Main" [ref=f1e9]:
        - link "Quran" [ref=f1e10] [cursor=pointer]:
          - /url: /quran
        - link "Listen" [ref=f1e11] [cursor=pointer]:
          - /url: /listen
        - link "Hifz" [ref=f1e12] [cursor=pointer]:
          - /url: /hifz
        - link "Topics" [ref=f1e13] [cursor=pointer]:
          - /url: /topics
        - link "Duas" [ref=f1e14] [cursor=pointer]:
          - /url: /dua
        - button "More ▾" [ref=f1e15]:
          - text: More
          - generic [ref=f1e16]: ▾
      - generic [ref=f1e17]:
        - button "Search the Quran… ⌘K" [ref=f1e18]:
          - generic [ref=f1e20]: Search the Quran…
          - generic [ref=f1e21]: ⌘K
        - radiogroup "Language · ভাষা · اللغة" [ref=f1e22]:
          - radio "English" [checked] [ref=f1e23]: EN
          - radio "বাংলা" [ref=f1e24]: বাং
          - radio "العربية" [ref=f1e25]: عر
        - button "Change theme" [ref=f1e26]
        - link "Account & sync" [ref=f1e29] [cursor=pointer]:
          - /url: /account
  - main [ref=f1e31]:
    - generic [ref=f1e32]:
      - generic [ref=f1e34]:
        - paragraph [ref=f1e35]: بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        - heading "The Holy Quran, beautifully understood." [level=1] [ref=f1e36]
        - paragraph [ref=f1e37]: Read in Arabic with Bangla & English, listen with word-by-word highlighting, explore tafsir, and memorise with a coach that remembers for you.
        - paragraph [ref=f1e38]: পবিত্র কুরআন পড়ুন, শুনুন, বুঝুন ও মুখস্থ করুন
        - button "Search “Ayatul Kursi”, 36, “patience”, ধৈর্য… ⌘K" [ref=f1e40]:
          - generic [ref=f1e42]: Search “Ayatul Kursi”, 36, “patience”, ধৈর্য…
          - generic [ref=f1e43]: ⌘K
        - generic [ref=f1e44]:
          - link "Start reading" [ref=f1e45] [cursor=pointer]:
            - /url: /quran
          - link "Ayatul Kursi" [ref=f1e47] [cursor=pointer]:
            - /url: /surah/al-baqarah/255
          - link "Memorise" [ref=f1e48] [cursor=pointer]:
            - /url: /hifz
      - generic [ref=f1e50]:
        - generic [ref=f1e52]:
          - link "Begin your journey Al-Fatihah The Opening — 7 ayahs الفاتحة Resume →" [ref=f1e53] [cursor=pointer]:
            - /url: /surah/al-fatihah
            - generic [ref=f1e55]:
              - generic [ref=f1e56]:
                - paragraph [ref=f1e57]: Begin your journey
                - heading "Al-Fatihah" [level=3] [ref=f1e58]
                - paragraph [ref=f1e59]: The Opening — 7 ayahs
              - generic [ref=f1e60]: الفاتحة
            - generic [ref=f1e63]:
              - text: Resume
              - generic [ref=f1e64]: →
          - link "Today's goal 0 / 7 0 day streak" [ref=f1e65] [cursor=pointer]:
            - /url: /journey
            - generic [ref=f1e69]:
              - paragraph [ref=f1e70]: Today's goal
              - paragraph [ref=f1e71]:
                - text: "0"
                - generic [ref=f1e72]: / 7
              - paragraph [ref=f1e73]: 0 day streak
        - region [ref=f1e76]:
          - generic [ref=f1e78]:
            - generic [ref=f1e79]:
              - heading "Ayah of the day" [level=2] [ref=f1e80]
              - link "Ghafir · 40:60" [ref=f1e82] [cursor=pointer]:
                - /url: /surah/ghafir/60
            - paragraph [ref=f1e83]:
              - text: وَقَالَ رَبُّكُمُ ٱدْعُونِىٓ أَسْتَجِبْ لَكُمْ ۚ إِنَّ ٱلَّذِينَ يَسْتَكْبِرُونَ عَنْ عِبَادَتِى سَيَدْخُلُونَ جَهَنَّمَ دَاخِرِينَ
              - generic [ref=f1e84]: ٦٠
            - generic [ref=f1e85]:
              - paragraph [ref=f1e86]: “And your Lord says, "Call upon Me; I will respond to you." Indeed, those who disdain My worship will enter Hell [rendered] contemptible.”
              - paragraph [ref=f1e87]: তোমার প্রতিপালক বলেন- তোমরা আমাকে ডাকো, আমি (তোমাদের ডাকে) সাড়া দেব। যারা অহংকারবশতঃ আমার ‘ইবাদাত করে না, নিশ্চিতই তারা লাঞ্ছিত অবস্থায় জাহান্নামে প্রবেশ করবে।
            - generic [ref=f1e88]:
              - link "Read in context" [ref=f1e89] [cursor=pointer]:
                - /url: /surah/ghafir#ayah-60
              - link "Tafsir & meaning" [ref=f1e90] [cursor=pointer]:
                - /url: /surah/ghafir/60
        - region [ref=f1e91]:
          - generic [ref=f1e93]:
            - paragraph [ref=f1e94]: Everything in one place
            - heading "A complete Quran companion" [level=2] [ref=f1e95]
          - generic [ref=f1e96]:
            - link "Read the Quran কুরআন পড়ুন Uthmani script, Bangla & English, tajweed colours, word-by-word ٱقْرَأْ بِٱسْمِ رَبِّكَ ٱلَّذِى خَلَقَ" [ref=f1e98] [cursor=pointer]:
              - /url: /quran
              - generic [ref=f1e102]:
                - generic [ref=f1e103]: Read the Quran
                - generic [ref=f1e104]: কুরআন পড়ুন
                - generic [ref=f1e105]: Uthmani script, Bangla & English, tajweed colours, word-by-word
              - generic [ref=f1e106]: ٱقْرَأْ بِٱسْمِ رَبِّكَ ٱلَّذِى خَلَقَ
            - link "Listen তিলাওয়াত 20+ reciters, word-synced highlighting" [ref=f1e108] [cursor=pointer]:
              - /url: /listen
              - generic [ref=f1e111]:
                - generic [ref=f1e112]: Listen
                - generic [ref=f1e113]: তিলাওয়াত
                - generic [ref=f1e114]: 20+ reciters, word-synced highlighting
            - link "Hifz Studio হিফজ স্টুডিও Memorise with spaced repetition & voice check" [ref=f1e116] [cursor=pointer]:
              - /url: /hifz
              - generic [ref=f1e119]:
                - generic [ref=f1e120]: Hifz Studio
                - generic [ref=f1e121]: হিফজ স্টুডিও
                - generic [ref=f1e122]: Memorise with spaced repetition & voice check
            - link "Quran by Topic বিষয়ভিত্তিক What the Quran says about life’s questions" [ref=f1e124] [cursor=pointer]:
              - /url: /topics
              - generic [ref=f1e127]:
                - generic [ref=f1e128]: Quran by Topic
                - generic [ref=f1e129]: বিষয়ভিত্তিক
                - generic [ref=f1e130]: What the Quran says about life’s questions
            - link "Duas দোয়া Authentic duas with sources" [ref=f1e132] [cursor=pointer]:
              - /url: /dua
              - generic [ref=f1e135]:
                - generic [ref=f1e136]: Duas
                - generic [ref=f1e137]: দোয়া
                - generic [ref=f1e138]: Authentic duas with sources
            - link "99 Names ৯৯ নাম Asma ul Husna with meanings" [ref=f1e140] [cursor=pointer]:
              - /url: /names-of-allah
              - generic [ref=f1e143]:
                - generic [ref=f1e144]: 99 Names
                - generic [ref=f1e145]: ৯৯ নাম
                - generic [ref=f1e146]: Asma ul Husna with meanings
            - link "Prayer Times নামাজের সময় For your exact location" [ref=f1e148] [cursor=pointer]:
              - /url: /prayer-times
              - generic [ref=f1e151]:
                - generic [ref=f1e152]: Prayer Times
                - generic [ref=f1e153]: নামাজের সময়
                - generic [ref=f1e154]: For your exact location
            - link "Qibla কিবলা Live compass" [ref=f1e156] [cursor=pointer]:
              - /url: /qibla
              - generic [ref=f1e159]:
                - generic [ref=f1e160]: Qibla
                - generic [ref=f1e161]: কিবলা
                - generic [ref=f1e162]: Live compass
            - link "Khatam Planner খতম পরিকল্পনা Streaks, goals & progress" [ref=f1e164] [cursor=pointer]:
              - /url: /journey
              - generic [ref=f1e167]:
                - generic [ref=f1e168]: Khatam Planner
                - generic [ref=f1e169]: খতম পরিকল্পনা
                - generic [ref=f1e170]: Streaks, goals & progress
        - region [ref=f1e171]:
          - generic [ref=f1e173]:
            - paragraph [ref=f1e174]: Quran for the heart
            - heading "How are you feeling today?" [level=2] [ref=f1e175]
          - generic [ref=f1e177]:
            - link "🌧️ Anxious · দুশ্চিন্তাগ্রস্ত" [ref=f1e178] [cursor=pointer]:
              - /url: /topics/anxiety
              - generic [ref=f1e179]: 🌧️
              - text: Anxious
              - generic [ref=f1e180]: · দুশ্চিন্তাগ্রস্ত
            - link "💧 Sad · দুঃখিত" [ref=f1e181] [cursor=pointer]:
              - /url: /topics/grief-sadness
              - generic [ref=f1e182]: 💧
              - text: Sad
              - generic [ref=f1e183]: · দুঃখিত
            - link "🌿 Grateful · কৃতজ্ঞ" [ref=f1e184] [cursor=pointer]:
              - /url: /topics/gratitude
              - generic [ref=f1e185]: 🌿
              - text: Grateful
              - generic [ref=f1e186]: · কৃতজ্ঞ
            - link "🌙 Lonely · একাকী" [ref=f1e187] [cursor=pointer]:
              - /url: /topics/loneliness
              - generic [ref=f1e188]: 🌙
              - text: Lonely
              - generic [ref=f1e189]: · একাকী
            - link "🕯️ Hopeless · হতাশ" [ref=f1e190] [cursor=pointer]:
              - /url: /topics/hopelessness
              - generic [ref=f1e191]: 🕯️
              - text: Hopeless
              - generic [ref=f1e192]: · হতাশ
            - link "🔥 Angry · রাগান্বিত" [ref=f1e193] [cursor=pointer]:
              - /url: /topics/anger
              - generic [ref=f1e194]: 🔥
              - text: Angry
              - generic [ref=f1e195]: · রাগান্বিত
            - link "🤲 Guilty · অনুতপ্ত" [ref=f1e196] [cursor=pointer]:
              - /url: /topics/guilt-forgiveness
              - generic [ref=f1e197]: 🤲
              - text: Guilty
              - generic [ref=f1e198]: · অনুতপ্ত
            - link "🛡️ Afraid · ভীত" [ref=f1e199] [cursor=pointer]:
              - /url: /topics/fear
              - generic [ref=f1e200]: 🛡️
              - text: Afraid
              - generic [ref=f1e201]: · ভীত
        - region [ref=f1e202]:
          - generic [ref=f1e204]:
            - generic [ref=f1e205]:
              - paragraph [ref=f1e206]: Most read
              - heading "Popular surahs" [level=2] [ref=f1e207]
            - link "All 114 →" [ref=f1e208] [cursor=pointer]:
              - /url: /quran
              - text: All 114
              - generic [ref=f1e209]: →
          - generic [ref=f1e210]:
            - link "36 Ya-Sin Ya Sin · ইয়া-সীন يس" [ref=f1e212] [cursor=pointer]:
              - /url: /surah/ya-sin
              - generic [ref=f1e213]: "36"
              - generic [ref=f1e217]:
                - generic [ref=f1e218]: Ya-Sin
                - generic [ref=f1e219]: Ya Sin · ইয়া-সীন
              - generic [ref=f1e220]: يس
            - link "67 Al-Mulk The Sovereignty · আল-মুলক الملك" [ref=f1e222] [cursor=pointer]:
              - /url: /surah/al-mulk
              - generic [ref=f1e223]: "67"
              - generic [ref=f1e227]:
                - generic [ref=f1e228]: Al-Mulk
                - generic [ref=f1e229]: The Sovereignty · আল-মুলক
              - generic [ref=f1e230]: الملك
            - link "18 Al-Kahf The Cave · আল-কাহফ الكهف" [ref=f1e232] [cursor=pointer]:
              - /url: /surah/al-kahf
              - generic [ref=f1e233]: "18"
              - generic [ref=f1e237]:
                - generic [ref=f1e238]: Al-Kahf
                - generic [ref=f1e239]: The Cave · আল-কাহফ
              - generic [ref=f1e240]: الكهف
            - link "55 Ar-Rahman The Beneficent · আর-রহমান الرحمن" [ref=f1e242] [cursor=pointer]:
              - /url: /surah/ar-rahman
              - generic [ref=f1e243]: "55"
              - generic [ref=f1e247]:
                - generic [ref=f1e248]: Ar-Rahman
                - generic [ref=f1e249]: The Beneficent · আর-রহমান
              - generic [ref=f1e250]: الرحمن
            - link "56 Al-Waqi'ah The Inevitable · আল-ওয়াকিআ الواقعة" [ref=f1e252] [cursor=pointer]:
              - /url: /surah/al-waqiah
              - generic [ref=f1e253]: "56"
              - generic [ref=f1e257]:
                - generic [ref=f1e258]: Al-Waqi'ah
                - generic [ref=f1e259]: The Inevitable · আল-ওয়াকিআ
              - generic [ref=f1e260]: الواقعة
            - link "1 Al-Fatihah The Opener · আল-ফাতিহা الفاتحة" [ref=f1e262] [cursor=pointer]:
              - /url: /surah/al-fatihah
              - generic [ref=f1e263]: "1"
              - generic [ref=f1e267]:
                - generic [ref=f1e268]: Al-Fatihah
                - generic [ref=f1e269]: The Opener · আল-ফাতিহা
              - generic [ref=f1e270]: الفاتحة
            - link "2 Al-Baqarah The Cow · আল-বাকারা البقرة" [ref=f1e272] [cursor=pointer]:
              - /url: /surah/al-baqarah
              - generic [ref=f1e273]: "2"
              - generic [ref=f1e277]:
                - generic [ref=f1e278]: Al-Baqarah
                - generic [ref=f1e279]: The Cow · আল-বাকারা
              - generic [ref=f1e280]: البقرة
            - link "112 Al-Ikhlas The Sincerity · আল-ইখলাস الإخلاص" [ref=f1e282] [cursor=pointer]:
              - /url: /surah/al-ikhlas
              - generic [ref=f1e283]: "112"
              - generic [ref=f1e287]:
                - generic [ref=f1e288]: Al-Ikhlas
                - generic [ref=f1e289]: The Sincerity · আল-ইখলাস
              - generic [ref=f1e290]: الإخلاص
        - region [ref=f1e292]:
          - generic [ref=f1e322]:
            - generic [ref=f1e323]:
              - paragraph [ref=f1e324]: Why Noor
              - heading "Built with love. Free forever. No ads." [level=2] [ref=f1e325]
              - paragraph [ref=f1e326]: Every verse is pre-rendered for instant loading, works offline as an app, and keeps your bookmarks, notes and progress private on your device.
            - list [ref=f1e327]:
              - listitem [ref=f1e328]:
                - generic [ref=f1e329]: 6,236
                - text: ayahs with 3 translations
              - listitem [ref=f1e330]:
                - generic [ref=f1e331]: 20+
                - text: world-class reciters
              - listitem [ref=f1e332]:
                - generic [ref=f1e333]: "5"
                - text: reading themes
              - listitem [ref=f1e334]:
                - generic [ref=f1e335]: "0"
                - text: ads or trackers
  - contentinfo [ref=f1e336]:
    - generic [ref=f1e337]:
      - generic [ref=f1e338]:
        - link "Noor Quran home" [ref=f1e339] [cursor=pointer]:
          - /url: /
          - generic [ref=f1e340]:
            - generic [ref=f1e341]: Noor Quran
            - generic [ref=f1e342]: نُورُ القُرْآن
        - paragraph [ref=f1e343]: Noor Quran — the Holy Quran with Arabic text, Bangla and English translation, word-by-word meaning, tajweed colours, tafsir, 20+ reciters with word-synced audio, memorisation (hifz) studio, duas, 99 names of Allah, prayer times and Qibla. Free, fast, ad-free and open source.
        - paragraph [ref=f1e344]: পবিত্র কুরআন পড়ুন, শুনুন, বুঝুন ও মুখস্থ করুন
        - paragraph [ref=f1e345]: إِنَّ هَٰذَا ٱلْقُرْءَانَ يَهْدِى لِلَّتِى هِىَ أَقْوَمُ
        - paragraph [ref=f1e346]: “Indeed, this Quran guides to that which is most suitable.” — 17:9
      - generic [ref=f1e347]:
        - heading "Popular Surahs" [level=2] [ref=f1e348]
        - generic [ref=f1e349]:
          - link "Surah Al-Fatihah" [ref=f1e350] [cursor=pointer]:
            - /url: /surah/al-fatihah
          - link "Surah Al-Baqarah" [ref=f1e351] [cursor=pointer]:
            - /url: /surah/al-baqarah
          - link "Surah Al-Kahf" [ref=f1e352] [cursor=pointer]:
            - /url: /surah/al-kahf
          - link "Surah Ya-Sin" [ref=f1e353] [cursor=pointer]:
            - /url: /surah/ya-sin
          - link "Surah Ar-Rahman" [ref=f1e354] [cursor=pointer]:
            - /url: /surah/ar-rahman
          - link "Surah Al-Waqi'ah" [ref=f1e355] [cursor=pointer]:
            - /url: /surah/al-waqiah
          - link "Surah Al-Mulk" [ref=f1e356] [cursor=pointer]:
            - /url: /surah/al-mulk
          - link "Surah An-Naba" [ref=f1e357] [cursor=pointer]:
            - /url: /surah/an-naba
          - link "Surah Al-Ikhlas" [ref=f1e358] [cursor=pointer]:
            - /url: /surah/al-ikhlas
          - link "Surah Al-Falaq" [ref=f1e359] [cursor=pointer]:
            - /url: /surah/al-falaq
          - link "Surah An-Nas" [ref=f1e360] [cursor=pointer]:
            - /url: /surah/an-nas
          - link "Surah As-Sajdah" [ref=f1e361] [cursor=pointer]:
            - /url: /surah/as-sajdah
      - generic [ref=f1e362]:
        - heading "Popular" [level=2] [ref=f1e363]
        - generic [ref=f1e364]:
          - link "Ayatul Kursi (2:255)" [ref=f1e365] [cursor=pointer]:
            - /url: /surah/al-baqarah/255
          - link "Last two ayahs of Al-Baqarah" [ref=f1e366] [cursor=pointer]:
            - /url: /surah/al-baqarah/285
          - link "99 Names of Allah" [ref=f1e367] [cursor=pointer]:
            - /url: /names-of-allah
          - link "Daily Duas from Quran & Sunnah" [ref=f1e368] [cursor=pointer]:
            - /url: /dua
          - link "What the Quran says about…" [ref=f1e369] [cursor=pointer]:
            - /url: /topics
          - link "Memorise the Quran (Hifz)" [ref=f1e370] [cursor=pointer]:
            - /url: /hifz
          - link "Juz Amma (Para 30)" [ref=f1e371] [cursor=pointer]:
            - /url: /juz/30
          - link "Prayer times today" [ref=f1e372] [cursor=pointer]:
            - /url: /prayer-times
      - generic [ref=f1e373]:
        - heading "বাংলায় পড়ুন" [level=2] [ref=f1e374]
        - generic [ref=f1e375]:
          - link "আয়াতুল কুরসি বাংলা অর্থসহ" [ref=f1e376] [cursor=pointer]:
            - /url: /surah/al-baqarah/255
          - link "সূরা ইয়াসিন বাংলা উচ্চারণ ও অর্থ" [ref=f1e377] [cursor=pointer]:
            - /url: /surah/ya-sin
          - link "সূরা মুলক বাংলা অর্থসহ" [ref=f1e378] [cursor=pointer]:
            - /url: /surah/al-mulk
          - link "ঘুমানোর দোয়া" [ref=f1e379] [cursor=pointer]:
            - /url: /bn/dua/dua-before-sleeping
          - link "আল্লাহর ৯৯ নাম অর্থসহ" [ref=f1e380] [cursor=pointer]:
            - /url: /bn/names-of-allah
          - link "দৈনন্দিন দোয়া" [ref=f1e381] [cursor=pointer]:
            - /url: /bn/dua
          - link "দুশ্চিন্তা দূর করার আয়াত" [ref=f1e382] [cursor=pointer]:
            - /url: /bn/topics/anxiety
      - generic [ref=f1e383]:
        - heading "Noor" [level=2] [ref=f1e384]
        - generic [ref=f1e385]:
          - link "All 114 Surahs" [ref=f1e386] [cursor=pointer]:
            - /url: /quran
          - link "Quran Recitation" [ref=f1e387] [cursor=pointer]:
            - /url: /listen
          - link "Khatam Planner" [ref=f1e388] [cursor=pointer]:
            - /url: /journey
          - link "About & Sources" [ref=f1e389] [cursor=pointer]:
            - /url: /about
          - link "Open source on GitHub" [ref=f1e390] [cursor=pointer]:
            - /url: https://github.com/maremon7415/holy_quran
    - generic [ref=f1e391]:
      - paragraph [ref=f1e392]: Quran text, translations & audio via the open Quran.com (Quran Foundation) API · Free forever, no ads.
      - paragraph [ref=f1e393]: © 2026 Noor Quran
  - region "Notifications alt+T"
  - alert [ref=f1e394]
```

# Test source

```ts
  1  | import AxeBuilder from '@axe-core/playwright'
  2  | import fs from 'node:fs'
  3  | import path from 'node:path'
  4  | import { test, expect } from './fixtures'
  5  | 
  6  | interface Known { routes: Record<string, Record<string, string>> }
  7  | const known: Known = JSON.parse(fs.readFileSync(path.join(__dirname, 'a11y-known-issues.json'), 'utf8'))
  8  | 
  9  | const ROUTES = [
  10 |   '/', '/quran', '/surah/al-mulk', '/surah/al-baqarah/255', '/juz/30', '/topics', '/topics/patience', '/dua', '/dua/dua-morning-asbahna',
  11 |   '/names-of-allah', '/names-of-allah/ar-rahman', '/search?q=mercy', '/hifz', '/journey', '/prayer-times', '/qibla', '/calendar',
  12 |   '/dhikr', '/saved', '/settings', '/about', '/listen',
  13 | ]
  14 | 
  15 | const serious = (impact?: string | null) => impact === 'serious' || impact === 'critical'
  16 | 
  17 | async function audit(page: import('@playwright/test').Page, theme: string) {
  18 |   await page.goto('/')
  19 |   await page.evaluate((t) => localStorage.setItem('theme', t), theme)
  20 | }
  21 | 
  22 | for (const theme of ['light', 'dark']) {
  23 |   for (const route of theme === 'light' ? ROUTES : ['/', '/surah/al-mulk', '/dua', '/hifz']) {
  24 |     test(`a11y (${theme}): ${route}`, async ({ page }) => {
  25 |       await audit(page, theme)
  26 |       await page.goto(route)
  27 |       await page.waitForLoadState('networkidle')
  28 |       await page.waitForTimeout(700) // entrance animations (opacity transitions skew contrast results)
  29 |       const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  30 |       const found = results.violations.filter((v) => serious(v.impact))
  31 |       const key = theme === 'light' ? route : `${route} [${theme}]`
  32 |       const allowed = known.routes[key] ?? {}
  33 | 
  34 |       const unexpected = found.filter((v) => !(v.id in allowed))
  35 |       const summary = unexpected.map((v) => `${v.impact} ${v.id}: ${v.help} (${v.nodes.length} nodes) e.g. ${v.nodes[0]?.target?.join(' ')} — ${v.helpUrl}`)
> 36 |       expect(summary, `NEW serious/critical a11y violations on ${key}. Fix them, or (only if unfixable now) add to tests/e2e/a11y-known-issues.json`).toEqual([])
     |                                                                                                                                                       ^ Error: NEW serious/critical a11y violations on /. Fix them, or (only if unfixable now) add to tests/e2e/a11y-known-issues.json
  37 | 
  38 |       const fixed = Object.keys(allowed).filter((id) => !found.some((v) => v.id === id))
  39 |       expect(fixed, `a11y-known-issues.json lists rules that no longer occur on ${key}; remove them`).toEqual([])
  40 |     })
  41 |   }
  42 | }
  43 | 
```