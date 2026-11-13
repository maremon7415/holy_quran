'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Bell, BellOff, CalendarPlus, Volume2, Info } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { BEFORE_OPTIONS, usePrayerPrefs, type ReminderSound } from '@/lib/stores/prayer'
import { useLang, useTx } from '@/lib/lang'
import { REMINDER_KEYS, REMINDER_NAMES, type ReminderKey } from '@/lib/prayer/times'
import { useReminderStatus } from '@/lib/prayer/status'
import { isNotificationSupported, showPrayerNotification } from '@/lib/prayer/notify'
import { playReminderSound } from '@/lib/prayer/sound'
import { buildPrayerIcs, downloadIcs } from '@/lib/prayer/ics'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

const sel = 'h-9 rounded-xl border bg-background px-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 disabled:opacity-40'

export function RemindersCard() {
  const t = useTx()
  const lang = useLang()
  /** notification text / .ics are generated in the UI language */
  const nLang = lang
  const reminders = usePrayerPrefs((s) => s.reminders)
  const setReminder = usePrayerPrefs((s) => s.setReminder)
  const setAll = usePrayerPrefs((s) => s.setAllReminders)
  const madhab = usePrayerPrefs((s) => s.madhab)
  const tz = usePrayerPrefs((s) => s.tz)
  const location = useAppStore((s) => s.location)
  const method = useAppStore((s) => s.prayerMethod)
  const st = useReminderStatus()
  const [busy, setBusy] = useState(false)
  const anyOn = REMINDER_KEYS.some((k) => reminders[k].on)
  const fmtNum = (s: string) => (lang === 'bn' ? s.replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[+d]) : s)

  const ask = async () => {
    if (!isNotificationSupported()) return 'unsupported' as const
    if (Notification.permission === 'default') {
      const p = await Notification.requestPermission()
      useReminderStatus.getState().set({ permission: p })
      return p
    }
    return Notification.permission
  }
  const toggle = async (k: ReminderKey, on: boolean) => {
    setReminder(k, { on })
    if (on && st.permission === 'default') {
      const p = await ask()
      if (p === 'denied') toast.info(t({ en: 'Notifications are blocked — you’ll still get in-app reminders while Noor is open.', bn: 'নোটিফিকেশন বন্ধ — Noor খোলা থাকলে অ্যাপের ভেতরে রিমাইন্ডার পাবেন।', ar: 'الإشعارات محظورة — ستصلك التذكيرات داخل التطبيق ما دام نور مفتوحًا.' }))
    }
  }
  const enableFive = async () => {
    setAll({ on: false })
    for (const k of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const) setReminder(k, { on: true })
    await ask()
  }
  const test = async () => {
    setBusy(true)
    const p = await ask()
    const title = t({ en: 'Test reminder — Asr in 10 min', bn: 'পরীক্ষামূলক রিমাইন্ডার — ১০ মিনিট পর আসর', ar: 'تذكير تجريبي — العصر بعد ١٠ دقائق' })
    const body = t({ en: 'Noor Quran will remind you like this.', bn: 'নূর কুরআন এভাবেই আপনাকে মনে করিয়ে দেবে।', ar: 'سيذكّرك نور القرآن بهذا الشكل.' })
    const first = REMINDER_KEYS.find((k) => reminders[k].on)
    const sound: ReminderSound = first ? reminders[first].sound : 'chime'
    const how = await showPrayerNotification({ title, body, tag: 'noor-test', lang: nLang, silent: sound === 'silent', test: true })
    const played = await playReminderSound(sound === 'silent' ? 'silent' : sound)
    toast(title, { description: how === 'denied' || how === 'unsupported' ? t({ en: 'System notification unavailable — shown in-app only.', bn: 'সিস্টেম নোটিফিকেশন নেই — শুধু অ্যাপে দেখানো হলো।', ar: 'إشعار النظام غير متاح — يظهر داخل التطبيق فقط.' }) : played || sound === 'silent' ? body : t({ en: 'Sent. Tap the page once to allow sound.', bn: 'পাঠানো হয়েছে। শব্দের জন্য পেজে একবার ট্যাপ করুন।', ar: 'تم الإرسال. اضغط على الصفحة مرة للسماح بالصوت.' }) })
    void p
    setBusy(false)
  }
  const calendar = () => {
    if (location.latitude === null || location.longitude === null) return
    const text = buildPrayerIcs({ lat: location.latitude, lon: location.longitude, method, madhab, tz, city: location.city, reminders, days: 30, lang: nLang })
    downloadIcs(text, `noor-prayer-times-${new Date().toISOString().slice(0, 10)}.ics`)
    toast.success(t({ en: 'Calendar file ready — open it to add 30 days of prayer times with alarms.', bn: 'ক্যালেন্ডার ফাইল তৈরি — খুলে ৩০ দিনের নামাজের সময় ও অ্যালার্ম যোগ করুন।', ar: 'ملف التقويم جاهز — افتحه لإضافة مواقيت ٣٠ يومًا مع التنبيهات.' }))
  }

  // which mode is active
  let mode: { tone: 'ok' | 'warn' | 'off'; title: string; text: string }
  if (st.permission === 'unsupported') mode = { tone: 'warn', title: t({ en: 'Notifications unavailable', bn: 'নোটিফিকেশন নেই', ar: 'الإشعارات غير متاحة' }), text: t({ en: 'This browser can’t show web notifications. Use the calendar option below — it works on every phone.', bn: 'এই ব্রাউজারে ওয়েব নোটিফিকেশন চলে না। নিচের ক্যালেন্ডার অপশন সব ফোনে কাজ করে।', ar: 'لا يدعم هذا المتصفح إشعارات الويب. استخدم خيار التقويم أدناه — يعمل على كل الهواتف.' }) }
  else if (st.ios && !st.standalone) mode = { tone: 'warn', title: t({ en: 'Install to get notifications on iPhone', bn: 'আইফোনে নোটিফিকেশনের জন্য ইনস্টল করুন', ar: 'ثبّت التطبيق لتلقي الإشعارات على iPhone' }), text: t({ en: 'iOS only shows web notifications for installed apps (iOS 16.4+): Share → Add to Home Screen, then open Noor from the Home Screen and enable reminders. Until then, use the calendar option.', bn: 'iOS শুধু ইনস্টল করা অ্যাপে ওয়েব নোটিফিকেশন দেখায় (iOS 16.4+): Share → Add to Home Screen করে হোম স্ক্রিন থেকে খুলুন। ততক্ষণ ক্যালেন্ডার অপশন ব্যবহার করুন।', ar: 'لا يعرض iOS إشعارات الويب إلا للتطبيقات المثبّتة (iOS 16.4+): مشاركة ← إضافة إلى الشاشة الرئيسية، ثم افتح نور منها وفعّل التذكيرات. وإلى ذلك الحين استخدم خيار التقويم.' }) }
  else if (st.permission === 'denied') mode = { tone: 'warn', title: t({ en: 'Notifications are blocked', bn: 'নোটিফিকেশন ব্লক করা', ar: 'الإشعارات محظورة' }), text: t({ en: 'Allow notifications for this site in your browser settings. Meanwhile you get in-app reminders while Noor is open, and you can use the calendar option.', bn: 'ব্রাউজার সেটিংসে এই সাইটের নোটিফিকেশন চালু করুন। ততক্ষণ Noor খোলা থাকলে অ্যাপে রিমাইন্ডার পাবেন; ক্যালেন্ডারও ব্যবহার করতে পারেন।', ar: 'اسمح بإشعارات هذا الموقع من إعدادات المتصفح. وحتى ذلك الحين تصلك التذكيرات داخل التطبيق ما دام نور مفتوحًا، ويمكنك استخدام خيار التقويم.' }) }
  else if (st.permission === 'default') mode = { tone: 'off', title: t({ en: 'Notifications are off', bn: 'নোটিফিকেশন বন্ধ', ar: 'الإشعارات متوقفة' }), text: t({ en: 'Allow notifications to be reminded even when Noor is in a background tab.', bn: 'Noor ব্যাকগ্রাউন্ড ট্যাবে থাকলেও রিমাইন্ডার পেতে নোটিফিকেশন চালু করুন।', ar: 'اسمح بالإشعارات لتصلك التذكيرات حتى لو كان نور في علامة تبويب خلفية.' }) }
  else
    mode = {
      tone: 'ok',
      title: t({ en: 'Reminders active while Noor is open', bn: 'Noor খোলা থাকলে রিমাইন্ডার চালু', ar: 'التذكيرات تعمل ما دام نور مفتوحًا' }),
      text:
        st.periodic === 'active'
          ? t({ en: 'Background checks (periodic sync) are also on, so installed-app reminders can arrive even when Noor is closed — the browser decides how often, so exact timing isn’t guaranteed. For guaranteed alarms add the calendar.', bn: 'ব্যাকগ্রাউন্ড চেকও (পিরিয়ডিক সিঙ্ক) চালু — ইনস্টল করা অ্যাপে Noor বন্ধ থাকলেও রিমাইন্ডার আসতে পারে, তবে সময় ব্রাউজার ঠিক করে। নিশ্চিত অ্যালার্মের জন্য ক্যালেন্ডার যোগ করুন।', ar: 'الفحص في الخلفية مفعّل أيضًا، فقد تصل تذكيرات التطبيق المثبّت حتى عند إغلاق نور — لكن المتصفح يحدد التوقيت، فالدقة غير مضمونة. للتنبيهات المضمونة أضف التقويم.' })
          : t({ en: 'Exact timers run while any Noor tab is open (even in the background). Phones and browsers can’t wake a closed web app on their own, so for guaranteed alarms add the calendar below.', bn: 'যেকোনো Noor ট্যাব খোলা থাকলে (ব্যাকগ্রাউন্ডেও) সঠিক সময়ে রিমাইন্ডার আসবে। বন্ধ ওয়েব অ্যাপকে ফোন নিজে জাগাতে পারে না — নিশ্চিত অ্যালার্মের জন্য নিচের ক্যালেন্ডার যোগ করুন।', ar: 'تعمل المؤقتات الدقيقة ما دامت أي علامة تبويب لنور مفتوحة (ولو في الخلفية). لا تستطيع الهواتف والمتصفحات إيقاظ تطبيق ويب مغلق، فللتنبيهات المضمونة أضف التقويم أدناه.' }),
    }

  const nextText = st.next ? `${REMINDER_NAMES[st.next.key][lang]} · ${fmtNum(new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : lang === 'ar' ? 'ar' : 'en-US', { timeZone: tz ?? undefined, weekday: 'short', hour: 'numeric', minute: '2-digit' }).format(st.next.fireAt))}` : null

  return (
    <section className="card-soft mt-5 rounded-3xl p-4 sm:p-6" aria-labelledby="reminders-h">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gold-soft text-gold">{anyOn ? <Bell className="size-5" /> : <BellOff className="size-5" />}</span>
        <div className="min-w-0">
          <h2 id="reminders-h" className="font-display text-lg font-semibold">{t({ en: 'Reminders', bn: 'রিমাইন্ডার', ar: 'التذكيرات' })}</h2>
          <p className="text-sm text-muted-foreground">{t({ en: 'Get a nudge before each prayer.', bn: 'প্রতি নামাজের আগে মনে করিয়ে দেবে।', ar: 'تذكير لطيف قبل كل صلاة.' })}</p>
        </div>
      </div>

      <div className={cn('mt-4 rounded-2xl border p-3.5 text-sm', mode.tone === 'ok' ? 'border-primary/30 bg-accent' : mode.tone === 'warn' ? 'border-gold/40 bg-gold-soft' : 'bg-surface-2')}>
        <p className="flex items-center gap-2 font-semibold"><Info className="size-4 shrink-0 text-primary" />{mode.title}</p>
        <p className="mt-1 text-muted-foreground">{mode.text}</p>
        {st.permission === 'default' && !(st.ios && !st.standalone) && (
          <button onClick={() => void ask()} className="mt-3 h-9 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground">{t({ en: 'Enable notifications', bn: 'নোটিফিকেশন চালু করুন', ar: 'تفعيل الإشعارات' })}</button>
        )}
        {nextText && <p className="mt-2 text-xs"><span className="font-semibold">{t({ en: 'Next reminder:', bn: 'পরবর্তী রিমাইন্ডার:', ar: 'التذكير القادم:' })}</span> {nextText}</p>}
      </div>

      <div className="mt-4 divide-y">
        {REMINDER_KEYS.map((k) => {
          const c = reminders[k]
          const n = REMINDER_NAMES[k]
          return (
            <div key={k} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
              <Switch checked={c.on} onCheckedChange={(v) => void toggle(k, v)} aria-label={t({ en: `${n.en} reminder`, bn: `${n.bn} রিমাইন্ডার`, ar: `تذكير ${n.ar}` })} />
              <span className="min-w-[6.5rem] flex-1 text-sm font-semibold">{n[lang]}{k === 'tahajjud' && <span className="block text-xs font-normal text-muted-foreground">{t({ en: 'last third of night', bn: 'রাতের শেষ তৃতীয়াংশ', ar: 'الثلث الأخير من الليل' })}</span>}{k === 'jumuah' && <span className="block text-xs font-normal text-muted-foreground">{t({ en: 'replaces Dhuhr on Friday', bn: 'শুক্রবার যোহরের বদলে', ar: 'بدل الظهر يوم الجمعة' })}</span>}</span>
              <select aria-label={t({ en: 'Minutes before', bn: 'কত মিনিট আগে', ar: 'قبل بدقائق' })} disabled={!c.on} value={c.before} onChange={(e) => setReminder(k, { before: +e.target.value })} className={sel}>
                {BEFORE_OPTIONS.map((b) => <option key={b} value={b}>{b === 0 ? t({ en: 'At time', bn: 'ঠিক সময়ে', ar: 'عند الوقت' }) : t({ en: `${b} min before`, bn: `${fmtNum(String(b))} মিনিট আগে`, ar: `قبل ${b} دقيقة` })}</option>)}
              </select>
              <select aria-label={t({ en: 'Sound', bn: 'শব্দ', ar: 'الصوت' })} disabled={!c.on} value={c.sound} onChange={(e) => { const s = e.target.value as ReminderSound; setReminder(k, { sound: s }); void playReminderSound(s) }} className={sel}>
                <option value="azan">{t({ en: 'Call tone', bn: 'আযান-টোন', ar: 'نغمة النداء' })}</option>
                <option value="chime">{t({ en: 'Soft chime', bn: 'নরম চাইম', ar: 'رنين هادئ' })}</option>
                <option value="silent">{t({ en: 'Silent', bn: 'নীরব', ar: 'صامت' })}</option>
              </select>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground"><Volume2 className="me-1 inline size-3.5" />{t({ en: 'In-app sounds are synthesised (no recorded adhan is bundled). System notifications use your device’s notification sound.', bn: 'অ্যাপের শব্দ কৃত্রিমভাবে তৈরি (রেকর্ড করা আযান নেই)। সিস্টেম নোটিফিকেশনে ডিভাইসের নিজস্ব শব্দ বাজে।', ar: 'أصوات التطبيق مُركّبة (لا يتضمن أذانًا مسجلًا). تستخدم إشعارات النظام صوت إشعارات جهازك.' })}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => void enableFive()} className="h-10 rounded-full border px-4 text-sm font-semibold transition hover:border-primary/40">{t({ en: 'Remind me for all 5 prayers', bn: '৫ ওয়াক্তের রিমাইন্ডার চালু করুন', ar: 'ذكّرني بالصلوات الخمس' })}</button>
        <button onClick={() => void test()} disabled={busy} className="h-10 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60">{t({ en: 'Send test notification', bn: 'টেস্ট নোটিফিকেশন', ar: 'إرسال إشعار تجريبي' })}</button>
      </div>

      <div className="mt-5 rounded-2xl bg-surface-2 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold"><CalendarPlus className="size-4 text-primary" />{t({ en: 'Add prayer times to my calendar', bn: 'নামাজের সময় আমার ক্যালেন্ডারে যোগ করুন', ar: 'أضف مواقيت الصلاة إلى تقويمي' })}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t({ en: 'The most reliable option on every phone: your calendar app rings even when Noor is closed. Downloads an .ics with the next 30 days (with an alarm for each prayer, using your “minutes before” setting) for this location and method. Re-download monthly.', bn: 'সব ফোনে সবচেয়ে নির্ভরযোগ্য: Noor বন্ধ থাকলেও ক্যালেন্ডার অ্যাপ বাজবে। এই অবস্থান ও পদ্ধতির জন্য পরবর্তী ৩০ দিনের .ics ফাইল (প্রতি ওয়াক্তে অ্যালার্মসহ) নামবে। প্রতি মাসে আবার নামান।', ar: 'الخيار الأوثق على كل الهواتف: يرنّ تطبيق التقويم حتى عند إغلاق نور. ينزّل ملف ‎.ics‎ لـ٣٠ يومًا قادمة (مع تنبيه لكل صلاة حسب إعداد «قبل بدقائق») لهذا الموقع والطريقة. أعد التنزيل شهريًا.' })}</p>
        <button onClick={calendar} className="mt-3 h-10 rounded-full border bg-card px-4 text-sm font-semibold transition hover:border-primary/40">{t({ en: 'Download calendar (.ics)', bn: 'ক্যালেন্ডার ডাউনলোড (.ics)', ar: 'تنزيل التقويم (.ics)' })}</button>
      </div>
    </section>
  )
}
