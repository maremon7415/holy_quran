# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a11y.spec.ts >> a11y (light): /topics
- Location: tests/e2e/a11y.spec.ts:24:9

# Error details

```
Error: NEW serious/critical a11y violations on /topics. Fix them, or (only if unfixable now) add to tests/e2e/a11y-known-issues.json

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
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
            - generic [ref=f1e41]: Topics
      - generic [ref=f1e42]:
        - paragraph [ref=f1e46]: Quran by topic · বিষয়ভিত্তিক
        - heading "What does the Quran say about… কুরআন কী বলে?" [level=1] [ref=f1e48]:
          - text: What does the Quran say about…
          - generic [ref=f1e49]: কুরআন কী বলে?
        - paragraph [ref=f1e50]: 40 topics, each with carefully chosen verses in Arabic, English and Bangla. Browse by feeling, character, family, faith or society. প্রতিটি বিষয়ের জন্য বাছাই করা আয়াত, আরবি, ইংরেজি ও বাংলা অনুবাদসহ।
      - region [ref=f1e52]:
        - heading "How do you feel right now?" [level=2] [ref=f1e53]
        - paragraph [ref=f1e54]: Choose a feeling and we will open a verse and a dua for it.
        - tablist "Moods" [ref=f1e55]:
          - tab "Anxious" [ref=f1e56]
          - tab "Sad" [ref=f1e58]
          - tab "Lonely" [ref=f1e60]
          - tab "Angry" [ref=f1e62]
          - tab "Hopeless" [ref=f1e64]
          - tab "Afraid" [ref=f1e66]
          - tab "Guilty" [ref=f1e68]
          - tab "Grateful" [ref=f1e70]
          - tab "At peace" [ref=f1e72]
      - region [ref=f1e74]:
        - generic [ref=f1e79]:
          - heading "Emotions & struggles · অনুভূতি ও কঠিন সময়" [level=2] [ref=f1e80]:
            - text: Emotions & struggles
            - generic [ref=f1e81]: · অনুভূতি ও কঠিন সময়
          - paragraph [ref=f1e82]: Verses for the heart on heavy days · ভারী দিনে মনের জন্য আয়াত
        - list [ref=f1e83]:
          - listitem [ref=f1e84]:
            - link "anxiety and worry দুশ্চিন্তা ও উদ্বেগ Anxiety is a very human experience, and the Quran speaks to it gently. These verses point to remembrance of Allah, to the promise that ease follows hardship, and to the reassurance that no soul is burdened beyond what it can bear. 8 verses →" [ref=f1e86] [cursor=pointer]:
              - /url: /topics/anxiety
              - generic [ref=f1e87]: anxiety and worry
              - generic [ref=f1e88]: দুশ্চিন্তা ও উদ্বেগ
              - generic [ref=f1e89]: Anxiety is a very human experience, and the Quran speaks to it gently. These verses point to remembrance of Allah, to the promise that ease follows hardship, and to the reassurance that no soul is burdened beyond what it can bear.
              - generic [ref=f1e90]: 8 verses →
          - listitem [ref=f1e91]:
            - link "sadness and grief দুঃখ ও শোক The Quran does not ask us to hide our sorrow. The Prophet Ya‘qub wept for years and still turned only to Allah, and believers are promised that those who stay firm will not be left without comfort. 8 verses →" [ref=f1e93] [cursor=pointer]:
              - /url: /topics/grief-sadness
              - generic [ref=f1e94]: sadness and grief
              - generic [ref=f1e95]: দুঃখ ও শোক
              - generic [ref=f1e96]: The Quran does not ask us to hide our sorrow. The Prophet Ya‘qub wept for years and still turned only to Allah, and believers are promised that those who stay firm will not be left without comfort.
              - generic [ref=f1e97]: 8 verses →
          - listitem [ref=f1e98]:
            - link "loneliness একাকিত্ব When people feel far away, the Quran reminds us that Allah is near, hears every call, and is with us wherever we are. The Prophet ﷺ himself was once an orphan whom Allah sheltered. 7 verses →" [ref=f1e100] [cursor=pointer]:
              - /url: /topics/loneliness
              - generic [ref=f1e101]: loneliness
              - generic [ref=f1e102]: একাকিত্ব
              - generic [ref=f1e103]: When people feel far away, the Quran reminds us that Allah is near, hears every call, and is with us wherever we are. The Prophet ﷺ himself was once an orphan whom Allah sheltered.
              - generic [ref=f1e104]: 7 verses →
          - listitem [ref=f1e105]:
            - 'link "anger রাগ The Quran praises those who restrain their anger and pardon others, and it offers a practical response to provocation: answer harm with something better. Self-control is described as a mark of the mindful. 7 verses →" [ref=f1e107] [cursor=pointer]':
              - /url: /topics/anger
              - generic [ref=f1e108]: anger
              - generic [ref=f1e109]: রাগ
              - generic [ref=f1e110]: "The Quran praises those who restrain their anger and pardon others, and it offers a practical response to provocation: answer harm with something better. Self-control is described as a mark of the mindful."
              - generic [ref=f1e111]: 7 verses →
          - listitem [ref=f1e112]:
            - link "hopelessness and despair হতাশা Despair of Allah’s mercy is warned against in the Quran, while hope is repeatedly renewed. Prophets such as Ya‘qub and Ibrahim kept hoping through years of trial, and the Quran promises that ease accompanies hardship. 7 verses →" [ref=f1e114] [cursor=pointer]:
              - /url: /topics/hopelessness
              - generic [ref=f1e115]: hopelessness and despair
              - generic [ref=f1e116]: হতাশা
              - generic [ref=f1e117]: Despair of Allah’s mercy is warned against in the Quran, while hope is repeatedly renewed. Prophets such as Ya‘qub and Ibrahim kept hoping through years of trial, and the Quran promises that ease accompanies hardship.
              - generic [ref=f1e118]: 7 verses →
          - listitem [ref=f1e119]:
            - 'link "fear ভয় The Quran acknowledges fear as part of being tested, and then points to where safety lies: the angels’ message to the steadfast is “do not fear and do not grieve”. Real security comes from Allah, who protects and suffices. 8 verses →" [ref=f1e121] [cursor=pointer]':
              - /url: /topics/fear
              - generic [ref=f1e122]: fear
              - generic [ref=f1e123]: ভয়
              - generic [ref=f1e124]: "The Quran acknowledges fear as part of being tested, and then points to where safety lies: the angels’ message to the steadfast is “do not fear and do not grieve”. Real security comes from Allah, who protects and suffices."
              - generic [ref=f1e125]: 8 verses →
          - listitem [ref=f1e126]:
            - 'link "guilt and seeking forgiveness অনুশোচনা ও ক্ষমা প্রার্থনা Guilt can be a sign of a living heart. The Quran invites us to turn back quickly: Allah forgives all sins for those who repent, and the believers are those who, when they err, remember Him and ask forgiveness. 7 verses →" [ref=f1e128] [cursor=pointer]':
              - /url: /topics/guilt-forgiveness
              - generic [ref=f1e129]: guilt and seeking forgiveness
              - generic [ref=f1e130]: অনুশোচনা ও ক্ষমা প্রার্থনা
              - generic [ref=f1e131]: "Guilt can be a sign of a living heart. The Quran invites us to turn back quickly: Allah forgives all sins for those who repent, and the believers are those who, when they err, remember Him and ask forgiveness."
              - generic [ref=f1e132]: 7 verses →
          - listitem [ref=f1e133]:
            - link "contentment and inner peace তৃপ্তি ও মনের প্রশান্তি The Quran links a good life to faith and righteous action, and a satisfied soul to Allah’s pleasure. It also cautions that worldly life is a passing enjoyment, so lasting peace is found in what lasts. 8 verses →" [ref=f1e135] [cursor=pointer]:
              - /url: /topics/contentment
              - generic [ref=f1e136]: contentment and inner peace
              - generic [ref=f1e137]: তৃপ্তি ও মনের প্রশান্তি
              - generic [ref=f1e138]: The Quran links a good life to faith and righteous action, and a satisfied soul to Allah’s pleasure. It also cautions that worldly life is a passing enjoyment, so lasting peace is found in what lasts.
              - generic [ref=f1e139]: 8 verses →
      - region [ref=f1e140]:
        - generic [ref=f1e145]:
          - heading "Character · চরিত্র ও আচরণ" [level=2] [ref=f1e146]:
            - text: Character
            - generic [ref=f1e147]: · চরিত্র ও আচরণ
          - paragraph [ref=f1e148]: The qualities the Quran invites us to build · কুরআন যে গুণগুলো গড়ে তুলতে বলে
        - list [ref=f1e149]:
          - listitem [ref=f1e150]:
            - link "patience (sabr) ধৈর্য (সবর) Sabr is among the most repeated themes in the Quran. It means steadfastness in obedience, restraint from what is wrong, and calm endurance of hardship, and Allah promises to be with the patient. 8 verses →" [ref=f1e152] [cursor=pointer]:
              - /url: /topics/patience
              - generic [ref=f1e153]: patience (sabr)
              - generic [ref=f1e154]: ধৈর্য (সবর)
              - generic [ref=f1e155]: Sabr is among the most repeated themes in the Quran. It means steadfastness in obedience, restraint from what is wrong, and calm endurance of hardship, and Allah promises to be with the patient.
              - generic [ref=f1e156]: 8 verses →
          - listitem [ref=f1e157]:
            - 'link "gratitude (shukr) কৃতজ্ঞতা (শুকর) Gratitude in the Quran is both a feeling and a way of living: thanking Allah with the tongue, the heart and good deeds. Allah promises to increase those who are thankful. 8 verses →" [ref=f1e159] [cursor=pointer]':
              - /url: /topics/gratitude
              - generic [ref=f1e160]: gratitude (shukr)
              - generic [ref=f1e161]: কৃতজ্ঞতা (শুকর)
              - generic [ref=f1e162]: "Gratitude in the Quran is both a feeling and a way of living: thanking Allah with the tongue, the heart and good deeds. Allah promises to increase those who are thankful."
              - generic [ref=f1e163]: 8 verses →
          - listitem [ref=f1e164]:
            - link "honesty and truthfulness সততা ও সত্যবাদিতা The Quran calls believers to be with the truthful, to speak straight words and to be fair in weights and dealings. It also warns against saying what we do not do. 7 verses →" [ref=f1e166] [cursor=pointer]:
              - /url: /topics/honesty
              - generic [ref=f1e167]: honesty and truthfulness
              - generic [ref=f1e168]: সততা ও সত্যবাদিতা
              - generic [ref=f1e169]: The Quran calls believers to be with the truthful, to speak straight words and to be fair in weights and dealings. It also warns against saying what we do not do.
              - generic [ref=f1e170]: 7 verses →
          - listitem [ref=f1e171]:
            - 'link "kindness and good conduct দয়া ও উত্তম আচরণ Ihsan, doing good beautifully, runs through the Quran: towards parents, relatives, neighbours, the needy and even those who wrong us. The Prophet ﷺ is described as gentle, and gentleness drew people to him. 8 verses →" [ref=f1e173] [cursor=pointer]':
              - /url: /topics/kindness
              - generic [ref=f1e174]: kindness and good conduct
              - generic [ref=f1e175]: দয়া ও উত্তম আচরণ
              - generic [ref=f1e176]: "Ihsan, doing good beautifully, runs through the Quran: towards parents, relatives, neighbours, the needy and even those who wrong us. The Prophet ﷺ is described as gentle, and gentleness drew people to him."
              - generic [ref=f1e177]: 8 verses →
          - listitem [ref=f1e178]:
            - link "humility বিনয় The Quran describes the servants of the Most Merciful as those who walk humbly on the earth. It warns against pride and reminds us that no one can split the earth or reach the mountains in height. 8 verses →" [ref=f1e180] [cursor=pointer]:
              - /url: /topics/humility
              - generic [ref=f1e181]: humility
              - generic [ref=f1e182]: বিনয়
              - generic [ref=f1e183]: The Quran describes the servants of the Most Merciful as those who walk humbly on the earth. It warns against pride and reminds us that no one can split the earth or reach the mountains in height.
              - generic [ref=f1e184]: 8 verses →
          - listitem [ref=f1e185]:
            - link "forgiving others অন্যকে ক্ষমা করা The Quran encourages pardoning and overlooking, and reminds us that we, too, hope to be forgiven. At the same time it recognises the right to just recompense, while saying that to forgive is closer to piety. 7 verses →" [ref=f1e187] [cursor=pointer]:
              - /url: /topics/forgiving-others
              - generic [ref=f1e188]: forgiving others
              - generic [ref=f1e189]: অন্যকে ক্ষমা করা
              - generic [ref=f1e190]: The Quran encourages pardoning and overlooking, and reminds us that we, too, hope to be forgiven. At the same time it recognises the right to just recompense, while saying that to forgive is closer to piety.
              - generic [ref=f1e191]: 7 verses →
          - listitem [ref=f1e192]:
            - 'link "justice ন্যায়বিচার Justice is a central command: to stand firmly for fairness even against ourselves, our parents or our relatives, and not to let hatred of a people push us to injustice. 8 verses →" [ref=f1e194] [cursor=pointer]':
              - /url: /topics/justice
              - generic [ref=f1e195]: justice
              - generic [ref=f1e196]: ন্যায়বিচার
              - generic [ref=f1e197]: "Justice is a central command: to stand firmly for fairness even against ourselves, our parents or our relatives, and not to let hatred of a people push us to injustice."
              - generic [ref=f1e198]: 8 verses →
      - region [ref=f1e199]:
        - generic [ref=f1e204]:
          - heading "Life · জীবন" [level=2] [ref=f1e205]:
            - text: Life
            - generic [ref=f1e206]: · জীবন
          - paragraph [ref=f1e207]: Family, work, wealth, health and knowledge · পরিবার, কাজ, সম্পদ, স্বাস্থ্য ও জ্ঞান
        - list [ref=f1e208]:
          - listitem [ref=f1e209]:
            - link "parents মা-বাবা Kindness to parents is placed right after the worship of Allah in several verses. The Quran speaks tenderly of a mother’s hardship, asks for gentle words in old age, and teaches a du‘a of mercy for them. 8 verses →" [ref=f1e211] [cursor=pointer]:
              - /url: /topics/parents
              - generic [ref=f1e212]: parents
              - generic [ref=f1e213]: মা-বাবা
              - generic [ref=f1e214]: Kindness to parents is placed right after the worship of Allah in several verses. The Quran speaks tenderly of a mother’s hardship, asks for gentle words in old age, and teaches a du‘a of mercy for them.
              - generic [ref=f1e215]: 8 verses →
          - listitem [ref=f1e216]:
            - 'link "marriage বিয়ে ও দাম্পত্য The Quran presents marriage as a sign of Allah: companionship, affection and mercy between spouses. It speaks of spouses as garments for one another and encourages fair and kind treatment. 7 verses →" [ref=f1e218] [cursor=pointer]':
              - /url: /topics/marriage
              - generic [ref=f1e219]: marriage
              - generic [ref=f1e220]: বিয়ে ও দাম্পত্য
              - generic [ref=f1e221]: "The Quran presents marriage as a sign of Allah: companionship, affection and mercy between spouses. It speaks of spouses as garments for one another and encourages fair and kind treatment."
              - generic [ref=f1e222]: 7 verses →
          - listitem [ref=f1e223]:
            - link "children সন্তান Children are described as adornment and as a test. The Quran records the du‘as of Zakariyya and Ibrahim for righteous offspring and the counsel of Luqman to his son, a model of loving guidance. 8 verses →" [ref=f1e225] [cursor=pointer]:
              - /url: /topics/children
              - generic [ref=f1e226]: children
              - generic [ref=f1e227]: সন্তান
              - generic [ref=f1e228]: Children are described as adornment and as a test. The Quran records the du‘as of Zakariyya and Ibrahim for righteous offspring and the counsel of Luqman to his son, a model of loving guidance.
              - generic [ref=f1e229]: 8 verses →
          - listitem [ref=f1e230]:
            - link "wealth and provision (rizq) সম্পদ ও রিজিক The Quran teaches that every creature’s provision is with Allah, while encouraging honest effort, moderation and sharing. Taqwa is linked with unexpected ways out and provision from where one does not expect. 8 verses →" [ref=f1e232] [cursor=pointer]:
              - /url: /topics/wealth-rizq
              - generic [ref=f1e233]: wealth and provision (rizq)
              - generic [ref=f1e234]: সম্পদ ও রিজিক
              - generic [ref=f1e235]: The Quran teaches that every creature’s provision is with Allah, while encouraging honest effort, moderation and sharing. Taqwa is linked with unexpected ways out and provision from where one does not expect.
              - generic [ref=f1e236]: 8 verses →
          - listitem [ref=f1e237]:
            - link "work and effort কাজ ও প্রচেষ্টা Work is treated as worthy and as part of worship when done honestly. The Quran encourages seeking Allah’s bounty after prayer, says a person will have what they strive for, and praises strength combined with trustworthiness. 8 verses →" [ref=f1e239] [cursor=pointer]:
              - /url: /topics/work
              - generic [ref=f1e240]: work and effort
              - generic [ref=f1e241]: কাজ ও প্রচেষ্টা
              - generic [ref=f1e242]: Work is treated as worthy and as part of worship when done honestly. The Quran encourages seeking Allah’s bounty after prayer, says a person will have what they strive for, and praises strength combined with trustworthiness.
              - generic [ref=f1e243]: 8 verses →
          - listitem [ref=f1e244]:
            - link "death মৃত্যু Every soul will taste death, and the Quran asks us to hold that truth calmly rather than with dread. Death is presented as a return to Allah and a doorway to accountability, so life is a chance to prepare. 8 verses →" [ref=f1e246] [cursor=pointer]:
              - /url: /topics/death
              - generic [ref=f1e247]: death
              - generic [ref=f1e248]: মৃত্যু
              - generic [ref=f1e249]: Every soul will taste death, and the Quran asks us to hold that truth calmly rather than with dread. Death is presented as a return to Allah and a doorway to accountability, so life is a chance to prepare.
              - generic [ref=f1e250]: 8 verses →
          - listitem [ref=f1e251]:
            - 'link "knowledge and learning জ্ঞান ও শিক্ষা The first revealed word of the Quran was “Read”. Knowledge is honoured throughout, scholars are said to be those who truly fear Allah, and the Prophet ﷺ was taught to ask: “My Lord, increase me in knowledge.” 8 verses →" [ref=f1e253] [cursor=pointer]':
              - /url: /topics/knowledge
              - generic [ref=f1e254]: knowledge and learning
              - generic [ref=f1e255]: জ্ঞান ও শিক্ষা
              - generic [ref=f1e256]: "The first revealed word of the Quran was “Read”. Knowledge is honoured throughout, scholars are said to be those who truly fear Allah, and the Prophet ﷺ was taught to ask: “My Lord, increase me in knowledge.”"
              - generic [ref=f1e257]: 8 verses →
          - listitem [ref=f1e258]:
            - 'link "health and healing সুস্থতা ও আরোগ্য In the Quran, healing is attributed to Allah: “When I am ill, it is He who cures me.” It also calls the Quran itself a healing and mercy for the believers, and it encourages moderation in eating and drinking. 7 verses →" [ref=f1e260] [cursor=pointer]':
              - /url: /topics/health-healing
              - generic [ref=f1e261]: health and healing
              - generic [ref=f1e262]: সুস্থতা ও আরোগ্য
              - generic [ref=f1e263]: "In the Quran, healing is attributed to Allah: “When I am ill, it is He who cures me.” It also calls the Quran itself a healing and mercy for the believers, and it encourages moderation in eating and drinking."
              - generic [ref=f1e264]: 7 verses →
      - region [ref=f1e265]:
        - generic [ref=f1e270]:
          - heading "Faith · ঈমান ও ইবাদত" [level=2] [ref=f1e271]:
            - text: Faith
            - generic [ref=f1e272]: · ঈমান ও ইবাদত
          - paragraph [ref=f1e273]: Belief, worship and the unseen · বিশ্বাস, ইবাদত ও অদৃশ্য জগৎ
        - list [ref=f1e274]:
          - listitem [ref=f1e275]:
            - link "trust in Allah (tawakkul) আল্লাহর ওপর ভরসা (তাওয়াক্কুল) Tawakkul is to do one’s best and then rely on Allah for the result. The Quran says that whoever relies on Allah, He is enough for them, and that after resolving on a course one should put trust in Him. 8 verses →" [ref=f1e277] [cursor=pointer]:
              - /url: /topics/tawakkul
              - generic [ref=f1e278]: trust in Allah (tawakkul)
              - generic [ref=f1e279]: আল্লাহর ওপর ভরসা (তাওয়াক্কুল)
              - generic [ref=f1e280]: Tawakkul is to do one’s best and then rely on Allah for the result. The Quran says that whoever relies on Allah, He is enough for them, and that after resolving on a course one should put trust in Him.
              - generic [ref=f1e281]: 8 verses →
          - listitem [ref=f1e282]:
            - link "the mercy of Allah আল্লাহর রহমত Allah has prescribed mercy upon Himself, and His mercy encompasses all things. The Quran presents the Prophet ﷺ as a mercy to the worlds and invites even those who have transgressed to return. 8 verses →" [ref=f1e284] [cursor=pointer]:
              - /url: /topics/mercy-of-allah
              - generic [ref=f1e285]: the mercy of Allah
              - generic [ref=f1e286]: আল্লাহর রহমত
              - generic [ref=f1e287]: Allah has prescribed mercy upon Himself, and His mercy encompasses all things. The Quran presents the Prophet ﷺ as a mercy to the worlds and invites even those who have transgressed to return.
              - generic [ref=f1e288]: 8 verses →
          - listitem [ref=f1e289]:
            - 'link "prayer (salah) নামাজ (সালাত) Prayer is the pillar of worship in the Quran: a means of seeking help, remembering Allah and being restrained from wrongdoing. It is prescribed at fixed times, and those who guard it are described as successful. 8 verses →" [ref=f1e291] [cursor=pointer]':
              - /url: /topics/prayer
              - generic [ref=f1e292]: prayer (salah)
              - generic [ref=f1e293]: নামাজ (সালাত)
              - generic [ref=f1e294]: "Prayer is the pillar of worship in the Quran: a means of seeking help, remembering Allah and being restrained from wrongdoing. It is prescribed at fixed times, and those who guard it are described as successful."
              - generic [ref=f1e295]: 8 verses →
          - listitem [ref=f1e296]:
            - link "repentance (tawbah) তওবা Allah loves those who repeatedly turn back to Him. The Quran describes sincere repentance as stopping the wrong, feeling regret and returning to what is right, and promises acceptance and forgiveness. 8 verses →" [ref=f1e298] [cursor=pointer]:
              - /url: /topics/repentance
              - generic [ref=f1e299]: repentance (tawbah)
              - generic [ref=f1e300]: তওবা
              - generic [ref=f1e301]: Allah loves those who repeatedly turn back to Him. The Quran describes sincere repentance as stopping the wrong, feeling regret and returning to what is right, and promises acceptance and forgiveness.
              - generic [ref=f1e302]: 8 verses →
          - listitem [ref=f1e303]:
            - link "Paradise (Jannah) জান্নাত The Quran paints Paradise with gardens, rivers, companionship and, above all, Allah’s pleasure. It is described as a reward for the mindful and a race worth competing in, with forgiveness from the Lord. 8 verses →" [ref=f1e305] [cursor=pointer]:
              - /url: /topics/paradise
              - generic [ref=f1e306]: Paradise (Jannah)
              - generic [ref=f1e307]: জান্নাত
              - generic [ref=f1e308]: The Quran paints Paradise with gardens, rivers, companionship and, above all, Allah’s pleasure. It is described as a reward for the mindful and a race worth competing in, with forgiveness from the Lord.
              - generic [ref=f1e309]: 8 verses →
          - listitem [ref=f1e310]:
            - link "Hellfire (Jahannam) জাহান্নাম The Quran speaks of Hellfire as a sober warning, always alongside the door of repentance and mercy. Believers are told to protect themselves and their families, and they are taught a du‘a to be spared from it. 7 verses →" [ref=f1e312] [cursor=pointer]:
              - /url: /topics/hellfire
              - generic [ref=f1e313]: Hellfire (Jahannam)
              - generic [ref=f1e314]: জাহান্নাম
              - generic [ref=f1e315]: The Quran speaks of Hellfire as a sober warning, always alongside the door of repentance and mercy. Believers are told to protect themselves and their families, and they are taught a du‘a to be spared from it.
              - generic [ref=f1e316]: 7 verses →
          - listitem [ref=f1e317]:
            - link "the Day of Judgement কিয়ামত ও বিচার দিবস Belief in the Last Day is a core part of faith. The Quran describes a day of perfect justice when even an atom’s weight of good or harm is accounted for, and a day when each person stands with their own record. 9 verses →" [ref=f1e319] [cursor=pointer]:
              - /url: /topics/day-of-judgement
              - generic [ref=f1e320]: the Day of Judgement
              - generic [ref=f1e321]: কিয়ামত ও বিচার দিবস
              - generic [ref=f1e322]: Belief in the Last Day is a core part of faith. The Quran describes a day of perfect justice when even an atom’s weight of good or harm is accounted for, and a day when each person stands with their own record.
              - generic [ref=f1e323]: 9 verses →
          - listitem [ref=f1e324]:
            - link "the prophets and messengers নবী ও রাসূলগণ The Quran teaches that Allah sent messengers to every community with the same core call, and that believers make no distinction between them. Muhammad ﷺ is the final Prophet and a beautiful example. 9 verses →" [ref=f1e326] [cursor=pointer]:
              - /url: /topics/prophets
              - generic [ref=f1e327]: the prophets and messengers
              - generic [ref=f1e328]: নবী ও রাসূলগণ
              - generic [ref=f1e329]: The Quran teaches that Allah sent messengers to every community with the same core call, and that believers make no distinction between them. Muhammad ﷺ is the final Prophet and a beautiful example.
              - generic [ref=f1e330]: 9 verses →
          - listitem [ref=f1e331]:
            - link "the angels ফেরেশতা Belief in the angels is one of the articles of faith. The Quran describes them as honoured servants who obey Allah without fail, record deeds, protect, and ask forgiveness for the believers. 8 verses →" [ref=f1e333] [cursor=pointer]:
              - /url: /topics/angels
              - generic [ref=f1e334]: the angels
              - generic [ref=f1e335]: ফেরেশতা
              - generic [ref=f1e336]: Belief in the angels is one of the articles of faith. The Quran describes them as honoured servants who obey Allah without fail, record deeds, protect, and ask forgiveness for the believers.
              - generic [ref=f1e337]: 8 verses →
          - listitem [ref=f1e338]:
            - 'link "the oneness of Allah (tawhid) আল্লাহর একত্ব (তাওহীদ) Tawhid is the heart of the Quran’s message: Allah is One, the Self-Sufficient, without partner or equal. Surah al-Ikhlas, Ayat al-Kursi and the closing verses of al-Hashr describe Him with perfect names and attributes. 8 verses →" [ref=f1e340] [cursor=pointer]':
              - /url: /topics/tawhid
              - generic [ref=f1e341]: the oneness of Allah (tawhid)
              - generic [ref=f1e342]: আল্লাহর একত্ব (তাওহীদ)
              - generic [ref=f1e343]: "Tawhid is the heart of the Quran’s message: Allah is One, the Self-Sufficient, without partner or equal. Surah al-Ikhlas, Ayat al-Kursi and the closing verses of al-Hashr describe Him with perfect names and attributes."
              - generic [ref=f1e344]: 8 verses →
          - listitem [ref=f1e345]:
            - link "remembrance of Allah (dhikr) আল্লাহর স্মরণ (যিকির) In the Quran, hearts find rest in the remembrance of Allah. Believers are told to remember Him often, morning and evening, standing, sitting and lying down. 8 verses →" [ref=f1e347] [cursor=pointer]:
              - /url: /topics/dhikr
              - generic [ref=f1e348]: remembrance of Allah (dhikr)
              - generic [ref=f1e349]: আল্লাহর স্মরণ (যিকির)
              - generic [ref=f1e350]: In the Quran, hearts find rest in the remembrance of Allah. Believers are told to remember Him often, morning and evening, standing, sitting and lying down.
              - generic [ref=f1e351]: 8 verses →
          - listitem [ref=f1e352]:
            - link "fasting and Ramadan রোজা ও রমজান Fasting was prescribed so that believers may attain taqwa. The Quran was revealed in Ramadan, the month of guidance, and Allah’s nearness to those who call on Him is mentioned in the middle of the fasting verses. 7 verses →" [ref=f1e354] [cursor=pointer]:
              - /url: /topics/fasting-ramadan
              - generic [ref=f1e355]: fasting and Ramadan
              - generic [ref=f1e356]: রোজা ও রমজান
              - generic [ref=f1e357]: Fasting was prescribed so that believers may attain taqwa. The Quran was revealed in Ramadan, the month of guidance, and Allah’s nearness to those who call on Him is mentioned in the middle of the fasting verses.
              - generic [ref=f1e358]: 7 verses →
      - region [ref=f1e359]:
        - generic [ref=f1e364]:
          - heading "Society · সমাজ" [level=2] [ref=f1e365]:
            - text: Society
            - generic [ref=f1e366]: · সমাজ
          - paragraph [ref=f1e367]: Our duties towards one another · একে অপরের প্রতি আমাদের দায়িত্ব
        - list [ref=f1e368]:
          - listitem [ref=f1e369]:
            - link "women নারী The Quran addresses men and women together as moral equals before Allah, promising each the reward of their deeds. It speaks of women’s rights, dignity and standing as full partners in faith and in society. 9 verses →" [ref=f1e371] [cursor=pointer]:
              - /url: /topics/women
              - generic [ref=f1e372]: women
              - generic [ref=f1e373]: নারী
              - generic [ref=f1e374]: The Quran addresses men and women together as moral equals before Allah, promising each the reward of their deeds. It speaks of women’s rights, dignity and standing as full partners in faith and in society.
              - generic [ref=f1e375]: 9 verses →
          - listitem [ref=f1e376]:
            - link "orphans ইয়াতিম The Quran repeatedly commands kindness and fairness towards orphans and warns against taking their property. It reminds the Prophet ﷺ that Allah himself found him an orphan and gave him refuge. 8 verses →" [ref=f1e378] [cursor=pointer]:
              - /url: /topics/orphans
              - generic [ref=f1e379]: orphans
              - generic [ref=f1e380]: ইয়াতিম
              - generic [ref=f1e381]: The Quran repeatedly commands kindness and fairness towards orphans and warns against taking their property. It reminds the Prophet ﷺ that Allah himself found him an orphan and gave him refuge.
              - generic [ref=f1e382]: 8 verses →
          - listitem [ref=f1e383]:
            - link "neighbours প্রতিবেশী Verse 4:36 names the near neighbour and the distant neighbour explicitly among those to whom we owe good treatment. The surrounding verses link this with sharing, hospitality and caring for the needy. 7 verses →" [ref=f1e385] [cursor=pointer]:
              - /url: /topics/neighbours
              - generic [ref=f1e386]: neighbours
              - generic [ref=f1e387]: প্রতিবেশী
              - generic [ref=f1e388]: Verse 4:36 names the near neighbour and the distant neighbour explicitly among those to whom we owe good treatment. The surrounding verses link this with sharing, hospitality and caring for the needy.
              - generic [ref=f1e389]: 7 verses →
          - listitem [ref=f1e390]:
            - link "charity and giving দান-সদকা Spending for Allah’s sake is likened to a seed that grows into seven hundred grains. The Quran praises giving openly or secretly, urges giving from what we love, and cautions against hurting people with reminders of favours. 8 verses →" [ref=f1e392] [cursor=pointer]:
              - /url: /topics/charity
              - generic [ref=f1e393]: charity and giving
              - generic [ref=f1e394]: দান-সদকা
              - generic [ref=f1e395]: Spending for Allah’s sake is likened to a seed that grows into seven hundred grains. The Quran praises giving openly or secretly, urges giving from what we love, and cautions against hurting people with reminders of favours.
              - generic [ref=f1e396]: 8 verses →
          - listitem [ref=f1e397]:
            - link "brotherhood and unity ভ্রাতৃত্ব ও ঐক্য The believers are brothers and sisters, the Quran says, so make peace between them. It calls on people to hold firmly together, to avoid mockery and suspicion, and to know one another across tribes and nations. 7 verses →" [ref=f1e399] [cursor=pointer]:
              - /url: /topics/brotherhood-unity
              - generic [ref=f1e400]: brotherhood and unity
              - generic [ref=f1e401]: ভ্রাতৃত্ব ও ঐক্য
              - generic [ref=f1e402]: The believers are brothers and sisters, the Quran says, so make peace between them. It calls on people to hold firmly together, to avoid mockery and suspicion, and to know one another across tribes and nations.
              - generic [ref=f1e403]: 7 verses →
  - contentinfo [ref=f1e404]:
    - generic [ref=f1e405]:
      - generic [ref=f1e406]:
        - link "Noor Quran home" [ref=f1e407] [cursor=pointer]:
          - /url: /
          - generic [ref=f1e408]:
            - generic [ref=f1e409]: Noor Quran
            - generic [ref=f1e410]: نُورُ القُرْآن
        - paragraph [ref=f1e411]: Noor Quran — the Holy Quran with Arabic text, Bangla and English translation, word-by-word meaning, tajweed colours, tafsir, 20+ reciters with word-synced audio, memorisation (hifz) studio, duas, 99 names of Allah, prayer times and Qibla. Free, fast, ad-free and open source.
        - paragraph [ref=f1e412]: পবিত্র কুরআন পড়ুন, শুনুন, বুঝুন ও মুখস্থ করুন
        - paragraph [ref=f1e413]: إِنَّ هَٰذَا ٱلْقُرْءَانَ يَهْدِى لِلَّتِى هِىَ أَقْوَمُ
        - paragraph [ref=f1e414]: “Indeed, this Quran guides to that which is most suitable.” — 17:9
      - generic [ref=f1e415]:
        - heading "Popular Surahs" [level=2] [ref=f1e416]
        - generic [ref=f1e417]:
          - link "Surah Al-Fatihah" [ref=f1e418] [cursor=pointer]:
            - /url: /surah/al-fatihah
          - link "Surah Al-Baqarah" [ref=f1e419] [cursor=pointer]:
            - /url: /surah/al-baqarah
          - link "Surah Al-Kahf" [ref=f1e420] [cursor=pointer]:
            - /url: /surah/al-kahf
          - link "Surah Ya-Sin" [ref=f1e421] [cursor=pointer]:
            - /url: /surah/ya-sin
          - link "Surah Ar-Rahman" [ref=f1e422] [cursor=pointer]:
            - /url: /surah/ar-rahman
          - link "Surah Al-Waqi'ah" [ref=f1e423] [cursor=pointer]:
            - /url: /surah/al-waqiah
          - link "Surah Al-Mulk" [ref=f1e424] [cursor=pointer]:
            - /url: /surah/al-mulk
          - link "Surah An-Naba" [ref=f1e425] [cursor=pointer]:
            - /url: /surah/an-naba
          - link "Surah Al-Ikhlas" [ref=f1e426] [cursor=pointer]:
            - /url: /surah/al-ikhlas
          - link "Surah Al-Falaq" [ref=f1e427] [cursor=pointer]:
            - /url: /surah/al-falaq
          - link "Surah An-Nas" [ref=f1e428] [cursor=pointer]:
            - /url: /surah/an-nas
          - link "Surah As-Sajdah" [ref=f1e429] [cursor=pointer]:
            - /url: /surah/as-sajdah
      - generic [ref=f1e430]:
        - heading "Popular" [level=2] [ref=f1e431]
        - generic [ref=f1e432]:
          - link "Ayatul Kursi (2:255)" [ref=f1e433] [cursor=pointer]:
            - /url: /surah/al-baqarah/255
          - link "Last two ayahs of Al-Baqarah" [ref=f1e434] [cursor=pointer]:
            - /url: /surah/al-baqarah/285
          - link "99 Names of Allah" [ref=f1e435] [cursor=pointer]:
            - /url: /names-of-allah
          - link "Daily Duas from Quran & Sunnah" [ref=f1e436] [cursor=pointer]:
            - /url: /dua
          - link "What the Quran says about…" [ref=f1e437] [cursor=pointer]:
            - /url: /topics
          - link "Memorise the Quran (Hifz)" [ref=f1e438] [cursor=pointer]:
            - /url: /hifz
          - link "Juz Amma (Para 30)" [ref=f1e439] [cursor=pointer]:
            - /url: /juz/30
          - link "Prayer times today" [ref=f1e440] [cursor=pointer]:
            - /url: /prayer-times
      - generic [ref=f1e441]:
        - heading "বাংলায় পড়ুন" [level=2] [ref=f1e442]
        - generic [ref=f1e443]:
          - link "আয়াতুল কুরসি বাংলা অর্থসহ" [ref=f1e444] [cursor=pointer]:
            - /url: /surah/al-baqarah/255
          - link "সূরা ইয়াসিন বাংলা উচ্চারণ ও অর্থ" [ref=f1e445] [cursor=pointer]:
            - /url: /surah/ya-sin
          - link "সূরা মুলক বাংলা অর্থসহ" [ref=f1e446] [cursor=pointer]:
            - /url: /surah/al-mulk
          - link "ঘুমানোর দোয়া" [ref=f1e447] [cursor=pointer]:
            - /url: /bn/dua/dua-before-sleeping
          - link "আল্লাহর ৯৯ নাম অর্থসহ" [ref=f1e448] [cursor=pointer]:
            - /url: /bn/names-of-allah
          - link "দৈনন্দিন দোয়া" [ref=f1e449] [cursor=pointer]:
            - /url: /bn/dua
          - link "দুশ্চিন্তা দূর করার আয়াত" [ref=f1e450] [cursor=pointer]:
            - /url: /bn/topics/anxiety
      - generic [ref=f1e451]:
        - heading "Noor" [level=2] [ref=f1e452]
        - generic [ref=f1e453]:
          - link "All 114 Surahs" [ref=f1e454] [cursor=pointer]:
            - /url: /quran
          - link "Quran Recitation" [ref=f1e455] [cursor=pointer]:
            - /url: /listen
          - link "Khatam Planner" [ref=f1e456] [cursor=pointer]:
            - /url: /journey
          - link "About & Sources" [ref=f1e457] [cursor=pointer]:
            - /url: /about
          - link "Open source on GitHub" [ref=f1e458] [cursor=pointer]:
            - /url: https://github.com/maremon7415/holy_quran
    - generic [ref=f1e459]:
      - paragraph [ref=f1e460]: Quran text, translations & audio via the open Quran.com (Quran Foundation) API · Free forever, no ads.
      - paragraph [ref=f1e461]: © 2026 Noor Quran
  - region "Notifications alt+T"
  - alert [ref=f1e462]
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
     |                                                                                                                                                       ^ Error: NEW serious/critical a11y violations on /topics. Fix them, or (only if unfixable now) add to tests/e2e/a11y-known-issues.json
  37 | 
  38 |       const fixed = Object.keys(allowed).filter((id) => !found.some((v) => v.id === id))
  39 |       expect(fixed, `a11y-known-issues.json lists rules that no longer occur on ${key}; remove them`).toEqual([])
  40 |     })
  41 |   }
  42 | }
  43 | 
```