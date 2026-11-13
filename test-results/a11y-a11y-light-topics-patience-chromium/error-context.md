# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a11y.spec.ts >> a11y (light): /topics/patience
- Location: tests/e2e/a11y.spec.ts:24:9

# Error details

```
Error: NEW serious/critical a11y violations on /topics/patience. Fix them, or (only if unfixable now) add to tests/e2e/a11y-known-issues.json

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 4

- Array []
+ Array [
+   "serious color-contrast: Elements must meet minimum color contrast ratio thresholds (3 nodes) e.g. a[href$=\"tawakkul\"] > .text-gold.font-bangla — https://dequeuniversity.com/rules/axe/4.14/color-contrast?application=playwright",
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
        - link "Duas" [ref=f1e15] [cursor=pointer]:
          - /url: /dua
        - button "More ▾" [ref=f1e16]:
          - text: More
          - generic [ref=f1e17]: ▾
      - generic [ref=f1e18]:
        - button "Search the Quran… ⌘K" [ref=f1e19]:
          - generic [ref=f1e21]: Search the Quran…
          - generic [ref=f1e22]: ⌘K
        - radiogroup "Language · ভাষা · اللغة" [ref=f1e23]:
          - radio "English" [checked] [ref=f1e24]: EN
          - radio "বাংলা" [ref=f1e25]: বাং
          - radio "العربية" [ref=f1e26]: عر
        - button "Change theme" [ref=f1e27]
        - link "Account & sync" [ref=f1e30] [cursor=pointer]:
          - /url: /account
  - main [ref=f1e32]:
    - generic [ref=f1e33]:
      - navigation "Breadcrumb" [ref=f1e34]:
        - list [ref=f1e35]:
          - listitem [ref=f1e36]:
            - link "Home" [ref=f1e37] [cursor=pointer]:
              - /url: /
          - listitem [ref=f1e38]:
            - link "Topics" [ref=f1e41] [cursor=pointer]:
              - /url: /topics
          - listitem [ref=f1e42]:
            - generic [ref=f1e45]: Patience (sabr)
      - generic [ref=f1e46]:
        - paragraph [ref=f1e50]: Character · চরিত্র ও আচরণ
        - heading "What does the Quran say about patience (sabr)? (ধৈর্য (সবর))" [level=1] [ref=f1e52]:
          - text: What does the Quran say about patience (sabr)?
          - generic [ref=f1e53]: (ধৈর্য (সবর))
        - paragraph [ref=f1e54]: Sabr is among the most repeated themes in the Quran. It means steadfastness in obedience, restraint from what is wrong, and calm endurance of hardship, and Allah promises to be with the patient.
        - paragraph [ref=f1e55]: কুরআনে সবর সবচেয়ে বেশি আলোচিত বিষয়গুলোর একটি। এর অর্থ আনুগত্যে অটল থাকা, মন্দ থেকে বিরত থাকা এবং বিপদে শান্তভাবে টিকে থাকা। আল্লাহ ধৈর্যশীলদের সঙ্গে আছেন।
        - generic [ref=f1e56]:
          - button "Share" [ref=f1e57]
          - generic [ref=f1e64]: 10 verses · 8 passages
      - navigation "Verses on this page" [ref=f1e65]:
        - link "Al-Baqarah 2:153" [ref=f1e66] [cursor=pointer]:
          - /url: "#ayah-2-153"
        - link "Al-Baqarah 2:155" [ref=f1e67] [cursor=pointer]:
          - /url: "#ayah-2-155"
        - link "Ali 'Imran 3:200" [ref=f1e68] [cursor=pointer]:
          - /url: "#ayah-3-200"
        - link "Az-Zumar 39:10" [ref=f1e69] [cursor=pointer]:
          - /url: "#ayah-39-10"
        - link "Al-'Asr 103:1–3" [ref=f1e70] [cursor=pointer]:
          - /url: "#ayah-103-1"
        - link "An-Nahl 16:127" [ref=f1e71] [cursor=pointer]:
          - /url: "#ayah-16-127"
        - link "Al-Anfal 8:46" [ref=f1e72] [cursor=pointer]:
          - /url: "#ayah-8-46"
        - link "Luqman 31:17" [ref=f1e73] [cursor=pointer]:
          - /url: "#ayah-31-17"
      - region "Verses" [ref=f1e74]:
        - article [ref=f1e76]:
          - generic [ref=f1e77]:
            - link "البقرة Al-Baqarah 2:153" [ref=f1e78] [cursor=pointer]:
              - /url: /surah/al-baqarah/153
              - generic [ref=f1e79]: البقرة
              - generic [ref=f1e80]: Al-Baqarah 2:153
            - link "Read in context" [ref=f1e81] [cursor=pointer]:
              - /url: /surah/al-baqarah#ayah-153
          - paragraph [ref=f1e87]:
            - text: يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ ۚ إِنَّ ٱللَّهَ مَعَ ٱلصَّـٰبِرِينَ
            - generic [ref=f1e88]: ١٥٣
          - generic [ref=f1e89]:
            - paragraph [ref=f1e90]: O you who have believed, seek help through patience and prayer. Indeed, Allāh is with the patient.
            - paragraph [ref=f1e91]: হে মু’মিনগণ! ধৈর্য ও সলাতের মাধ্যমে সাহায্য প্রার্থনা কর, নিশ্চয় আল্লাহ ধৈর্যশীলদের সঙ্গে আছেন।
          - paragraph [ref=f1e92]: Saheeh International · তাইসিরুল কুরআন
        - article [ref=f1e94]:
          - generic [ref=f1e95]:
            - link "البقرة Al-Baqarah 2:155" [ref=f1e96] [cursor=pointer]:
              - /url: /surah/al-baqarah/155
              - generic [ref=f1e97]: البقرة
              - generic [ref=f1e98]: Al-Baqarah 2:155
            - link "Read in context" [ref=f1e99] [cursor=pointer]:
              - /url: /surah/al-baqarah#ayah-155
          - paragraph [ref=f1e105]:
            - text: وَلَنَبْلُوَنَّكُم بِشَىْءٍ مِّنَ ٱلْخَوْفِ وَٱلْجُوعِ وَنَقْصٍ مِّنَ ٱلْأَمْوَٰلِ وَٱلْأَنفُسِ وَٱلثَّمَرَٰتِ ۗ وَبَشِّرِ ٱلصَّـٰبِرِينَ
            - generic [ref=f1e106]: ١٥٥
          - generic [ref=f1e107]:
            - paragraph [ref=f1e108]: And We will surely test you with something of fear and hunger and a loss of wealth and lives and fruits, but give good tidings to the patient,
            - paragraph [ref=f1e109]: তোমাদেরকে ভয় ও ক্ষুধা এবং ধন-সম্পদ, জীবন ও ফল-ফসলের ক্ষয়-ক্ষতি (এসবের) কোনকিছুর দ্বারা নিশ্চয়ই পরীক্ষা করব, ধৈর্যশীলদেরকে সুসংবাদ প্রদান কর।
          - paragraph [ref=f1e110]: Saheeh International · তাইসিরুল কুরআন
        - article [ref=f1e112]:
          - generic [ref=f1e113]:
            - link "آل عمران Ali 'Imran 3:200" [ref=f1e114] [cursor=pointer]:
              - /url: /surah/ali-imran/200
              - generic [ref=f1e115]: آل عمران
              - generic [ref=f1e116]: Ali 'Imran 3:200
            - link "Read in context" [ref=f1e117] [cursor=pointer]:
              - /url: /surah/ali-imran#ayah-200
          - paragraph [ref=f1e123]:
            - text: يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱصْبِرُوا۟ وَصَابِرُوا۟ وَرَابِطُوا۟ وَٱتَّقُوا۟ ٱللَّهَ لَعَلَّكُمْ تُفْلِحُونَ
            - generic [ref=f1e124]: ٢٠٠
          - generic [ref=f1e125]:
            - paragraph [ref=f1e126]: O you who have believed, persevere and endure and remain stationed and fear Allāh that you may be successful.
            - paragraph [ref=f1e127]: হে মু’মিনগণ! ধৈর্য অবলম্বন কর, দৃঢ়তা প্রদর্শন কর, নিজেদের প্রতিরক্ষাকল্পে পারস্পরিক বন্ধন মজবুত কর এবং আল্লাহকে ভয় কর, যাতে তোমরা সফলকাম হতে পার।
          - paragraph [ref=f1e128]: Saheeh International · তাইসিরুল কুরআন
        - article [ref=f1e130]:
          - generic [ref=f1e131]:
            - link "الزمر Az-Zumar 39:10" [ref=f1e132] [cursor=pointer]:
              - /url: /surah/az-zumar/10
              - generic [ref=f1e133]: الزمر
              - generic [ref=f1e134]: Az-Zumar 39:10
            - link "Read in context" [ref=f1e135] [cursor=pointer]:
              - /url: /surah/az-zumar#ayah-10
          - paragraph [ref=f1e141]:
            - text: قُلْ يَـٰعِبَادِ ٱلَّذِينَ ءَامَنُوا۟ ٱتَّقُوا۟ رَبَّكُمْ ۚ لِلَّذِينَ أَحْسَنُوا۟ فِى هَـٰذِهِ ٱلدُّنْيَا حَسَنَةٌ ۗ وَأَرْضُ ٱللَّهِ وَٰسِعَةٌ ۗ إِنَّمَا يُوَفَّى ٱلصَّـٰبِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ
            - generic [ref=f1e142]: ١٠
          - generic [ref=f1e143]:
            - paragraph [ref=f1e144]: Say, "O My servants who have believed, fear your Lord. For those who do good in this world is good, and the earth of Allāh is spacious. Indeed, the patient will be given their reward without account [i.e., limit]."
            - paragraph [ref=f1e145]: বল, হে ঈমানদারগণ! তোমরা তোমাদের প্রতিপালককে ভয় কর। এ দুনিয়ায় যারা ভাল কাজ করবে, তাদের জন্য আছে কল্যাণ। আল্লাহর যমীন প্রশস্ত (এক এলাকায় ‘ইবাদাত-বন্দেগী করা কঠিন হলে অন্যত্র চলে যাও)। আমি ধৈর্যশীলদেরকে তাদের পুরস্কার অপরিমিতভাবে দিয়ে থাকি।
          - paragraph [ref=f1e146]: Saheeh International · তাইসিরুল কুরআন
        - article [ref=f1e148]:
          - generic [ref=f1e149]:
            - link "العصر Al-'Asr 103:1" [ref=f1e150] [cursor=pointer]:
              - /url: /surah/al-asr/1
              - generic [ref=f1e151]: العصر
              - generic [ref=f1e152]: Al-'Asr 103:1
            - link "Read in context" [ref=f1e153] [cursor=pointer]:
              - /url: /surah/al-asr#ayah-1
          - paragraph [ref=f1e159]:
            - text: وَٱلْعَصْرِ
            - generic [ref=f1e160]: ١
          - generic [ref=f1e161]:
            - paragraph [ref=f1e162]: By time,
            - paragraph [ref=f1e163]: কালের শপথ
          - paragraph [ref=f1e164]: Saheeh International · তাইসিরুল কুরআন
        - article [ref=f1e166]:
          - generic [ref=f1e167]:
            - link "العصر Al-'Asr 103:2" [ref=f1e168] [cursor=pointer]:
              - /url: /surah/al-asr/2
              - generic [ref=f1e169]: العصر
              - generic [ref=f1e170]: Al-'Asr 103:2
            - link "Read in context" [ref=f1e171] [cursor=pointer]:
              - /url: /surah/al-asr#ayah-2
          - paragraph [ref=f1e177]:
            - text: إِنَّ ٱلْإِنسَـٰنَ لَفِى خُسْرٍ
            - generic [ref=f1e178]: ٢
          - generic [ref=f1e179]:
            - paragraph [ref=f1e180]: Indeed, mankind is in loss,
            - paragraph [ref=f1e181]: মানুষ অবশ্যই ক্ষতির মধ্যে (ডুবে) আছে,
          - paragraph [ref=f1e182]: Saheeh International · তাইসিরুল কুরআন
        - article [ref=f1e184]:
          - generic [ref=f1e185]:
            - link "العصر Al-'Asr 103:3" [ref=f1e186] [cursor=pointer]:
              - /url: /surah/al-asr/3
              - generic [ref=f1e187]: العصر
              - generic [ref=f1e188]: Al-'Asr 103:3
            - link "Read in context" [ref=f1e189] [cursor=pointer]:
              - /url: /surah/al-asr#ayah-3
          - paragraph [ref=f1e195]:
            - text: إِلَّا ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّـٰلِحَـٰتِ وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّبْرِ
            - generic [ref=f1e196]: ٣
          - generic [ref=f1e197]:
            - paragraph [ref=f1e198]: Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.
            - paragraph [ref=f1e199]: কিন্তু তারা নয় যারা ঈমান আনে ও সৎকর্ম করে এবং পরস্পরকে সত্যের উপদেশ দেয় এবং পরস্পরকে ধৈর্য ধারণের উপদেশ দেয়।
          - paragraph [ref=f1e200]: Saheeh International · তাইসিরুল কুরআন
        - article [ref=f1e202]:
          - generic [ref=f1e203]:
            - link "النحل An-Nahl 16:127" [ref=f1e204] [cursor=pointer]:
              - /url: /surah/an-nahl/127
              - generic [ref=f1e205]: النحل
              - generic [ref=f1e206]: An-Nahl 16:127
            - link "Read in context" [ref=f1e207] [cursor=pointer]:
              - /url: /surah/an-nahl#ayah-127
          - paragraph [ref=f1e213]:
            - text: وَٱصْبِرْ وَمَا صَبْرُكَ إِلَّا بِٱللَّهِ ۚ وَلَا تَحْزَنْ عَلَيْهِمْ وَلَا تَكُ فِى ضَيْقٍ مِّمَّا يَمْكُرُونَ
            - generic [ref=f1e214]: ١٢٧
          - generic [ref=f1e215]:
            - paragraph [ref=f1e216]: And be patient, [O Muḥammad], and your patience is not but through Allāh. And do not grieve over them and do not be in distress over what they conspire.
            - paragraph [ref=f1e217]: তুমি ধৈর্য ধারণ কর, তোমার ধৈর্য তো কেবল আল্লাহ ব্যতীত নয়, ওদের কার্যকলাপে তুমি দুঃখিত হয়ো না, আর ওদের ষড়যন্ত্র করার কারণে অন্তরে কুণ্ঠাবোধ করো না।
          - paragraph [ref=f1e218]: Saheeh International · তাইসিরুল কুরআন
        - article [ref=f1e220]:
          - generic [ref=f1e221]:
            - link "الأنفال Al-Anfal 8:46" [ref=f1e222] [cursor=pointer]:
              - /url: /surah/al-anfal/46
              - generic [ref=f1e223]: الأنفال
              - generic [ref=f1e224]: Al-Anfal 8:46
            - link "Read in context" [ref=f1e225] [cursor=pointer]:
              - /url: /surah/al-anfal#ayah-46
          - paragraph [ref=f1e231]:
            - text: وَأَطِيعُوا۟ ٱللَّهَ وَرَسُولَهُۥ وَلَا تَنَـٰزَعُوا۟ فَتَفْشَلُوا۟ وَتَذْهَبَ رِيحُكُمْ ۖ وَٱصْبِرُوٓا۟ ۚ إِنَّ ٱللَّهَ مَعَ ٱلصَّـٰبِرِينَ
            - generic [ref=f1e232]: ٤٦
          - generic [ref=f1e233]:
            - paragraph [ref=f1e234]: And obey Allāh and His Messenger, and do not dispute and [thus] lose courage and [then] your strength would depart; and be patient. Indeed, Allāh is with the patient.
            - paragraph [ref=f1e235]: আল্লাহ ও তাঁর রসূলের আনুগত্য কর, পরস্পরে ঝগড়া বিবাদ করো না, তা করলে তোমরা সাহস হারিয়ে ফেলবে, তোমাদের শক্তি-ক্ষমতা বিলুপ্ত হবে। আর ধৈর্য ধারণ করবে, আল্লাহ ধৈর্যশীলদের সঙ্গে আছেন।
          - paragraph [ref=f1e236]: Saheeh International · তাইসিরুল কুরআন
        - article [ref=f1e238]:
          - generic [ref=f1e239]:
            - link "لقمان Luqman 31:17" [ref=f1e240] [cursor=pointer]:
              - /url: /surah/luqman/17
              - generic [ref=f1e241]: لقمان
              - generic [ref=f1e242]: Luqman 31:17
            - link "Read in context" [ref=f1e243] [cursor=pointer]:
              - /url: /surah/luqman#ayah-17
          - paragraph [ref=f1e249]:
            - text: يَـٰبُنَىَّ أَقِمِ ٱلصَّلَوٰةَ وَأْمُرْ بِٱلْمَعْرُوفِ وَٱنْهَ عَنِ ٱلْمُنكَرِ وَٱصْبِرْ عَلَىٰ مَآ أَصَابَكَ ۖ إِنَّ ذَٰلِكَ مِنْ عَزْمِ ٱلْأُمُورِ
            - generic [ref=f1e250]: ١٧
          - generic [ref=f1e251]:
            - paragraph [ref=f1e252]: O my son, establish prayer, enjoin what is right, forbid what is wrong, and be patient over what befalls you. Indeed, [all] that is of the matters [requiring] resolve.
            - paragraph [ref=f1e253]: হে বৎস! তুমি নামায কায়িম কর, সৎ কাজের নির্দেশ দাও আর মন্দ কাজ হতে নিষেধ কর এবং বিপদাপদে ধৈর্যধারণ কর। নিশ্চয় এটা দৃঢ় সংকল্পের কাজ।
          - paragraph [ref=f1e254]: Saheeh International · তাইসিরুল কুরআন
      - region [ref=f1e256]:
        - heading "Reflect · ভাবুন" [level=2] [ref=f1e257]
        - paragraph [ref=f1e259]: Where is patience being asked of you right now? What would patient action look like, not just patient waiting?
        - paragraph [ref=f1e260]: এখন কোন জায়গায় আপনার কাছে ধৈর্য চাওয়া হচ্ছে? কেবল অপেক্ষা নয়, ধৈর্যের সঙ্গে কাজ করা দেখতে কেমন?
      - region [ref=f1e261]:
        - heading "Related duas · সংশ্লিষ্ট দোয়া" [level=2] [ref=f1e262]
        - list [ref=f1e263]:
          - listitem [ref=f1e264]:
            - link "Rabbana afrigh ‘alayna sabran — pour patience upon us রাব্বানা আফরিগ আলাইনা সাবরা Quran 2:250" [ref=f1e266] [cursor=pointer]:
              - /url: /dua/rabbana-afrigh-alayna-sabran
              - generic [ref=f1e269]:
                - generic [ref=f1e270]: Rabbana afrigh ‘alayna sabran — pour patience upon us
                - generic [ref=f1e271]: রাব্বানা আফরিগ আলাইনা সাবরা
                - generic [ref=f1e272]: Quran 2:250
          - listitem [ref=f1e273]:
            - link "Dua at times of distress (Dua al-Karb) বিপদের সময়ের দোয়া (দোয়া আল-কারব) Sahih al-Bukhari 6346; Sahih Muslim 2730" [ref=f1e275] [cursor=pointer]:
              - /url: /dua/dua-for-distress
              - generic [ref=f1e278]:
                - generic [ref=f1e279]: Dua at times of distress (Dua al-Karb)
                - generic [ref=f1e280]: বিপদের সময়ের দোয়া (দোয়া আল-কারব)
                - generic [ref=f1e281]: Sahih al-Bukhari 6346; Sahih Muslim 2730
      - region [ref=f1e282]:
        - heading "Related topics · সম্পর্কিত বিষয়" [level=2] [ref=f1e283]
        - generic [ref=f1e284]:
          - link "trust in Allah (tawakkul) · আল্লাহর ওপর ভরসা (তাওয়াক্কুল)" [ref=f1e285] [cursor=pointer]:
            - /url: /topics/tawakkul
            - text: trust in Allah (tawakkul)
            - generic [ref=f1e286]: · আল্লাহর ওপর ভরসা (তাওয়াক্কুল)
          - link "anxiety and worry · দুশ্চিন্তা ও উদ্বেগ" [ref=f1e287] [cursor=pointer]:
            - /url: /topics/anxiety
            - text: anxiety and worry
            - generic [ref=f1e288]: · দুশ্চিন্তা ও উদ্বেগ
          - link "gratitude (shukr) · কৃতজ্ঞতা (শুকর)" [ref=f1e289] [cursor=pointer]:
            - /url: /topics/gratitude
            - text: gratitude (shukr)
            - generic [ref=f1e290]: · কৃতজ্ঞতা (শুকর)
      - region [ref=f1e291]:
        - heading "Frequently asked questions" [level=2] [ref=f1e292]
        - generic [ref=f1e293]:
          - group [ref=f1e294]:
            - generic "What does the Quran say about patience (sabr)?" [ref=f1e295] [cursor=pointer]
          - group [ref=f1e299]:
            - generic "কুরআনে ধৈর্য (সবর) সম্পর্কে কী বলা হয়েছে?" [ref=f1e300] [cursor=pointer]
          - group [ref=f1e304]:
            - generic "Which verses of the Quran mention patience (sabr)?" [ref=f1e305] [cursor=pointer]
          - group [ref=f1e309]:
            - generic "Is there a dua related to patience (sabr)?" [ref=f1e310] [cursor=pointer]
      - navigation "Previous and next topic" [ref=f1e314]:
        - link "← Previous topic contentment and inner peace" [ref=f1e315] [cursor=pointer]:
          - /url: /topics/contentment
          - generic [ref=f1e316]:
            - generic [ref=f1e317]: ←
            - text: Previous topic
          - generic [ref=f1e318]: contentment and inner peace
        - link "Next topic → gratitude (shukr)" [ref=f1e319] [cursor=pointer]:
          - /url: /topics/gratitude
          - generic [ref=f1e320]:
            - text: Next topic
            - generic [ref=f1e321]: →
          - generic [ref=f1e322]: gratitude (shukr)
  - contentinfo [ref=f1e323]:
    - generic [ref=f1e324]:
      - generic [ref=f1e325]:
        - link "Noor Quran home" [ref=f1e326] [cursor=pointer]:
          - /url: /
          - generic [ref=f1e327]:
            - generic [ref=f1e328]: Noor Quran
            - generic [ref=f1e329]: نُورُ القُرْآن
        - paragraph [ref=f1e330]: Noor Quran — the Holy Quran with Arabic text, Bangla and English translation, word-by-word meaning, tajweed colours, tafsir, 20+ reciters with word-synced audio, memorisation (hifz) studio, duas, 99 names of Allah, prayer times and Qibla. Free, fast, ad-free and open source.
        - paragraph [ref=f1e331]: পবিত্র কুরআন পড়ুন, শুনুন, বুঝুন ও মুখস্থ করুন
        - paragraph [ref=f1e332]: إِنَّ هَٰذَا ٱلْقُرْءَانَ يَهْدِى لِلَّتِى هِىَ أَقْوَمُ
        - paragraph [ref=f1e333]: “Indeed, this Quran guides to that which is most suitable.” — 17:9
      - generic [ref=f1e334]:
        - heading "Popular Surahs" [level=2] [ref=f1e335]
        - generic [ref=f1e336]:
          - link "Surah Al-Fatihah" [ref=f1e337] [cursor=pointer]:
            - /url: /surah/al-fatihah
          - link "Surah Al-Baqarah" [ref=f1e338] [cursor=pointer]:
            - /url: /surah/al-baqarah
          - link "Surah Al-Kahf" [ref=f1e339] [cursor=pointer]:
            - /url: /surah/al-kahf
          - link "Surah Ya-Sin" [ref=f1e340] [cursor=pointer]:
            - /url: /surah/ya-sin
          - link "Surah Ar-Rahman" [ref=f1e341] [cursor=pointer]:
            - /url: /surah/ar-rahman
          - link "Surah Al-Waqi'ah" [ref=f1e342] [cursor=pointer]:
            - /url: /surah/al-waqiah
          - link "Surah Al-Mulk" [ref=f1e343] [cursor=pointer]:
            - /url: /surah/al-mulk
          - link "Surah An-Naba" [ref=f1e344] [cursor=pointer]:
            - /url: /surah/an-naba
          - link "Surah Al-Ikhlas" [ref=f1e345] [cursor=pointer]:
            - /url: /surah/al-ikhlas
          - link "Surah Al-Falaq" [ref=f1e346] [cursor=pointer]:
            - /url: /surah/al-falaq
          - link "Surah An-Nas" [ref=f1e347] [cursor=pointer]:
            - /url: /surah/an-nas
          - link "Surah As-Sajdah" [ref=f1e348] [cursor=pointer]:
            - /url: /surah/as-sajdah
      - generic [ref=f1e349]:
        - heading "Popular" [level=2] [ref=f1e350]
        - generic [ref=f1e351]:
          - link "Ayatul Kursi (2:255)" [ref=f1e352] [cursor=pointer]:
            - /url: /surah/al-baqarah/255
          - link "Last two ayahs of Al-Baqarah" [ref=f1e353] [cursor=pointer]:
            - /url: /surah/al-baqarah/285
          - link "99 Names of Allah" [ref=f1e354] [cursor=pointer]:
            - /url: /names-of-allah
          - link "Daily Duas from Quran & Sunnah" [ref=f1e355] [cursor=pointer]:
            - /url: /dua
          - link "What the Quran says about…" [ref=f1e356] [cursor=pointer]:
            - /url: /topics
          - link "Memorise the Quran (Hifz)" [ref=f1e357] [cursor=pointer]:
            - /url: /hifz
          - link "Juz Amma (Para 30)" [ref=f1e358] [cursor=pointer]:
            - /url: /juz/30
          - link "Prayer times today" [ref=f1e359] [cursor=pointer]:
            - /url: /prayer-times
      - generic [ref=f1e360]:
        - heading "বাংলায় পড়ুন" [level=2] [ref=f1e361]
        - generic [ref=f1e362]:
          - link "আয়াতুল কুরসি বাংলা অর্থসহ" [ref=f1e363] [cursor=pointer]:
            - /url: /surah/al-baqarah/255
          - link "সূরা ইয়াসিন বাংলা উচ্চারণ ও অর্থ" [ref=f1e364] [cursor=pointer]:
            - /url: /surah/ya-sin
          - link "সূরা মুলক বাংলা অর্থসহ" [ref=f1e365] [cursor=pointer]:
            - /url: /surah/al-mulk
          - link "ঘুমানোর দোয়া" [ref=f1e366] [cursor=pointer]:
            - /url: /bn/dua/dua-before-sleeping
          - link "আল্লাহর ৯৯ নাম অর্থসহ" [ref=f1e367] [cursor=pointer]:
            - /url: /bn/names-of-allah
          - link "দৈনন্দিন দোয়া" [ref=f1e368] [cursor=pointer]:
            - /url: /bn/dua
          - link "দুশ্চিন্তা দূর করার আয়াত" [ref=f1e369] [cursor=pointer]:
            - /url: /bn/topics/anxiety
      - generic [ref=f1e370]:
        - heading "Noor" [level=2] [ref=f1e371]
        - generic [ref=f1e372]:
          - link "All 114 Surahs" [ref=f1e373] [cursor=pointer]:
            - /url: /quran
          - link "Quran Recitation" [ref=f1e374] [cursor=pointer]:
            - /url: /listen
          - link "Khatam Planner" [ref=f1e375] [cursor=pointer]:
            - /url: /journey
          - link "About & Sources" [ref=f1e376] [cursor=pointer]:
            - /url: /about
          - link "Open source on GitHub" [ref=f1e377] [cursor=pointer]:
            - /url: https://github.com/maremon7415/holy_quran
    - generic [ref=f1e378]:
      - paragraph [ref=f1e379]: Quran text, translations & audio via the open Quran.com (Quran Foundation) API · Free forever, no ads.
      - paragraph [ref=f1e380]: © 2026 Noor Quran
  - region "Notifications alt+T"
  - alert [ref=f1e381]
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
     |                                                                                                                                                       ^ Error: NEW serious/critical a11y violations on /topics/patience. Fix them, or (only if unfixable now) add to tests/e2e/a11y-known-issues.json
  37 | 
  38 |       const fixed = Object.keys(allowed).filter((id) => !found.some((v) => v.id === id))
  39 |       expect(fixed, `a11y-known-issues.json lists rules that no longer occur on ${key}; remove them`).toEqual([])
  40 |     })
  41 |   }
  42 | }
  43 | 
```