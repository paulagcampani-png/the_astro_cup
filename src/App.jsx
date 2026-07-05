import { useState, useMemo, useEffect } from "react";

// ── The Astro Cup · constants of the sky, July 5–19 2026 (real ephemeris) ──
// Sun ♋ Cancer, Mars ♊ Gemini, Jupiter ♌ Leo, Saturn ♈ Aries all window long.

const TEAMS = [
  { id: "eng", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", founded: "26.10.1863", sign: "Scorpio", glyph: "♏", element: "water", lp: 9, master: false },
  { id: "bra", name: "Brazil", flag: "🇧🇷", founded: "08.06.1914", sign: "Gemini", glyph: "♊", element: "air", lp: 11, master: true },
  { id: "arg", name: "Argentina", flag: "🇦🇷", founded: "21.02.1893", sign: "Pisces", glyph: "♓", element: "water", lp: 8, master: false },
  { id: "bel", name: "Belgium", flag: "🇧🇪", founded: "01.09.1895", sign: "Virgo", glyph: "♍", element: "earth", lp: 33, master: true },
  { id: "esp", name: "Spain", flag: "🇪🇸", founded: "29.09.1913", sign: "Libra", glyph: "♎", element: "air", lp: 7, master: false },
  { id: "egy", name: "Egypt", flag: "🇪🇬", founded: "03.12.1921", sign: "Sagittarius", glyph: "♐", element: "fire", lp: 1, master: false },
  { id: "mex", name: "Mexico", flag: "🇲🇽", founded: "23.08.1927", sign: "Virgo", glyph: "♍", element: "earth", lp: 5, master: false },
  { id: "nor", name: "Norway", flag: "🇳🇴", founded: "30.04.1902", sign: "Taurus", glyph: "♉", element: "earth", lp: 1, master: false },
  { id: "por", name: "Portugal", flag: "🇵🇹", founded: "31.03.1914", sign: "Aries", glyph: "♈", element: "fire", lp: 22, master: true },
  { id: "fra", name: "France", flag: "🇫🇷", founded: "07.04.1919", sign: "Aries", glyph: "♈", element: "fire", lp: 4, master: false },
  { id: "usa", name: "USA", flag: "🇺🇸", founded: "05.04.1913", sign: "Aries", glyph: "♈", element: "fire", lp: 5, master: false },
  { id: "sui", name: "Switzerland", flag: "🇨🇭", founded: "07.04.1895", sign: "Aries", glyph: "♈", element: "fire", lp: 7, master: false },
  { id: "mar", name: "Morocco", flag: "🇲🇦", founded: "1955", sign: null, glyph: "🌑", element: "mystery", lp: 2, master: false },
  { id: "col", name: "Colombia", flag: "🇨🇴", founded: "1924", sign: null, glyph: "🌑", element: "mystery", lp: 7, master: false },
];
const ALL = TEAMS.map((t) => t.id);
const FAVES = ["eng", "bra", "arg"]; // marked gold in Title odds

const DAYS = {
  "0705": { day: 5, moon: "Pisces", moonEl: "water", pct: 69, ph: "waning", num: 22, note: "n05" },
  "0706": { day: 6, moon: "Aries", moonEl: "fire", pct: 59, ph: "waning", num: 5, note: "n06" },
  "0707": { day: 7, moon: "Aries", moonEl: "fire", pct: 49, ph: "waning", num: 6, note: "n07" },
  "0709": { day: 9, moon: "Taurus", moonEl: "earth", pct: 27, ph: "waning", num: 8, note: null },
  "0710": { day: 10, moon: "Taurus", moonEl: "earth", pct: 17, ph: "waning", num: 9, note: "n10" },
  "0711": { day: 11, moon: "Gemini", moonEl: "air", pct: 9, ph: "dark", num: 1, note: "n11" },
  "0714": { day: 14, moon: "Cancer", moonEl: "water", pct: 0, ph: "new", num: 22, note: "n14" },
  "0715": { day: 15, moon: "Leo", moonEl: "fire", pct: 4, ph: "waxing", num: 5, note: "n15" },
  "0718": { day: 18, moon: "Virgo", moonEl: "earth", pct: 25, ph: "waxing", num: 8, note: null },
  "0719": { day: 19, moon: "Libra", moonEl: "air", pct: 35, ph: "waxing", num: 9, note: "n19" },
};

const FIXTURES = [
  { dayId: "0705", round: "r16", games: [{ a: ["bra"], b: ["nor"], venue: "New York" }, { a: ["mex"], b: ["eng"], venue: "Mexico City" }] },
  { dayId: "0706", round: "r16", games: [{ a: ["por"], b: ["esp"], venue: "Toronto" }, { a: ["usa"], b: ["bel"], venue: "Philadelphia" }] },
  { dayId: "0707", round: "r16", games: [{ a: ["arg"], b: ["egy"], venue: "Miami" }, { a: ["sui"], b: ["col"], venue: "Kansas City" }] },
  { dayId: "0709", round: "qf", games: [{ a: ["mar"], b: ["fra"], venue: "Boston" }] },
  { dayId: "0710", round: "qf", games: [{ a: ["por", "esp"], b: ["usa", "bel"], venue: "Los Angeles" }] },
  { dayId: "0711", round: "qfs", games: [{ a: ["bra", "nor"], b: ["mex", "eng"], venue: "Miami" }, { a: ["arg", "egy"], b: ["sui", "col"], venue: "Kansas City" }] },
  { dayId: "0714", round: "sf", games: [{ a: ["mar", "fra"], b: ["por", "esp", "usa", "bel"], venue: "Dallas" }] },
  { dayId: "0715", round: "sf", games: [{ a: ["bra", "nor", "mex", "eng"], b: ["arg", "egy", "sui", "col"], venue: "Atlanta" }] },
  { dayId: "0718", round: "bronze", games: [{ a: ALL, b: ALL, venue: "Miami" }] },
  { dayId: "0719", round: "final", games: [{ a: ALL, b: ALL, venue: "MetLife" }] },
];

const ELEMENT_PTS = { water: 3, earth: 2, air: 1, fire: 0, mystery: 0 };
const ALLIED = { water: "earth", earth: "water", fire: "air", air: "fire" };

// ─────────────────────────── TRANSLATIONS ───────────────────────────
const TR = {
  en: {
    signs: { Aries: "Aries", Taurus: "Taurus", Gemini: "Gemini", Cancer: "Cancer", Leo: "Leo", Virgo: "Virgo", Libra: "Libra", Scorpio: "Scorpio", Sagittarius: "Sagittarius", Capricorn: "Capricorn", Aquarius: "Aquarius", Pisces: "Pisces" },
    els: { water: "Water", earth: "Earth", air: "Air", fire: "Fire", mystery: "Veiled" },
    teams: {},
    rounds: { r16: "Round of 16", qf: "Quarterfinal", qfs: "Quarterfinals", sf: "Semifinal", bronze: "Bronze final", final: "THE FINAL" },
    ph: { waning: "waning", waxing: "waxing", new: "new moon", dark: "almost dark" },
    ui: {
      kicker: "As Written in the Sky", tagline: "Every federation has a birth chart. Every match night has its own Moon.",
      navOracle: "Match oracle", navOdds: "Title odds", navYou: "Your stars",
      today: "● TODAY", played: "PLAYED", next: "NEXT UP",
      moonIn: "Moon in", dateNum: "date number", founded: "Founded", veiled: "Chart veiled", survivor: "✦ survivor",
      scenario: "This matchup isn't settled yet — switch the teams to explore each scenario.",
      consult: "✦ Consult the stars ✦", chances: "COSMIC WIN CHANCES",
      vClose: "Too close for the heavens to call. The stars whisper: penalties.",
      vLean: "A lean, not a decree. The sky reserves the right to be surprised.",
      vStrong: "A strong celestial lean — which is exactly when football laughs at the sky.",
      oddsIntro: "How likely the sky is to crown each survivor on July 19 — Moon in Libra, date number 9.",
      oddsOutro: "Odds shift as teams fall and the Moon moves. Come back after each round.",
      youIntro: "Your birth chart meets your team's. Enter your birthday — the sky will judge your loyalty.",
      bond: "COSMIC BOND", you: "You", share: "Share ✦", copied: "Copied — paste it anywhere!",
      stored: "🔒 Nothing you enter is stored or sent anywhere — the reading happens entirely in your browser.",
      pollQ: "Do you think the stars might be right?",
      pollLuck: "Astrologers say luck is Jupiter's whole job — they even mapped a point in the sky called the Part of Fortune. But not even Jupiter can see a deflection in the 93rd minute.",
      pollYes: "✦ The stars know something", pollNo: "☄ It's a beautiful coincidence",
      replyYes: "Noted by the heavens. ✦ If the sky calls the final correctly, you were a believer before it was cool.",
      replyNo: "Fair — and yet here you are, consulting the Moon before kickoff. ☄ We see you.",
      footer1: "Planetary positions computed with a real ephemeris. Predictive value: identical to a 1-euro coin, but far more astrological. ✦",
      disclaimer: "For entertainment only. This is not betting or gambling advice.",
      credit: "Made with curiosity by", afternoon: "· built in one afternoon with AI",
      legal: "Legal & privacy", legalNote: "(legal text in English)",
      dl: (n) => `${n} Jul`,
      shareBond: (bd, t) => `The sky measured my bond with ${t}: ${bd}%. Get your own reading at The Astro Cup →`,
      shareYes: "I consulted the sky about the 2026 final. My verdict: the stars know something ✦ The Astro Cup →",
      shareNo: "I consulted the sky about the 2026 final. My verdict: a beautiful coincidence ☄ The Astro Cup →",
    },
    tags: { nurturing: "nurturing", steady: "steady", breezy: "breezy", unfed: "unfed", restrictive: "restrictive", expansive: "expansive", combative: "combative", blessed: "blessed", protective: "protective", conflicted: "conflicted", soothing: "soothing", destined: "destined", fated: "fated", electric: "electric", charged: "charged", silent: "silent", unknowable: "unknowable" },
    notes: {
      n05: "A master-number 22 day under a Pisces Moon — dreams get built or broken.",
      n06: "The Moon walks into Aries — where Saturn is waiting. Tense skies.",
      n07: "Moon still in Aries, still side by side with Saturn.",
      n10: "The date carries a 9 — the number of endings.",
      n11: "A near-dark Moon. Anything can happen in the shadows.",
      n14: "A NEW MOON in Cancer — the tournament's own sign reborn, on a master-number day.",
      n15: "The Moon joins Jupiter in Leo. A night for glory-seekers.",
      n19: "The Final's date reduces to 9: the completion of a cycle.",
    },
    r: {
      water: (s) => `${s} — water, carried by the Cancer Sun.`,
      earth: (s) => `${s} — earth, nourished by the Cancer Sun.`,
      air: (s) => `${s} — air, a light lift under the Cancer Sun.`,
      fire: (s) => `${s} — fire, and the Cancer Sun feeds it nothing.`,
      saturn: "Saturn, the taskmaster, sits on Aries all tournament.",
      jup: "Jupiter blazes in Leo — the fire trine sends luck.",
      mars: "Mars charges through Gemini — pure fight.",
      pis: "Jupiter, old ruler of Pisces, rides high.",
      moonOwn: (m) => `The Moon is in ${m} tonight — their own sign, their own crowd.`,
      moonSat: "…but the Moon shares that room with Saturn. Comfort, shadowed.",
      moonEl: (m) => `Tonight's ${m} Moon speaks their element.`,
      numExact: (n) => `The date's number is ${n} — an exact match with their path.`,
      nine: "Nine meets nine.",
      masterDay: (n, lp) => `Master day (${n}) meets a master chart (${lp}).`,
      masterHum: (lp) => `Master number ${lp} hums in the founding date.`,
      silent: (lp, n) => `Life path ${lp} — no resonance with this date's ${n}.`,
      veiled: "Founding day lost to the archives — the chart is veiled.",
    },
    b: {
      intro: (s, e, l) => `You are a ${s} (${e}), life path ${l}.`,
      veiled: (t) => `${t}'s chart is veiled — the bond cannot be measured. Perhaps that is the strongest bond of all.`,
      twin: (s, t) => `You share ${s} with ${t}'s federation. Twin flames. When they win, it is personal.`,
      same: (t, e) => `You and ${t} are both ${e} — you suffer in the same language.`,
      allied: (a, b) => `${a} and ${b} are allies — a supportive, occasionally exasperated bond.`,
      clash: (a, b) => `${a} and ${b} clash. You chose this team against the will of the cosmos. Respect.`,
      saturn: "A reminder: Saturn is parked on your team all tournament. Hydrate.",
      lp: (n) => `Your life path ${n} matches the federation's exactly. This was always your team.`,
      master: (x, y) => `Two master numbers (${x} and ${y}). Intense. Possibly too intense.`,
    },
  },
  de: {
    signs: { Aries: "Widder", Taurus: "Stier", Gemini: "Zwillinge", Cancer: "Krebs", Leo: "Löwe", Virgo: "Jungfrau", Libra: "Waage", Scorpio: "Skorpion", Sagittarius: "Schütze", Capricorn: "Steinbock", Aquarius: "Wassermann", Pisces: "Fische" },
    els: { water: "Wasser", earth: "Erde", air: "Luft", fire: "Feuer", mystery: "Verhüllt" },
    teams: { eng: "England", bra: "Brasilien", arg: "Argentinien", bel: "Belgien", esp: "Spanien", egy: "Ägypten", mex: "Mexiko", nor: "Norwegen", por: "Portugal", fra: "Frankreich", usa: "USA", sui: "Schweiz", mar: "Marokko", col: "Kolumbien" },
    rounds: { r16: "Achtelfinale", qf: "Viertelfinale", qfs: "Viertelfinale", sf: "Halbfinale", bronze: "Spiel um Platz 3", final: "DAS FINALE" },
    ph: { waning: "abnehmend", waxing: "zunehmend", new: "Neumond", dark: "fast dunkel" },
    ui: {
      kicker: "Wie es am Himmel geschrieben steht", tagline: "Jeder Verband hat ein Geburtshoroskop. Jede Spielnacht hat ihren eigenen Mond.",
      navOracle: "Spiel-Orakel", navOdds: "Titel-Chancen", navYou: "Deine Sterne",
      today: "● HEUTE", played: "GESPIELT", next: "ALS NÄCHSTES",
      moonIn: "Mond in", dateNum: "Tageszahl", founded: "Gegründet", veiled: "Horoskop verhüllt", survivor: "✦ Überlebender",
      scenario: "Diese Paarung steht noch nicht fest — wechsle die Teams und spiel die Szenarien durch.",
      consult: "✦ Die Sterne befragen ✦", chances: "KOSMISCHE SIEGCHANCEN",
      vClose: "Zu knapp für den Himmel. Die Sterne flüstern: Elfmeterschießen.",
      vLean: "Eine Tendenz, kein Urteil. Der Himmel behält sich Überraschungen vor.",
      vStrong: "Eine klare himmlische Tendenz — genau dann lacht der Fußball über den Himmel.",
      oddsIntro: "Wie wahrscheinlich der Himmel jeden Überlebenden am 19. Juli krönt — Mond in Waage, Tageszahl 9.",
      oddsOutro: "Die Chancen verschieben sich, wenn Teams ausscheiden und der Mond weiterzieht. Schau nach jeder Runde wieder vorbei.",
      youIntro: "Dein Geburtshoroskop trifft auf das deines Teams. Gib deinen Geburtstag ein — der Himmel beurteilt deine Treue.",
      bond: "KOSMISCHE BINDUNG", you: "Du", share: "Teilen ✦", copied: "Kopiert — überall einfügen!",
      stored: "🔒 Nichts wird gespeichert oder gesendet — die Deutung passiert komplett in deinem Browser.",
      pollQ: "Glaubst du, die Sterne könnten recht haben?",
      pollLuck: "Astrologen sagen, Glück sei Jupiters ganzer Job — sie haben sogar einen Punkt am Himmel kartiert, den Glückspunkt. Aber nicht einmal Jupiter sieht einen Abfälscher in der 93. Minute.",
      pollYes: "✦ Die Sterne wissen etwas", pollNo: "☄ Ein schöner Zufall",
      replyYes: "Vom Himmel notiert. ✦ Wenn der Himmel das Finale richtig tippt, warst du Fan, bevor es cool war.",
      replyNo: "Fair — und trotzdem befragst du den Mond vor dem Anpfiff. ☄ Wir sehen dich.",
      footer1: "Planetenpositionen mit einer echten Ephemeride berechnet. Vorhersagekraft: identisch mit einer 1-Euro-Münze, aber deutlich astrologischer. ✦",
      disclaimer: "Nur zur Unterhaltung. Dies ist keine Wett- oder Glücksspielberatung.",
      credit: "Mit Neugier gebaut von", afternoon: "· an einem Nachmittag mit KI gebaut",
      legal: "Rechtliches & Datenschutz", legalNote: "(Rechtstext auf Englisch)",
      dl: (n) => `${n}. Juli`,
      shareBond: (bd, t) => `Der Himmel hat meine Bindung zu ${t} gemessen: ${bd} %. Hol dir deine eigene Deutung beim Astro Cup →`,
      shareYes: "Ich habe den Himmel zum Finale 2026 befragt. Mein Urteil: die Sterne wissen etwas ✦ The Astro Cup →",
      shareNo: "Ich habe den Himmel zum Finale 2026 befragt. Mein Urteil: ein schöner Zufall ☄ The Astro Cup →",
    },
    tags: { nurturing: "nährend", steady: "beständig", breezy: "luftig", unfed: "ungenährt", restrictive: "hemmend", expansive: "expansiv", combative: "kämpferisch", blessed: "gesegnet", protective: "schützend", conflicted: "zwiegespalten", soothing: "beruhigend", destined: "bestimmt", fated: "schicksalhaft", electric: "elektrisch", charged: "aufgeladen", silent: "still", unknowable: "unergründlich" },
    notes: {
      n05: "Ein Meisterzahl-22-Tag unter einem Fische-Mond — Träume werden gebaut oder zerbrochen.",
      n06: "Der Mond zieht in den Widder — wo Saturn wartet. Angespannter Himmel.",
      n07: "Der Mond noch im Widder, weiter Seite an Seite mit Saturn.",
      n10: "Das Datum trägt eine 9 — die Zahl der Enden.",
      n11: "Ein fast dunkler Mond. Im Schatten kann alles passieren.",
      n14: "NEUMOND im Krebs — das Zeichen des Turniers wird neu geboren, an einem Meisterzahl-Tag.",
      n15: "Der Mond gesellt sich zu Jupiter in den Löwen. Eine Nacht für Ruhmsucher.",
      n19: "Das Datum des Finales reduziert sich auf 9: der Abschluss eines Zyklus.",
    },
    r: {
      water: (s) => `${s} — Wasser, getragen von der Krebs-Sonne.`,
      earth: (s) => `${s} — Erde, genährt von der Krebs-Sonne.`,
      air: (s) => `${s} — Luft, ein leichter Auftrieb unter der Krebs-Sonne.`,
      fire: (s) => `${s} — Feuer, und die Krebs-Sonne gibt ihm nichts.`,
      saturn: "Saturn, der Zuchtmeister, sitzt das ganze Turnier im Widder.",
      jup: "Jupiter lodert im Löwen — das Feuer-Trigon schickt Glück.",
      mars: "Mars stürmt durch die Zwillinge — purer Kampfgeist.",
      pis: "Jupiter, alter Herrscher der Fische, steht hoch.",
      moonOwn: (m) => `Der Mond steht heute Nacht in ${m} — ihr eigenes Zeichen, ihr eigenes Publikum.`,
      moonSat: "…doch der Mond teilt diesen Raum mit Saturn. Trost, mit Schatten.",
      moonEl: (m) => `Der heutige ${m}-Mond spricht ihr Element.`,
      numExact: (n) => `Die Tageszahl ist ${n} — exakt ihr Lebensweg.`,
      nine: "Neun trifft Neun.",
      masterDay: (n, lp) => `Meistertag (${n}) trifft Meisterhoroskop (${lp}).`,
      masterHum: (lp) => `Meisterzahl ${lp} summt im Gründungsdatum.`,
      silent: (lp, n) => `Lebensweg ${lp} — keine Resonanz mit der heutigen ${n}.`,
      veiled: "Gründungstag in den Archiven verloren — das Horoskop ist verhüllt.",
    },
    b: {
      intro: (s, e, l) => `Du bist ${s} (${e}), Lebensweg ${l}.`,
      veiled: (t) => `${t}s Horoskop ist verhüllt — die Bindung lässt sich nicht messen. Vielleicht ist genau das die stärkste Bindung.`,
      twin: (s, t) => `Du teilst ${s} mit ${t}s Verband. Seelenverwandt. Wenn sie gewinnen, ist es persönlich.`,
      same: (t, e) => `Du und ${t}, ihr seid beide ${e} — ihr leidet in derselben Sprache.`,
      allied: (a, b) => `${a} und ${b} sind Verbündete — eine stützende, gelegentlich entnervte Bindung.`,
      clash: (a, b) => `${a} und ${b} kollidieren. Du hast dieses Team gegen den Willen des Kosmos gewählt. Respekt.`,
      saturn: "Zur Erinnerung: Saturn parkt das ganze Turnier auf deinem Team. Trink genug Wasser.",
      lp: (n) => `Dein Lebensweg ${n} entspricht exakt dem des Verbands. Das war schon immer dein Team.`,
      master: (x, y) => `Zwei Meisterzahlen (${x} und ${y}). Intensiv. Möglicherweise zu intensiv.`,
    },
  },
  es: {
    signs: { Aries: "Aries", Taurus: "Tauro", Gemini: "Géminis", Cancer: "Cáncer", Leo: "Leo", Virgo: "Virgo", Libra: "Libra", Scorpio: "Escorpio", Sagittarius: "Sagitario", Capricorn: "Capricornio", Aquarius: "Acuario", Pisces: "Piscis" },
    els: { water: "Agua", earth: "Tierra", air: "Aire", fire: "Fuego", mystery: "Velado" },
    teams: { eng: "Inglaterra", bra: "Brasil", arg: "Argentina", bel: "Bélgica", esp: "España", egy: "Egipto", mex: "México", nor: "Noruega", por: "Portugal", fra: "Francia", usa: "EE. UU.", sui: "Suiza", mar: "Marruecos", col: "Colombia" },
    rounds: { r16: "Octavos de final", qf: "Cuartos de final", qfs: "Cuartos de final", sf: "Semifinal", bronze: "Tercer puesto", final: "LA FINAL" },
    ph: { waning: "menguante", waxing: "creciente", new: "luna nueva", dark: "casi oscura" },
    ui: {
      kicker: "Como está escrito en el cielo", tagline: "Cada federación tiene su carta natal. Cada noche de partido tiene su propia Luna.",
      navOracle: "Oráculo del partido", navOdds: "Opciones al título", navYou: "Tus estrellas",
      today: "● HOY", played: "JUGADO", next: "PRÓXIMO",
      moonIn: "Luna en", dateNum: "número del día", founded: "Fundada", veiled: "Carta velada", survivor: "✦ superviviente",
      scenario: "Este cruce aún no está definido — cambia los equipos y explora los escenarios.",
      consult: "✦ Consultar a las estrellas ✦", chances: "PROBABILIDADES CÓSMICAS",
      vClose: "Demasiado parejo para el cielo. Las estrellas susurran: penales.",
      vLean: "Una inclinación, no un decreto. El cielo se reserva el derecho a sorprender.",
      vStrong: "Una clara inclinación celestial — justo cuando el fútbol se ríe del cielo.",
      oddsIntro: "Qué tan probable es que el cielo corone a cada superviviente el 19 de julio — Luna en Libra, número del día 9.",
      oddsOutro: "Las probabilidades cambian cuando caen equipos y la Luna avanza. Vuelve después de cada ronda.",
      youIntro: "Tu carta natal se encuentra con la de tu equipo. Escribe tu cumpleaños — el cielo juzgará tu lealtad.",
      bond: "VÍNCULO CÓSMICO", you: "Tú", share: "Compartir ✦", copied: "¡Copiado — pégalo donde quieras!",
      stored: "🔒 Nada se guarda ni se envía — la lectura ocurre por completo en tu navegador.",
      pollQ: "¿Crees que las estrellas podrían tener razón?",
      pollLuck: "Los astrólogos dicen que la suerte es el trabajo de Júpiter — incluso trazaron un punto en el cielo llamado la Parte de la Fortuna. Pero ni Júpiter ve un desvío en el minuto 93.",
      pollYes: "✦ Las estrellas saben algo", pollNo: "☄ Una hermosa coincidencia",
      replyYes: "Anotado por el cielo. ✦ Si el cielo acierta la final, tú creíste antes de que fuera cool.",
      replyNo: "Justo — y aun así aquí estás, consultando a la Luna antes del pitido inicial. ☄ Te vemos.",
      footer1: "Posiciones planetarias calculadas con una efeméride real. Valor predictivo: idéntico al de una moneda de 1 euro, pero mucho más astrológico. ✦",
      disclaimer: "Solo entretenimiento. Esto no es asesoramiento de apuestas ni de juego.",
      credit: "Hecho con curiosidad por", afternoon: "· construido en una tarde con IA",
      legal: "Legal y privacidad", legalNote: "(texto legal en inglés)",
      dl: (n) => `${n} jul`,
      shareBond: (bd, t) => `El cielo midió mi vínculo con ${t}: ${bd}%. Consigue tu propia lectura en The Astro Cup →`,
      shareYes: "Consulté al cielo sobre la final de 2026. Mi veredicto: las estrellas saben algo ✦ The Astro Cup →",
      shareNo: "Consulté al cielo sobre la final de 2026. Mi veredicto: una hermosa coincidencia ☄ The Astro Cup →",
    },
    tags: { nurturing: "nutritivo", steady: "estable", breezy: "ligero", unfed: "apagado", restrictive: "restrictivo", expansive: "expansivo", combative: "combativo", blessed: "bendecido", protective: "protector", conflicted: "dividido", soothing: "calmante", destined: "destinado", fated: "fatídico", electric: "eléctrico", charged: "cargado", silent: "mudo", unknowable: "insondable" },
    notes: {
      n05: "Un día maestro 22 bajo una Luna en Piscis — los sueños se construyen o se rompen.",
      n06: "La Luna entra en Aries — donde Saturno espera. Cielos tensos.",
      n07: "La Luna sigue en Aries, todavía junto a Saturno.",
      n10: "La fecha lleva un 9 — el número de los finales.",
      n11: "Una Luna casi oscura. En las sombras todo puede pasar.",
      n14: "LUNA NUEVA en Cáncer — el signo del torneo renace, en un día de número maestro.",
      n15: "La Luna se une a Júpiter en Leo. Una noche para buscadores de gloria.",
      n19: "La fecha de la Final se reduce a 9: el cierre de un ciclo.",
    },
    r: {
      water: (s) => `${s} — agua, llevada por el Sol en Cáncer.`,
      earth: (s) => `${s} — tierra, nutrida por el Sol en Cáncer.`,
      air: (s) => `${s} — aire, una brisa leve bajo el Sol en Cáncer.`,
      fire: (s) => `${s} — fuego, y el Sol en Cáncer no le da nada.`,
      saturn: "Saturno, el gran restrictor, se sienta en Aries todo el torneo.",
      jup: "Júpiter arde en Leo — el trígono de fuego envía suerte.",
      mars: "Marte carga por Géminis — pura pelea.",
      pis: "Júpiter, antiguo regente de Piscis, cabalga alto.",
      moonOwn: (m) => `La Luna está en ${m} esta noche — su propio signo, su propia hinchada.`,
      moonSat: "…pero la Luna comparte ese cuarto con Saturno. Consuelo, con sombra.",
      moonEl: (m) => `La Luna en ${m} de esta noche habla su elemento.`,
      numExact: (n) => `El número del día es ${n} — coincide exacto con su camino.`,
      nine: "Nueve encuentra al nueve.",
      masterDay: (n, lp) => `Día maestro (${n}) encuentra carta maestra (${lp}).`,
      masterHum: (lp) => `El número maestro ${lp} zumba en la fecha de fundación.`,
      silent: (lp, n) => `Camino de vida ${lp} — sin resonancia con el ${n} de hoy.`,
      veiled: "Día de fundación perdido en los archivos — la carta está velada.",
    },
    b: {
      intro: (s, e, l) => `Eres ${s} (${e}), camino de vida ${l}.`,
      veiled: (t) => `La carta de ${t} está velada — el vínculo no puede medirse. Quizá ese sea el vínculo más fuerte de todos.`,
      twin: (s, t) => `Compartes ${s} con la federación de ${t}. Almas gemelas. Cuando ganan, es personal.`,
      same: (t, e) => `Tú y ${t} son ambos ${e} — sufren en el mismo idioma.`,
      allied: (a, b) => `${a} y ${b} son aliados — un vínculo que apoya, y a veces se exaspera.`,
      clash: (a, b) => `${a} y ${b} chocan. Elegiste a este equipo contra la voluntad del cosmos. Respeto.`,
      saturn: "Recordatorio: Saturno está estacionado sobre tu equipo todo el torneo. Hidrátate.",
      lp: (n) => `Tu camino de vida ${n} coincide exacto con el de la federación. Siempre fue tu equipo.`,
      master: (x, y) => `Dos números maestros (${x} y ${y}). Intenso. Posiblemente demasiado.`,
    },
  },
  pt: {
    signs: { Aries: "Áries", Taurus: "Touro", Gemini: "Gêmeos", Cancer: "Câncer", Leo: "Leão", Virgo: "Virgem", Libra: "Libra", Scorpio: "Escorpião", Sagittarius: "Sagitário", Capricorn: "Capricórnio", Aquarius: "Aquário", Pisces: "Peixes" },
    els: { water: "Água", earth: "Terra", air: "Ar", fire: "Fogo", mystery: "Velado" },
    teams: { eng: "Inglaterra", bra: "Brasil", arg: "Argentina", bel: "Bélgica", esp: "Espanha", egy: "Egito", mex: "México", nor: "Noruega", por: "Portugal", fra: "França", usa: "EUA", sui: "Suíça", mar: "Marrocos", col: "Colômbia" },
    rounds: { r16: "Oitavas de final", qf: "Quartas de final", qfs: "Quartas de final", sf: "Semifinal", bronze: "Disputa de 3º lugar", final: "A FINAL" },
    ph: { waning: "minguante", waxing: "crescente", new: "lua nova", dark: "quase escura" },
    ui: {
      kicker: "Como está escrito no céu", tagline: "Cada federação tem seu mapa astral. Cada noite de jogo tem sua própria Lua.",
      navOracle: "Oráculo da partida", navOdds: "Chances de título", navYou: "Suas estrelas",
      today: "● HOJE", played: "JOGADO", next: "A SEGUIR",
      moonIn: "Lua em", dateNum: "número do dia", founded: "Fundada", veiled: "Mapa velado", survivor: "✦ sobrevivente",
      scenario: "Este confronto ainda não está definido — troque os times e explore os cenários.",
      consult: "✦ Consultar as estrelas ✦", chances: "CHANCES CÓSMICAS DE VITÓRIA",
      vClose: "Apertado demais para o céu. As estrelas sussurram: pênaltis.",
      vLean: "Uma inclinação, não um decreto. O céu se reserva o direito de surpreender.",
      vStrong: "Uma forte inclinação celestial — exatamente quando o futebol ri do céu.",
      oddsIntro: "A probabilidade de o céu coroar cada sobrevivente em 19 de julho — Lua em Libra, número do dia 9.",
      oddsOutro: "As chances mudam quando times caem e a Lua avança. Volte depois de cada rodada.",
      youIntro: "Seu mapa astral encontra o do seu time. Digite seu aniversário — o céu vai julgar sua lealdade.",
      bond: "VÍNCULO CÓSMICO", you: "Você", share: "Compartilhar ✦", copied: "Copiado — cole onde quiser!",
      stored: "🔒 Nada é salvo nem enviado — a leitura acontece inteiramente no seu navegador.",
      pollQ: "Você acha que as estrelas podem estar certas?",
      pollLuck: "Os astrólogos dizem que sorte é o trabalho de Júpiter — eles até mapearam um ponto no céu chamado Parte da Fortuna. Mas nem Júpiter enxerga um desvio no minuto 93.",
      pollYes: "✦ As estrelas sabem de algo", pollNo: "☄ Uma bela coincidência",
      replyYes: "Anotado pelos céus. ✦ Se o céu acertar a final, você acreditou antes de virar moda.",
      replyNo: "Justo — e mesmo assim você está aqui, consultando a Lua antes do apito. ☄ A gente vê você.",
      footer1: "Posições planetárias calculadas com uma efeméride real. Valor preditivo: idêntico ao de uma moeda de 1 euro, mas muito mais astrológico. ✦",
      disclaimer: "Apenas entretenimento. Isto não é aconselhamento de apostas ou jogos de azar.",
      credit: "Feito com curiosidade por", afternoon: "· construído em uma tarde com IA",
      legal: "Legal e privacidade", legalNote: "(texto legal em inglês)",
      dl: (n) => `${n} jul`,
      shareBond: (bd, t) => `O céu mediu meu vínculo com ${t}: ${bd}%. Faça sua própria leitura no The Astro Cup →`,
      shareYes: "Consultei o céu sobre a final de 2026. Meu veredito: as estrelas sabem de algo ✦ The Astro Cup →",
      shareNo: "Consultei o céu sobre a final de 2026. Meu veredito: uma bela coincidência ☄ The Astro Cup →",
    },
    tags: { nurturing: "nutritivo", steady: "estável", breezy: "leve", unfed: "apagado", restrictive: "restritivo", expansive: "expansivo", combative: "combativo", blessed: "abençoado", protective: "protetor", conflicted: "dividido", soothing: "calmante", destined: "destinado", fated: "fatídico", electric: "elétrico", charged: "carregado", silent: "mudo", unknowable: "insondável" },
    notes: {
      n05: "Um dia mestre 22 sob uma Lua em Peixes — sonhos são construídos ou quebrados.",
      n06: "A Lua entra em Áries — onde Saturno espera. Céus tensos.",
      n07: "A Lua segue em Áries, ainda lado a lado com Saturno.",
      n10: "A data carrega um 9 — o número dos finais.",
      n11: "Uma Lua quase escura. Nas sombras, tudo pode acontecer.",
      n14: "LUA NOVA em Câncer — o signo do torneio renasce, em um dia de número mestre.",
      n15: "A Lua se junta a Júpiter em Leão. Uma noite para caçadores de glória.",
      n19: "A data da Final se reduz a 9: o fechamento de um ciclo.",
    },
    r: {
      water: (s) => `${s} — água, carregada pelo Sol em Câncer.`,
      earth: (s) => `${s} — terra, nutrida pelo Sol em Câncer.`,
      air: (s) => `${s} — ar, uma brisa leve sob o Sol em Câncer.`,
      fire: (s) => `${s} — fogo, e o Sol em Câncer não lhe dá nada.`,
      saturn: "Saturno, o grande restritor, senta em Áries o torneio inteiro.",
      jup: "Júpiter arde em Leão — o trígono de fogo envia sorte.",
      mars: "Marte avança por Gêmeos — pura garra.",
      pis: "Júpiter, antigo regente de Peixes, cavalga alto.",
      moonOwn: (m) => `A Lua está em ${m} esta noite — o próprio signo, a própria torcida.`,
      moonSat: "…mas a Lua divide esse quarto com Saturno. Conforto, com sombra.",
      moonEl: (m) => `A Lua em ${m} desta noite fala o elemento deles.`,
      numExact: (n) => `O número do dia é ${n} — igualzinho ao caminho deles.`,
      nine: "Nove encontra nove.",
      masterDay: (n, lp) => `Dia mestre (${n}) encontra mapa mestre (${lp}).`,
      masterHum: (lp) => `O número mestre ${lp} vibra na data de fundação.`,
      silent: (lp, n) => `Caminho de vida ${lp} — sem ressonância com o ${n} de hoje.`,
      veiled: "Dia de fundação perdido nos arquivos — o mapa está velado.",
    },
    b: {
      intro: (s, e, l) => `Você é de ${s} (${e}), caminho de vida ${l}.`,
      veiled: (t) => `O mapa de ${t} está velado — o vínculo não pode ser medido. Talvez esse seja o vínculo mais forte de todos.`,
      twin: (s, t) => `Você divide ${s} com a federação de ${t}. Almas gêmeas. Quando eles ganham, é pessoal.`,
      same: (t, e) => `Você e ${t} são ambos ${e} — vocês sofrem no mesmo idioma.`,
      allied: (a, b) => `${a} e ${b} são aliados — um vínculo que apoia, e às vezes se exaspera.`,
      clash: (a, b) => `${a} e ${b} colidem. Você escolheu esse time contra a vontade do cosmos. Respeito.`,
      saturn: "Lembrete: Saturno está estacionado sobre o seu time o torneio inteiro. Beba água.",
      lp: (n) => `Seu caminho de vida ${n} é idêntico ao da federação. Esse sempre foi o seu time.`,
      master: (x, y) => `Dois números mestres (${x} e ${y}). Intenso. Possivelmente intenso demais.`,
    },
  },
  fr: {
    signs: { Aries: "Bélier", Taurus: "Taureau", Gemini: "Gémeaux", Cancer: "Cancer", Leo: "Lion", Virgo: "Vierge", Libra: "Balance", Scorpio: "Scorpion", Sagittarius: "Sagittaire", Capricorn: "Capricorne", Aquarius: "Verseau", Pisces: "Poissons" },
    els: { water: "Eau", earth: "Terre", air: "Air", fire: "Feu", mystery: "Voilé" },
    teams: { eng: "Angleterre", bra: "Brésil", arg: "Argentine", bel: "Belgique", esp: "Espagne", egy: "Égypte", mex: "Mexique", nor: "Norvège", por: "Portugal", fra: "France", usa: "États-Unis", sui: "Suisse", mar: "Maroc", col: "Colombie" },
    rounds: { r16: "Huitièmes de finale", qf: "Quart de finale", qfs: "Quarts de finale", sf: "Demi-finale", bronze: "Match pour la 3e place", final: "LA FINALE" },
    ph: { waning: "décroissante", waxing: "croissante", new: "nouvelle lune", dark: "presque noire" },
    ui: {
      kicker: "Comme il est écrit dans le ciel", tagline: "Chaque fédération a son thème astral. Chaque soir de match a sa propre Lune.",
      navOracle: "Oracle du match", navOdds: "Chances au titre", navYou: "Vos étoiles",
      today: "● AUJOURD'HUI", played: "JOUÉ", next: "À SUIVRE",
      moonIn: "Lune en", dateNum: "nombre du jour", founded: "Fondée", veiled: "Thème voilé", survivor: "✦ survivant",
      scenario: "Cette affiche n'est pas encore fixée — changez les équipes et explorez les scénarios.",
      consult: "✦ Consulter les étoiles ✦", chances: "CHANCES COSMIQUES DE VICTOIRE",
      vClose: "Trop serré pour le ciel. Les étoiles murmurent : tirs au but.",
      vLean: "Une inclination, pas un décret. Le ciel se réserve le droit de surprendre.",
      vStrong: "Une nette inclination céleste — exactement quand le football se moque du ciel.",
      oddsIntro: "La probabilité que le ciel couronne chaque survivant le 19 juillet — Lune en Balance, nombre du jour 9.",
      oddsOutro: "Les chances évoluent quand des équipes tombent et que la Lune avance. Revenez après chaque tour.",
      youIntro: "Votre thème astral rencontre celui de votre équipe. Entrez votre date de naissance — le ciel jugera votre loyauté.",
      bond: "LIEN COSMIQUE", you: "Vous", share: "Partager ✦", copied: "Copié — collez-le où vous voulez !",
      stored: "🔒 Rien n'est stocké ni envoyé — la lecture se fait entièrement dans votre navigateur.",
      pollQ: "Pensez-vous que les étoiles pourraient avoir raison ?",
      pollLuck: "Les astrologues disent que la chance est le métier de Jupiter — ils ont même cartographié un point du ciel appelé la Part de Fortune. Mais même Jupiter ne voit pas une déviation à la 93e minute.",
      pollYes: "✦ Les étoiles savent quelque chose", pollNo: "☄ Une belle coïncidence",
      replyYes: "Noté par les cieux. ✦ Si le ciel prédit bien la finale, vous y croyiez avant que ce soit cool.",
      replyNo: "D'accord — et pourtant vous voilà, à consulter la Lune avant le coup d'envoi. ☄ On vous voit.",
      footer1: "Positions planétaires calculées avec une véritable éphéméride. Valeur prédictive : identique à une pièce de 1 euro, mais bien plus astrologique. ✦",
      disclaimer: "Divertissement uniquement. Ceci n'est pas un conseil en paris ou jeux d'argent.",
      credit: "Fait avec curiosité par", afternoon: "· construit en un après-midi avec l'IA",
      legal: "Mentions légales et confidentialité", legalNote: "(texte légal en anglais)",
      dl: (n) => `${n} juil.`,
      shareBond: (bd, t) => `Le ciel a mesuré mon lien avec ${t} : ${bd} %. Obtenez votre propre lecture sur The Astro Cup →`,
      shareYes: "J'ai consulté le ciel sur la finale 2026. Mon verdict : les étoiles savent quelque chose ✦ The Astro Cup →",
      shareNo: "J'ai consulté le ciel sur la finale 2026. Mon verdict : une belle coïncidence ☄ The Astro Cup →",
    },
    tags: { nurturing: "nourricier", steady: "stable", breezy: "léger", unfed: "affamé", restrictive: "restrictif", expansive: "expansif", combative: "combatif", blessed: "béni", protective: "protecteur", conflicted: "partagé", soothing: "apaisant", destined: "destiné", fated: "fatidique", electric: "électrique", charged: "chargé", silent: "muet", unknowable: "insondable" },
    notes: {
      n05: "Un jour maître 22 sous une Lune en Poissons — les rêves se construisent ou se brisent.",
      n06: "La Lune entre en Bélier — où Saturne attend. Ciel tendu.",
      n07: "La Lune toujours en Bélier, toujours côte à côte avec Saturne.",
      n10: "La date porte un 9 — le nombre des fins.",
      n11: "Une Lune presque noire. Dans l'ombre, tout peut arriver.",
      n14: "NOUVELLE LUNE en Cancer — le signe du tournoi renaît, un jour de nombre maître.",
      n15: "La Lune rejoint Jupiter en Lion. Une nuit pour les chercheurs de gloire.",
      n19: "La date de la Finale se réduit à 9 : l'achèvement d'un cycle.",
    },
    r: {
      water: (s) => `${s} — eau, portée par le Soleil en Cancer.`,
      earth: (s) => `${s} — terre, nourrie par le Soleil en Cancer.`,
      air: (s) => `${s} — air, une brise légère sous le Soleil en Cancer.`,
      fire: (s) => `${s} — feu, et le Soleil en Cancer ne lui donne rien.`,
      saturn: "Saturne, le grand restricteur, siège en Bélier tout le tournoi.",
      jup: "Jupiter flamboie en Lion — le trigone de feu envoie de la chance.",
      mars: "Mars charge à travers les Gémeaux — pur esprit de combat.",
      pis: "Jupiter, ancien maître des Poissons, est au plus haut.",
      moonOwn: (m) => `La Lune est en ${m} ce soir — leur propre signe, leur propre public.`,
      moonSat: "…mais la Lune partage cette pièce avec Saturne. Un réconfort, avec une ombre.",
      moonEl: (m) => `La Lune en ${m} de ce soir parle leur élément.`,
      numExact: (n) => `Le nombre du jour est ${n} — exactement leur chemin de vie.`,
      nine: "Neuf rencontre neuf.",
      masterDay: (n, lp) => `Jour maître (${n}) rencontre thème maître (${lp}).`,
      masterHum: (lp) => `Le nombre maître ${lp} vibre dans la date de fondation.`,
      silent: (lp, n) => `Chemin de vie ${lp} — aucune résonance avec le ${n} du jour.`,
      veiled: "Jour de fondation perdu dans les archives — le thème est voilé.",
    },
    b: {
      intro: (s, e, l) => `Vous êtes ${s} (${e}), chemin de vie ${l}.`,
      veiled: (t) => `Le thème de ${t} est voilé — le lien ne peut pas être mesuré. C'est peut-être le lien le plus fort de tous.`,
      twin: (s, t) => `Vous partagez ${s} avec la fédération de ${t}. Âmes sœurs. Quand ils gagnent, c'est personnel.`,
      same: (t, e) => `Vous et ${t} êtes tous deux ${e} — vous souffrez dans la même langue.`,
      allied: (a, b) => `${a} et ${b} sont alliés — un lien qui soutient, parfois s'exaspère.`,
      clash: (a, b) => `${a} et ${b} s'affrontent. Vous avez choisi cette équipe contre la volonté du cosmos. Respect.`,
      saturn: "Rappel : Saturne est garé sur votre équipe tout le tournoi. Hydratez-vous.",
      lp: (n) => `Votre chemin de vie ${n} correspond exactement à celui de la fédération. C'était depuis toujours votre équipe.`,
      master: (x, y) => `Deux nombres maîtres (${x} et ${y}). Intense. Peut-être trop intense.`,
    },
  },
};

function readTeam(t, day, L) {
  const lines = [];
  let score = 0;
  const add = (pts, tag, text) => { score += pts; lines.push({ pts, tag: L.tags[tag], text }); };
  const S = t.sign ? L.signs[t.sign] : null;
  const M = L.signs[day.moon];

  if (t.element === "mystery") {
    lines.push({ pts: 0, tag: L.tags.unknowable, text: L.r.veiled });
  } else {
    if (t.element === "water") add(3, "nurturing", L.r.water(S));
    else if (t.element === "earth") add(2, "steady", L.r.earth(S));
    else if (t.element === "air") add(1, "breezy", L.r.air(S));
    else add(0, "unfed", L.r.fire(S));
    if (t.sign === "Aries") add(-2, "restrictive", L.r.saturn);
    if (t.element === "fire") add(2, "expansive", L.r.jup);
    if (t.sign === "Gemini") add(2, "combative", L.r.mars);
    if (t.sign === "Pisces") add(1, "blessed", L.r.pis);
    if (t.sign === day.moon) {
      add(2, "protective", L.r.moonOwn(M));
      if (day.moon === "Aries") add(-1, "conflicted", L.r.moonSat);
    } else if (t.element === day.moonEl) {
      add(1, "soothing", L.r.moonEl(M));
    }
  }
  if (day.num === t.lp) add(2, "destined", L.r.numExact(day.num));
  else if (day.num === 9 && t.lp === 9) add(2, "fated", L.r.nine);
  else if ((day.num === 11 || day.num === 22 || day.num === 33) && t.master) add(2, "electric", L.r.masterDay(day.num, t.lp));
  else if (t.master) add(1, "charged", L.r.masterHum(t.lp));
  else lines.push({ pts: 0, tag: L.tags.silent, text: L.r.silent(t.lp, day.num) });
  return { score, lines };
}

const prob = (diff) => 1 / (1 + Math.exp(-0.38 * diff));

const SIGN_DATES = [
  ["Capricorn", 1, 19, "earth", "♑"], ["Aquarius", 2, 18, "air", "♒"], ["Pisces", 3, 20, "water", "♓"],
  ["Aries", 4, 19, "fire", "♈"], ["Taurus", 5, 20, "earth", "♉"], ["Gemini", 6, 20, "air", "♊"],
  ["Cancer", 7, 22, "water", "♋"], ["Leo", 8, 22, "fire", "♌"], ["Virgo", 9, 22, "earth", "♍"],
  ["Libra", 10, 22, "air", "♎"], ["Scorpio", 11, 21, "water", "♏"], ["Sagittarius", 12, 21, "fire", "♐"],
  ["Capricorn", 12, 31, "earth", "♑"],
];
function sunSign(m, d) {
  for (const [name, mm, dd, el, gl] of SIGN_DATES) if (m < mm || (m === mm && d <= dd)) return { name, el, gl };
  return { name: "Capricorn", el: "earth", gl: "♑" };
}
function lifePath(dateStr) {
  let n = dateStr.replace(/\D/g, "").split("").reduce((s, c) => s + +c, 0);
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) n = String(n).split("").reduce((s, c) => s + +c, 0);
  return n;
}

const LANG_LIST = ["en", "de", "es", "pt", "fr"];

export default function AstroCup() {
  const [lang, setLang] = useState(() => {
    const n = (typeof navigator !== "undefined" ? navigator.language || "en" : "en").slice(0, 2).toLowerCase();
    return LANG_LIST.includes(n) ? n : "en";
  });
  const L = TR[lang];

  const [view, setView] = useState("oracle");
  const [dayId, setDayId] = useState("0709");
  const [a, setA] = useState("mar");
  const [b, setB] = useState("fra");
  const [slotA, setSlotA] = useState(["mar"]);
  const [slotB, setSlotB] = useState(["fra"]);
  const [revealed, setRevealed] = useState(false);
  const [step, setStep] = useState(0);
  const [bday, setBday] = useState("");
  const [myTeam, setMyTeam] = useState("bra");
  const [vote, setVote] = useState(null);
  const [copied, setCopied] = useState(null);

  const todayDay = useMemo(() => {
    const now = new Date();
    if (now.getFullYear() !== 2026 || now.getMonth() !== 6) return now < new Date(2026, 6, 1) ? 0 : 99;
    return now.getDate();
  }, []);
  const statusOf = (d) => (DAYS[d].day === todayDay ? "today" : DAYS[d].day < todayDay ? "past" : "future");
  const nextDayId = useMemo(() => {
    const upcoming = FIXTURES.find((f) => DAYS[f.dayId].day >= todayDay);
    return (upcoming || FIXTURES[FIXTURES.length - 1]).dayId;
  }, [todayDay]);

  useEffect(() => {
    const fx = FIXTURES.find((f) => f.dayId === nextDayId);
    if (fx) loadGame(fx.dayId, fx.games[0]);
  }, []);

  const loadGame = (dId, game) => {
    setDayId(dId);
    setSlotA(game.a); setSlotB(game.b);
    setA(game.a[0]); setB(game.b.find((x) => x !== game.a[0]) || game.b[0]);
    setRevealed(false);
    setView("oracle");
  };

  const stars = useMemo(() => Array.from({ length: 70 }, (_, i) => ({
    left: (i * 137.508) % 100, top: ((i * 61.803) % 97) + 1, size: 1 + ((i * 7) % 3), delay: (i % 9) * 0.7,
  })), []);

  const day = DAYS[dayId];
  const ta = TEAMS.find((t) => t.id === a);
  const tb = TEAMS.find((t) => t.id === b);
  const ra = useMemo(() => readTeam(ta, day, L), [a, dayId, lang]);
  const rb = useMemo(() => readTeam(tb, day, L), [b, dayId, lang]);
  const pA = prob(ra.score - rb.score);
  const totalSteps = ra.lines.length + rb.lines.length + 1;
  const scenario = slotA.length > 1 || slotB.length > 1;

  useEffect(() => {
    if (!revealed) return;
    setStep(0);
    const iv = setInterval(() => setStep((s) => (s >= totalSteps ? (clearInterval(iv), s) : s + 1)), 520);
    return () => clearInterval(iv);
  }, [revealed, a, b, dayId, lang]);

  const odds = useMemo(() => {
    const scored = TEAMS.map((t) => ({ t, s: readTeam(t, DAYS["0719"], L).score }));
    const Z = scored.reduce((z, x) => z + Math.exp(0.42 * x.s), 0);
    return scored.map((x) => ({ ...x, p: Math.exp(0.42 * x.s) / Z })).sort((x, y) => y.p - x.p);
  }, [lang]);

  const tName = (t) => L.teams[t.id] || t.name;

  const reading = useMemo(() => {
    if (!bday) return null;
    const [Y, M, D] = bday.split("-").map(Number);
    if (!Y || !M || !D) return null;
    const me = sunSign(M, D);
    const lp = lifePath(bday);
    const team = TEAMS.find((t) => t.id === myTeam);
    const tn = tName(team);
    const lines = [];
    let bond = 38;
    lines.push({ good: true, text: L.b.intro(L.signs[me.name], L.els[me.el].toLowerCase(), lp) });
    if (team.element === "mystery") { lines.push({ good: null, text: L.b.veiled(tn) }); bond = 77; }
    else if (me.name === team.sign) { bond += 35; lines.push({ good: true, text: L.b.twin(L.signs[team.sign], tn) }); }
    else if (me.el === team.element) { bond += 22; lines.push({ good: true, text: L.b.same(tn, L.els[me.el].toLowerCase()) }); }
    else if (ALLIED[me.el] === team.element) { bond += 12; lines.push({ good: true, text: L.b.allied(L.els[me.el], L.els[team.element].toLowerCase()) }); }
    else { bond -= 6; lines.push({ good: false, text: L.b.clash(L.els[me.el], L.els[team.element].toLowerCase()) }); }
    if (team.sign === "Aries") lines.push({ good: false, text: L.b.saturn });
    if (lp === team.lp) { bond += 18; lines.push({ good: true, text: L.b.lp(lp) }); }
    else if ((lp === 11 || lp === 22 || lp === 33) && team.master) { bond += 12; lines.push({ good: true, text: L.b.master(lp, team.lp) }); }
    bond = Math.max(12, Math.min(96, bond));
    return { me, lp, team, tn, lines, bond };
  }, [bday, myTeam, lang]);

  const doShare = async (text, key) => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) { await navigator.share({ text: `${text} ${url}` }); return; }
      throw new Error("no-share");
    } catch (e) {
      try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setCopied(key);
        setTimeout(() => setCopied(null), 2500);
      } catch (_) { /* clipboard blocked; nothing to do */ }
    }
  };

  const gold = "#E3B95C", ink = "#F4F1FF", dim = "#9A9BC4", line = "#3A3470";

  const Tag = ({ children }) => (
    <span style={{ fontSize: 10, fontFamily: "'Cinzel', serif", letterSpacing: ".08em", textTransform: "uppercase", color: gold, border: `1px solid rgba(227,185,92,.4)`, borderRadius: 4, padding: "1px 5px", whiteSpace: "nowrap", alignSelf: "center" }}>{children}</span>
  );

  const ShareBtn = ({ text, k }) => (
    <button onClick={() => doShare(text, k)} style={{ fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", padding: "9px 18px", borderRadius: 8, cursor: "pointer", border: `1px solid ${gold}`, background: "rgba(227,185,92,.1)", color: "#F4E9C8" }}>
      {copied === k ? L.ui.copied : L.ui.share}
    </button>
  );

  const Bar = ({ p, team, align }) => (
    <div style={{ flex: 1, textAlign: align }}>
      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 26, color: ink }}>{Math.round(p * 100)}%</div>
      <div style={{ fontSize: 13, color: dim, marginBottom: 6 }}>{team.flag} {tName(team)}</div>
      <div style={{ height: 8, background: "#221B5C", borderRadius: 4, overflow: "hidden", direction: align === "right" ? "rtl" : "ltr" }}>
        <div style={{ width: `${p * 100}%`, height: "100%", background: `linear-gradient(90deg, ${gold}, #F4E9C8)`, transition: "width .8s ease" }} />
      </div>
    </div>
  );

  const phase = (d) => (d.ph === "new" ? L.ph.new : `${d.pct}% ${L.ph[d.ph]}`);

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(ellipse at 50% -10%, #241c5e 0%, #151038 45%, #0d0a26 100%)", color: "#C9CCE8", fontFamily: "'Spectral', Georgia, serif", position: "relative", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Spectral:ital,wght@0,300;0,400;0,600;1,400&display=swap');
        @keyframes twinkle { 0%,100%{opacity:.25} 50%{opacity:.9} }
        @keyframes rise { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(227,185,92,.35)} 50%{box-shadow:0 0 14px 2px rgba(227,185,92,.25)} }
        @media (prefers-reduced-motion: reduce){ *{animation:none!important;transition:none!important} }
        select:focus-visible, button:focus-visible, input:focus-visible { outline:2px solid ${gold}; outline-offset:2px }
        input[type=date]{ color-scheme: dark }
        .cal{ scrollbar-color: #E3B95C #221B5C; scrollbar-width: thin }
        .cal::-webkit-scrollbar{ height:10px }
        .cal::-webkit-scrollbar-track{ background:#221B5C; border-radius:5px }
        .cal::-webkit-scrollbar-thumb{ background:linear-gradient(90deg,#E3B95C,#C99F45); border-radius:5px; border:2px solid #221B5C }
        .cal::-webkit-scrollbar-thumb:hover{ background:#F4E9C8 }
        @media (min-width: 1000px) { .wrap { zoom: 1.12 } }
        @media (min-width: 1300px) { .wrap { zoom: 1.25 } }
        @media (min-width: 1700px) { .wrap { zoom: 1.4 } }
      `}</style>

      {stars.map((s, i) => (
        <div key={i} style={{ position: "absolute", left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, borderRadius: "50%", background: "#E9E4FF", animation: `twinkle ${3 + (i % 4)}s ease-in-out ${s.delay}s infinite`, pointerEvents: "none" }} />
      ))}

      <div className="wrap" style={{ maxWidth: 860, margin: "0 auto", padding: "30px 16px 60px", position: "relative" }}>
        {/* language switcher */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 4, marginBottom: 8 }}>
          {LANG_LIST.map((l) => (
            <button key={l} onClick={() => setLang(l)} aria-label={`Language ${l}`} style={{ fontFamily: "'Cinzel', serif", fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", padding: "5px 8px", borderRadius: 5, cursor: "pointer", border: `1px solid ${lang === l ? gold : "#2B2560"}`, background: lang === l ? "rgba(227,185,92,.12)" : "transparent", color: lang === l ? gold : "#6E6F9A" }}>
              {l}
            </button>
          ))}
        </div>

        <header style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11.5, letterSpacing: ".35em", color: gold, textTransform: "uppercase" }}>2026 · {L.ui.kicker}</div>
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(30px,7vw,50px)", fontWeight: 700, color: ink, margin: "8px 0 4px", letterSpacing: ".04em" }}>The Astro Cup</h1>
          <p style={{ fontSize: 14, fontStyle: "italic", color: dim, maxWidth: 460, margin: "0 auto", lineHeight: 1.55 }}>{L.ui.tagline}</p>
        </header>

        {/* ── THE CALENDAR ── */}
        <div className="cal" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 10, marginBottom: 10 }}>
          {FIXTURES.map((fx) => {
            const st = statusOf(fx.dayId);
            const d = DAYS[fx.dayId];
            return (
              <div key={fx.dayId} style={{ flexShrink: 0, minWidth: 168, border: `1px solid ${st === "today" ? gold : line}`, borderRadius: 10, padding: "10px 10px 8px", background: st === "past" ? "rgba(20,16,52,.45)" : "rgba(30,24,78,.6)", opacity: st === "past" ? 0.5 : 1, animation: st === "today" ? "pulse 2.4s ease-in-out infinite" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: st === "today" ? gold : ink }}>{L.ui.dl(d.day)}</span>
                  <span style={{ fontSize: 9.5, fontFamily: "'Cinzel', serif", letterSpacing: ".12em", color: st === "today" ? gold : "#6E6F9A" }}>
                    {st === "today" ? L.ui.today : st === "past" ? L.ui.played : fx.dayId === nextDayId ? L.ui.next : ""}
                  </span>
                </div>
                <div style={{ fontSize: 10.5, color: "#6E6F9A", marginBottom: 6 }}>{L.rounds[fx.round]} · ☽ {L.signs[d.moon]} · nº {d.num}</div>
                {fx.games.map((g, gi) => (
                  <button key={gi} onClick={() => loadGame(fx.dayId, g)} style={{ display: "block", width: "100%", textAlign: "left", background: dayId === fx.dayId && slotA === g.a ? "rgba(227,185,92,.14)" : "rgba(20,16,52,.55)", border: `1px solid ${dayId === fx.dayId && slotA === g.a ? gold : "#2B2560"}`, borderRadius: 6, padding: "6px 8px", marginBottom: 5, cursor: "pointer", color: ink, fontFamily: "'Spectral', serif", fontSize: 12.5, lineHeight: 1.45 }}>
                    {g.a.length === 1 ? `${TEAMS.find((t) => t.id === g.a[0]).flag} ${tName(TEAMS.find((t) => t.id === g.a[0]))}` : g.a.length <= 2 ? g.a.map((id) => TEAMS.find((t) => t.id === id).flag).join("/") + " ?" : L.ui.survivor}
                    <span style={{ color: "#6E6F9A" }}> vs </span>
                    {g.b.length === 1 ? `${TEAMS.find((t) => t.id === g.b[0]).flag} ${tName(TEAMS.find((t) => t.id === g.b[0]))}` : g.b.length <= 2 ? g.b.map((id) => TEAMS.find((t) => t.id === id).flag).join("/") + " ?" : L.ui.survivor}
                    <div style={{ fontSize: 10, color: "#6E6F9A" }}>{g.venue}</div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        <nav style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
          {[["oracle", L.ui.navOracle], ["odds", L.ui.navOdds], ["you", L.ui.navYou]].map(([k, label]) => (
            <button key={k} onClick={() => setView(k)} style={{ fontFamily: "'Cinzel', serif", fontSize: 11.5, letterSpacing: ".12em", textTransform: "uppercase", padding: "9px 15px", borderRadius: 6, cursor: "pointer", border: `1px solid ${view === k ? gold : line}`, background: view === k ? "rgba(227,185,92,.12)" : "transparent", color: view === k ? gold : dim }}>
              {label}
            </button>
          ))}
        </nav>

        {view === "oracle" && (
          <>
            <div style={{ textAlign: "center", fontSize: 12.5, color: dim, fontStyle: "italic", marginBottom: 14, lineHeight: 1.6 }}>
              {L.ui.dl(day.day)} · {L.ui.moonIn} {L.signs[day.moon]} ({phase(day)}) · {L.ui.dateNum} <b style={{ color: ink }}>{day.num}</b>
              {day.note && <div style={{ color: "#F4E9C8", marginTop: 4 }}>✦ {L.notes[day.note]}</div>}
              {scenario && <div style={{ color: gold, marginTop: 4 }}>{L.ui.scenario}</div>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "stretch" }}>
              {[{ t: ta, set: setA, val: a, slot: slotA, other: b }, null, { t: tb, set: setB, val: b, slot: slotB, other: a }].map((side, i) =>
                side === null ? (
                  <div key="vs" style={{ alignSelf: "center", fontFamily: "'Cinzel', serif", color: gold, fontSize: 17 }}>⚔</div>
                ) : (
                  <div key={i} style={{ border: `1px solid ${line}`, borderRadius: 12, padding: "15px 10px", textAlign: "center", background: "linear-gradient(180deg, rgba(36,28,94,.55), rgba(20,16,52,.75))" }}>
                    <div style={{ fontSize: 34 }}>{side.t.flag}</div>
                    <div style={{ fontSize: 28, color: gold, margin: "2px 0" }}>{side.t.glyph}</div>
                    <select value={side.val} onChange={(e) => { side.set(e.target.value); setRevealed(false); }} aria-label={i === 0 ? "Team A" : "Team B"} style={{ width: "100%", background: "#1B1548", color: ink, border: `1px solid ${side.slot.length > 1 ? gold : line}`, borderRadius: 6, padding: "8px 4px", fontFamily: "'Cinzel', serif", fontSize: 13.5, textAlign: "center", cursor: "pointer" }}>
                      {side.slot.map((id) => <option key={id} value={id} disabled={id === side.other}>{tName(TEAMS.find((t) => t.id === id))}</option>)}
                    </select>
                    <div style={{ fontSize: 11.5, color: dim, marginTop: 7, lineHeight: 1.5 }}>
                      {side.t.sign ? `${L.signs[side.t.sign]} · ${L.els[side.t.element]}` : L.ui.veiled}<br />{L.ui.founded} {side.t.founded}
                    </div>
                  </div>
                )
              )}
            </div>

            {!revealed ? (
              <div style={{ textAlign: "center", marginTop: 20 }}>
                <button onClick={() => setRevealed(true)} style={{ fontFamily: "'Cinzel', serif", fontSize: 13.5, letterSpacing: ".18em", textTransform: "uppercase", padding: "13px 28px", borderRadius: 8, border: `1px solid ${gold}`, background: "linear-gradient(180deg, rgba(227,185,92,.2), rgba(227,185,92,.08))", color: "#F4E9C8", cursor: "pointer" }}>
                  {L.ui.consult}
                </button>
              </div>
            ) : (
              <div style={{ marginTop: 22 }}>
                {[{ t: ta, r: ra, offset: 0 }, { t: tb, r: rb, offset: ra.lines.length }].map(({ t, r, offset }) => (
                  <div key={t.id} style={{ marginBottom: 14 }}>
                    <div style={{ fontFamily: "'Cinzel', serif", color: gold, fontSize: 12.5, letterSpacing: ".15em", marginBottom: 5 }}>{t.flag} {tName(t).toUpperCase()}</div>
                    {r.lines.map((l, j) => step > offset + j ? (
                      <div key={j} style={{ display: "flex", gap: 9, fontSize: 13.5, lineHeight: 1.5, padding: "4px 0", animation: "rise .45s ease both", borderBottom: "1px dashed #2B2560", alignItems: "flex-start" }}>
                        <span style={{ minWidth: 30, textAlign: "right", fontWeight: 600, color: l.pts > 0 ? "#8FD4A8" : l.pts < 0 ? "#E06A7E" : "#6E6F9A" }}>{l.pts > 0 ? `+${l.pts}` : l.pts}</span>
                        <Tag>{l.tag}</Tag>
                        <span style={{ fontStyle: "italic" }}>{l.text}</span>
                      </div>
                    ) : null)}
                  </div>
                ))}
                {step >= totalSteps && (
                  <div style={{ animation: "rise .6s ease both", marginTop: 18, border: `1px solid ${gold}`, borderRadius: 12, padding: "20px 16px", background: "radial-gradient(ellipse at top, rgba(227,185,92,.13), rgba(20,16,52,.4))" }}>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11.5, letterSpacing: ".3em", color: gold, textAlign: "center", marginBottom: 12 }}>{L.ui.chances} · {L.ui.dl(day.day).toUpperCase()}</div>
                    <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
                      <Bar p={pA} team={ta} align="left" />
                      <Bar p={1 - pA} team={tb} align="right" />
                    </div>
                    <div style={{ textAlign: "center", fontSize: 12.5, fontStyle: "italic", color: dim, marginTop: 12 }}>
                      {Math.abs(pA - 0.5) < 0.06 ? L.ui.vClose : Math.abs(pA - 0.5) < 0.2 ? L.ui.vLean : L.ui.vStrong}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {view === "odds" && (
          <div>
            <p style={{ textAlign: "center", fontSize: 13, fontStyle: "italic", color: dim, marginBottom: 16, lineHeight: 1.6 }}>{L.ui.oddsIntro}</p>
            {odds.map(({ t, p }, i) => {
              const fav = FAVES.includes(t.id);
              return (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 13px", borderRadius: 8, marginBottom: 6, background: fav ? "linear-gradient(90deg, rgba(227,185,92,.18), rgba(227,185,92,.04))" : "rgba(30,24,78,.5)", border: `1px solid ${fav ? gold : "#2B2560"}` }}>
                  <span style={{ fontFamily: "'Cinzel', serif", width: 24, color: fav ? gold : "#6E6F9A", fontSize: 14 }}>{i + 1}</span>
                  <span style={{ fontSize: 20 }}>{t.flag}</span>
                  <span style={{ flex: 1, fontSize: 15, color: fav ? gold : ink, fontWeight: fav ? 600 : 400 }}>
                    {tName(t)}{fav && " ✦"}
                    <span style={{ color: dim, fontSize: 12, fontWeight: 400 }}> · {t.sign ? `${t.glyph} ${L.signs[t.sign]}` : `🌑 ${L.els.mystery.toLowerCase()}`}</span>
                  </span>
                  <div style={{ width: "26%", height: 7, background: "#221B5C", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(100, p * 400)}%`, height: "100%", background: `linear-gradient(90deg, ${gold}, #F4E9C8)` }} />
                  </div>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: 14.5, width: 46, textAlign: "right", color: fav ? gold : "#C9CCE8" }}>{(p * 100).toFixed(0)}%</span>
                </div>
              );
            })}
            <p style={{ fontSize: 12, color: "#6E6F9A", fontStyle: "italic", textAlign: "center", marginTop: 12, lineHeight: 1.7 }}>{L.ui.oddsOutro}</p>
          </div>
        )}

        {view === "you" && (
          <div style={{ maxWidth: 480, margin: "0 auto" }}>
            <p style={{ textAlign: "center", fontSize: 13.5, fontStyle: "italic", color: dim, lineHeight: 1.6, marginBottom: 18 }}>{L.ui.youIntro}</p>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <input type="date" value={bday} onChange={(e) => setBday(e.target.value)} aria-label="Birthday" style={{ flex: 1, background: "#1B1548", color: ink, border: `1px solid ${line}`, borderRadius: 6, padding: "10px", fontFamily: "'Spectral', serif", fontSize: 14 }} />
              <select value={myTeam} onChange={(e) => setMyTeam(e.target.value)} aria-label="Team" style={{ flex: 1, background: "#1B1548", color: ink, border: `1px solid ${line}`, borderRadius: 6, padding: "10px 6px", fontFamily: "'Cinzel', serif", fontSize: 13 }}>
                {TEAMS.map((t) => <option key={t.id} value={t.id}>{t.flag} {tName(t)}</option>)}
              </select>
            </div>
            {reading && (
              <div style={{ animation: "rise .5s ease both", border: `1px solid ${gold}`, borderRadius: 12, padding: "20px 16px", background: "radial-gradient(ellipse at top, rgba(227,185,92,.12), rgba(20,16,52,.4))" }}>
                <div style={{ textAlign: "center", marginBottom: 14 }}>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11.5, letterSpacing: ".28em", color: gold }}>{L.ui.bond}</div>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: 42, color: ink }}>{reading.bond}%</div>
                  <div style={{ fontSize: 13, color: dim }}>{reading.me.gl} {L.ui.you} × {reading.team.flag} {reading.tn}</div>
                </div>
                {reading.lines.map((l, i) => (
                  <div key={i} style={{ display: "flex", gap: 9, fontSize: 14, lineHeight: 1.55, padding: "5px 0", borderBottom: "1px dashed #2B2560" }}>
                    <span>{l.good === true ? "✦" : l.good === false ? "☄" : "☽"}</span>
                    <span style={{ fontStyle: "italic" }}>{l.text}</span>
                  </div>
                ))}
                <div style={{ textAlign: "center", marginTop: 14 }}>
                  <ShareBtn k="bond" text={L.ui.shareBond(reading.bond, reading.tn)} />
                </div>
              </div>
            )}
            <p style={{ textAlign: "center", fontSize: 11.5, color: "#6E6F9A", marginTop: 12, lineHeight: 1.6 }}>{L.ui.stored}</p>
          </div>
        )}

        {/* ── DO YOU BELIEVE? ── */}
        <div style={{ marginTop: 38, border: `1px solid ${line}`, borderRadius: 12, padding: "20px 16px", textAlign: "center", background: "linear-gradient(180deg, rgba(36,28,94,.45), rgba(20,16,52,.65))" }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: ".25em", color: gold, textTransform: "uppercase", marginBottom: 8 }}>{L.ui.pollQ}</div>
          <p style={{ fontSize: 12.5, fontStyle: "italic", color: dim, maxWidth: 440, margin: "0 auto 14px", lineHeight: 1.65 }}>{L.ui.pollLuck}</p>
          {!vote ? (
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => setVote("yes")} style={{ fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: ".1em", padding: "11px 18px", borderRadius: 8, cursor: "pointer", border: `1px solid ${gold}`, background: "rgba(227,185,92,.1)", color: "#F4E9C8" }}>{L.ui.pollYes}</button>
              <button onClick={() => setVote("no")} style={{ fontFamily: "'Cinzel', serif", fontSize: 12, letterSpacing: ".1em", padding: "11px 18px", borderRadius: 8, cursor: "pointer", border: `1px solid ${line}`, background: "transparent", color: dim }}>{L.ui.pollNo}</button>
            </div>
          ) : (
            <div style={{ animation: "rise .5s ease both", fontSize: 13.5, lineHeight: 1.7, color: "#C9CCE8" }}>
              {vote === "yes" ? L.ui.replyYes : L.ui.replyNo}
              <div style={{ marginTop: 12 }}>
                <ShareBtn k="vote" text={vote === "yes" ? L.ui.shareYes : L.ui.shareNo} />
              </div>
            </div>
          )}
        </div>

        <footer style={{ marginTop: 42, fontSize: 11.5, color: "#6E6F9A", lineHeight: 1.8 }}>
          <div style={{ textAlign: "center" }}>
            {L.ui.footer1}
            <br />
            <b style={{ color: "#9A9BC4" }}>{L.ui.disclaimer}</b>
            <br />
            {L.ui.credit}{" "}
            <a href="https://www.linkedin.com/in/paula-campani/" target="_blank" rel="noopener noreferrer" style={{ color: gold, textDecoration: "none" }}>
              Paula Grapiglia Campani
            </a>{" "}{L.ui.afternoon}
          </div>
          <details style={{ maxWidth: 560, margin: "14px auto 0", border: "1px solid #2B2560", borderRadius: 8, padding: "8px 12px", background: "rgba(20,16,52,.5)" }}>
            <summary style={{ cursor: "pointer", fontFamily: "'Cinzel', serif", fontSize: 10.5, letterSpacing: ".15em", textTransform: "uppercase", color: "#9A9BC4" }}>
              {L.ui.legal} {lang !== "en" && <span style={{ textTransform: "none", letterSpacing: 0 }}>{L.ui.legalNote}</span>}
            </summary>
            <div style={{ fontSize: 11, lineHeight: 1.7, marginTop: 8, textAlign: "left" }}>
              <p style={{ margin: "0 0 8px" }}>
                <b>Entertainment only.</b> Everything on this site — scores, percentages, readings — is a playful astrological
                and numerological game with no predictive value. It is not betting, gambling, financial, or any other kind of
                advice, and it must not be used to inform wagers of any sort.
              </p>
              <p style={{ margin: "0 0 8px" }}>
                <b>Not a gambling service.</b> This site is not a sportsbook or gambling operator. No bets can be placed here,
                and it has no affiliation with, and receives no commission from, any betting operator. Any decision you make
                after visiting is entirely your own responsibility, and no liability is accepted for losses of any kind. If
                gambling is a problem for you or someone close to you, please seek support from a professional service in
                your country.
              </p>
              <p style={{ margin: "0 0 8px" }}>
                <b>Privacy.</b> This site sets no cookies and collects no personal data. Anything you type (such as a
                birthday) is processed only in your browser, is never transmitted, and disappears when you close the page.
                Aggregate, cookieless visit counts may be measured; no individual visitors are identified or tracked.
              </p>
              <p style={{ margin: 0 }}>
                <b>No official affiliation.</b> This is an independent fan project. It is not affiliated with, endorsed by,
                or connected to FIFA, any tournament organizer, or any national football federation. Team names are used
                only as factual references.
              </p>
            </div>
          </details>
        </footer>
      </div>
    </div>
  );
}
