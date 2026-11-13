/**
 * Pre-paint script: sets <html lang|dir|data-lang> and the `lang-ar` class before first paint.
 * /bn/* always renders Bangla; elsewhere the persisted UI language (quran-store) wins.
 * Runs after the reader prefs script in app/layout.tsx so it has the final say on `lang`.
 */
export const localeScript = `(function(){try{var d=document.documentElement,p=location.pathname,l;if(p==='/bn'||p.indexOf('/bn/')===0)l='bn';else{var a=JSON.parse(localStorage.getItem('quran-store')||'{}').state||{};l=a.language==='bn'||a.language==='ar'?a.language:'en'}d.lang=l;d.dataset.lang=l;d.dir=l==='ar'?'rtl':'ltr';if(l==='ar')d.classList.add('lang-ar')}catch(e){}})();`

/** Apply a UI language to <html> at runtime (toggle / navigation). */
export function applyHtmlLang(lang: string) {
  const d = document.documentElement
  d.lang = lang
  d.dataset.lang = lang
  d.dir = lang === 'ar' ? 'rtl' : 'ltr'
  d.classList.toggle('lang-ar', lang === 'ar')
}
