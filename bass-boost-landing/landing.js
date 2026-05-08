const SITE_STRINGS = {
  en: {
    navFeatures:'Features', navHow:'How it works', navSupport:'Support', navCta:'Add to Chrome — Free',
    heroBadge:'🎧 Chrome Extension · Free',
    heroH1a:'Hear every song', heroH1b:'the way it ', heroH1c:'should sound',
    heroSub:'Bass boost, 10-band EQ, Fidelity engine and Night Mode — for YouTube, Spotify, Netflix and any site in Chrome.',
    heroCta:'⬇ Add to Chrome — free', heroSecondary:'Support the project ☕',
    featEyebrow:'Features', featTitle:'Everything your ears deserve', featSub:'Real Web Audio API processing — not just a volume slider.',
    f1h:'Bass Boost', f1p:'4-stage filter stack targeting sub-bass (30Hz), punch (55Hz), body (90Hz) and upper-bass (180Hz) for real, defined low end — not just mud.',
    f2h:'10-Band Equalizer', f2p:'Full EQ from 32Hz to 16kHz with 6 presets — Bass+, Treble+, Vocal, Club, Rock and Flat. Your perfect sound in seconds.',
    f3h:'Fidelity Engine', f3p:"Dynamically measures weak frequency bands every 150ms and boosts them in real time — restoring the original recording's tonal balance.",
    f4h:'Night Mode', f4p:'Dynamic range compression tames loud explosions while keeping quiet dialogue clearly audible. Perfect for late-night watching.',
    f5h:'Live Visualizer', f5p:'Real-time frequency spectrum from the Web Audio API analyser — not a fake animation. See the actual music playing.',
    f6h:'Loudness & Volume', f6p:'Boost output up to 150% and add loudness gain. Works on any tab — YouTube, Spotify, Netflix, Twitch, anything.',
    free:'Free',
    howEyebrow:'How it works', howTitle:'Set up in under a minute',
    s1h:'Install', s1p:'Add Bass Boost from the Chrome Web Store — free, no account needed.',
    s2h:'Enable', s2p:'Open YouTube, click the extension icon, toggle the engine on.',
    s3h:'Tune', s3p:'Drag the bass slider, pick an EQ preset, enable fidelity — hear the difference immediately.',
    s4h:'Enjoy', s4p:'Settings save automatically. Your sound, everywhere.',
    priceEyebrow:'Support', priceTitle:'Free forever, Pro for supporters', priceSub:'No subscription. Donate once on Saweria — get lifetime Pro access instantly.',
    freeLabel:'Free', forever:'/ forever', anyAmount:'Any amount', lifetime:'/ lifetime', proLabel:'👑 Pro',
    fl1:'Bass Boost (up to +8dB)', fl2:'Volume up to 150%', fl3:'Night Mode', fl4:'Live Visualizer',
    fl5:'10-Band EQ', fl6:'Fidelity Engine', fl7:'Full Bass Boost (+20dB)',
    pl1:'Everything in Free', pl2:'Full Bass Boost (up to +20dB)', pl3:'10-Band EQ + 6 Presets',
    pl4:'Fidelity Engine', pl5:'Lifetime key — no expiry', pl6:'Activated instantly via your generated code',
    installBtn:'Add to Chrome', donateBtn:'☕ Donate via Saweria',
    donateNote:'Generate your code in the extension, then paste it in the Saweria message field. Pro activates automatically.',
    faqEyebrow:'FAQ', faqTitle:'Common questions',
    q1:'Does it work on YouTube and Spotify?', a1:'Yes — it works on any site that plays audio through HTML5 media. YouTube, Spotify Web, Netflix, Twitch, SoundCloud and more.',
    q2:'How does the Saweria Pro unlock work?', a2:'Open the extension and generate your unique code first. Then donate any amount on Saweria and paste that code in the message/note field. The server will activate your Pro automatically.',
    q3:'Is there a free trial?', a3:'Yes — open the extension, scroll to Support & Unlock Pro, expand it and enter your email under the free trial section. You get a 3-day full Pro trial with no payment needed.',
    q4:'Will it keep working after I close the popup?', a4:"Yes. The audio processing runs inside the page via an injected Web Audio context. Closing the popup doesn't stop it — it continues until you close or navigate the tab.",
    q5:"I donated but it didn't activate. What do I do?", a5:'Send your generated code and a screenshot of your donation to dzulfanDev on Saweria — your Pro will be activated manually.',
    footerNote:'Chrome Extension · Free',
  },
  id: {
    navFeatures:'Fitur', navHow:'Cara kerja', navSupport:'Dukung', navCta:'Tambah ke Chrome — Gratis',
    heroBadge:'🎧 Ekstensi Chrome · Gratis',
    heroH1a:'Dengar setiap lagu', heroH1b:'sesuai ', heroH1c:'seharusnya',
    heroSub:'Bass boost, EQ 10-band, Fidelity engine dan Mode Malam — untuk YouTube, Spotify, Netflix dan situs apapun di Chrome.',
    heroCta:'⬇ Tambah ke Chrome — gratis', heroSecondary:'Dukung proyek ini ☕',
    featEyebrow:'Fitur', featTitle:'Semua yang telingamu butuhkan', featSub:'Pemrosesan Web Audio API nyata — bukan sekadar pengatur volume.',
    f1h:'Bass Boost', f1p:'Filter 4 tahap menargetkan sub-bass (30Hz), pukulan (55Hz), tubuh (90Hz) dan upper-bass (180Hz) untuk bass yang nyata dan terdefinisi.',
    f2h:'Equalizer 10-Band', f2p:'EQ lengkap dari 32Hz hingga 16kHz dengan 6 preset — Bass+, Treble+, Vokal, Club, Rock dan Flat.',
    f3h:'Fidelity Engine', f3p:'Mengukur band frekuensi lemah setiap 150ms dan meningkatkannya secara real time — memulihkan keseimbangan tonal rekaman asli.',
    f4h:'Mode Malam', f4p:'Kompresi dinamis meredam ledakan keras sambil menjaga dialog tenang tetap jelas. Sempurna untuk menonton larut malam.',
    f5h:'Visualizer Langsung', f5p:'Spektrum frekuensi real-time dari analyser Web Audio API — bukan animasi palsu. Lihat musik yang sebenarnya diputar.',
    f6h:'Kenyaringan & Volume', f6p:'Tingkatkan output hingga 150% dan tambahkan gain kenyaringan. Bekerja di tab apapun — YouTube, Spotify, Netflix, Twitch.',
    free:'Gratis',
    howEyebrow:'Cara kerja', howTitle:'Siap dalam kurang dari semenit',
    s1h:'Pasang', s1p:'Tambahkan Bass Boost dari Chrome Web Store — gratis, tanpa akun.',
    s2h:'Aktifkan', s2p:'Buka YouTube, klik ikon ekstensi, aktifkan mesinnya.',
    s3h:'Setel', s3p:'Geser slider bass, pilih preset EQ, aktifkan fidelity — langsung terasa bedanya.',
    s4h:'Nikmati', s4p:'Pengaturan tersimpan otomatis. Suaramu, di mana saja.',
    priceEyebrow:'Dukung', priceTitle:'Gratis selamanya, Pro untuk pendukung', priceSub:'Tanpa langganan. Donasi sekali di Saweria — dapatkan akses Pro seumur hidup.',
    freeLabel:'Gratis', forever:'/ selamanya', anyAmount:'Berapa saja', lifetime:'/ seumur hidup', proLabel:'👑 Pro',
    fl1:'Bass Boost (hingga +8dB)', fl2:'Volume hingga 150%', fl3:'Mode Malam', fl4:'Visualizer Langsung',
    fl5:'EQ 10-Band', fl6:'Fidelity Engine', fl7:'Full Bass Boost (+20dB)',
    pl1:'Semua fitur Gratis', pl2:'Full Bass Boost (hingga +20dB)', pl3:'EQ 10-Band + 6 Preset',
    pl4:'Fidelity Engine', pl5:'Kunci seumur hidup — tidak kedaluwarsa', pl6:'Diaktifkan instan via code yang kamu generate',
    installBtn:'Tambah ke Chrome', donateBtn:'☕ Donasi via Saweria',
    donateNote:'Generate code-mu di ekstensi, lalu tempelkan di kolom pesan Saweria. Pro aktif secara otomatis.',
    faqEyebrow:'FAQ', faqTitle:'Pertanyaan umum',
    q1:'Apakah berfungsi di YouTube dan Spotify?', a1:'Ya — berfungsi di situs apapun yang memutar audio melalui HTML5. YouTube, Spotify Web, Netflix, Twitch, SoundCloud dan lainnya.',
    q2:'Bagaimana cara unlock Pro via Saweria?', a2:'Buka ekstensi dan generate code unikmu terlebih dahulu. Lalu donasi berapa saja di Saweria dan tempelkan code tersebut di kolom pesan. Server akan mengaktifkan Pro-mu secara otomatis.',
    q3:'Apakah ada uji coba gratis?', a3:'Ya — buka ekstensi, scroll ke Dukung & Buka Pro, perluas dan masukkan emailmu di bagian uji coba gratis. Kamu mendapat 3 hari Pro penuh tanpa pembayaran.',
    q4:'Apakah tetap berfungsi setelah popup ditutup?', a4:'Ya. Pemrosesan audio berjalan di dalam halaman via konteks Web Audio yang disuntikkan. Menutup popup tidak menghentikannya — terus berjalan hingga tab ditutup.',
    q5:'Sudah donasi tapi belum aktif. Apa yang harus dilakukan?', a5:'Kirimkan code yang sudah kamu generate dan capture donasi ke dzulfanDev di Saweria — Pro-mu akan diaktifkan secara manual.',
    footerNote:'Ekstensi Chrome · Gratis',
  },
};

let siteCurLang = localStorage.getItem('bassboost-lang') || (navigator.language.startsWith('id') ? 'id' : 'en');

function siteLang(l) {
  siteCurLang = l;
  localStorage.setItem('bassboost-lang', l);
  const s = SITE_STRINGS[l];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (s[key] !== undefined) el.textContent = s[key];
  });
  document.getElementById('siteEN').classList.toggle('active', l === 'en');
  document.getElementById('siteID').classList.toggle('active', l === 'id');
  document.documentElement.lang = l;
}

function tFaq(el) {
  const item = el.closest('.fi');
  const open = item.classList.contains('open');
  document.querySelectorAll('.fi').forEach(i => i.classList.remove('open'));
  if (!open) item.classList.add('open');
}

// Apply language on load
siteLang(siteCurLang);

// Lang switcher
document.getElementById('siteEN').addEventListener('click', () => siteLang('en'));
document.getElementById('siteID').addEventListener('click', () => siteLang('id'));

// FAQ accordion
document.querySelectorAll('.fq').forEach(btn => {
  btn.addEventListener('click', () => tFaq(btn));
});
