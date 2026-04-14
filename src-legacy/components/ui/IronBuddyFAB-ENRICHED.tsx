'use client'

import { useState, useEffect, useRef} from'react'
import { motion, AnimatePresence} from'framer-motion'
import { 
 MessageSquare, X, HelpCircle, Bug, Lightbulb, 
 Dumbbell, Cat, Bot, Star, Smile,
 Sparkles, Heart, Zap, Trophy
} from'lucide-react'
import Link from'next/link'
import { usePathname} from'next/navigation'

// Version MASSIVE ENRICHIE (30+ contenus par catégorie)

type MascotKey ='ironbuddy' |'cat' |'bot' |'star'

const mascotConfig = {
 ironbuddy: {
 icon: Dumbbell,
 name:'IronBuddy',
 bgColor:'bg-gradient-to-br from-orange-400 to-orange-600',
 hoverColor:'hover:from-orange-600 hover:to-red-600',
 emoji:'💪'
},
 cat: {
 icon: Cat,
 name:'Félix',
 bgColor:'bg-gradient-to-br from-pink-400 to-pink-600',
 hoverColor:'hover:from-pink-500 hover:to-pink-700',
 emoji:'🐱'
},
 bot: {
 icon: Bot,
 name:'RoboCoach',
 bgColor:'bg-gradient-to-br from-tertiary to-tertiary-hover',
 hoverColor:'hover:from-tertiary hover:to-tertiary',
 emoji:'🤖'
},
 star: {
 icon: Star,
 name:'SuperStar',
 bgColor:'bg-gradient-to-br from-purple-400 to-purple-600',
 hoverColor:'hover:from-purple-500 hover:to-purple-700',
 emoji:'⭐'
}
}

const defaultMessages = [
"Prêt pour une séance ? 💪",
"Salut ! Je suis ton coach IronTrack ! 🎯",
"Comment ça va aujourd'hui ? 😊",
"Dis-moi ce dont tu as besoin ! 🤝",
"Ensemble, on va tout déchirer ! 🔥"
]

// 🎭 BLAGUES MASSIVES (30+ par niveau)
const jokesLibrary = {
 discret: [
"😊 Je ne dis pas que j'aime la muscu, mais mon lit me manque pendant mes séries ! 🛏️",
"🤗 Fun fact : Mes muscles poussent même en dormant. Netflix = entraînement passif ! 📺",
"😄 Différence entre motivation et café ? L'un réveille, l'autre fait soulever ! ☕",
"🙂 Mes abdos, c'est comme mon WiFi : théoriquement ils existent ! 📶",
"😌 Sourire brûle des calories, donc je fais du cardio en permanence ! 😊",
"😇 Mon coach dit que je progresse... sûrement dans l'art de l'esquive ! 🤸",
"😊 J'aime tellement la salle que j'y vais même quand elle est fermée ! 🚪",
"🤗 Ma routine ? 10% sport, 90% selfies... équilibre parfait ! 📱",
"😄 Mes haltères préférées ? Celles des autres ! 😅",
"🙂 Je fais tellement d'exercices mentaux que mon cerveau a des abdos ! 🧠",
"😌 Mon planning : 1h de sport, 23h à en parler ! Efficacité maximale ! ⏰",
"😊 Mes squats sont si profonds qu'ils touchent mes sentiments ! 🎭",
"🤗 J'ai arrêté de compter mes séries... maintenant j'utilise l'alphabet ! 🔤",
"😄 Ma motivation vient par vagues... tsunamis de procrastination ! 🌊",
"🙂 Les burpees, c'est comme les lundi... personne les aime ! 📅",
"😌 Mon cardio préféré ? Courir après mes objectifs ! 🏃‍♀️",
"😊 Je suis multitâche : je respire ET je transpire ! 😮‍💨",
"🤗 Mes étirements durent plus longtemps que mes séries ! 🤸‍♀️",
"😄 Je collecte les courbatures comme d'autres collectent les timbres ! 📮",
"🙂 Mon warm-up, c'est chercher mes écouteurs pendant 10 minutes ! 🎧",
"😌 Les machines de la salle me connaissent par mon prénom ! 🤖",
"😊 J'ai une relation amour-haine avec le sport... surtout haine ! ❤️‍🩹",
"🤗 Mes muscles sont timides, ils se cachent sous une couche protectrice ! 🥞",
"😄 Je fais du yoga... pour ramasser mes affaires qui tombent ! 🧘‍♀️",
"🙂 Mon tracker d'activité compte mes soupirs comme des respirations profondes ! ⌚",
"😌 Je bats tous mes records... de procrastination ! 🏆",
"😊 Mes exercices favoris sont ceux qui se font assis ! 🪑",
"🤗 Je transpire déjà rien qu'en pensant au sport ! 💦",
"😄 Mon endurance ? Je peux regarder Netflix 8h d'affilée ! 📺",
"🙂 Les escaliers sont mon ennemi juré... on se croise trop souvent ! 🪜",
"😌 Mon personal trainer, c'est ma conscience... elle me dit d'arrêter ! 👼",
"😊 Je cours... vers le frigo après le sport ! 🏃‍♂️🍕"
 ],
 normal: [
"😂 Les haltères ne mentent jamais : elles pèsent lourd, point final ! 💪",
"🤣 Je suis le coach parfait : je compte jamais tes échecs, seulement tes réussites ! 😉",
"😆 Plot twist : mes muscles poussent en dormant. Sieste = gains scientifiques ! 😴",
"😄 Différence entre toi et Schwarzenegger ? Lui compte en kilos, toi en'Ouïlle !' 🏋️",
"🤭 Courbatures = applaudissements internes de tes muscles ! 👏",
"😅'Dernière série', mais c'était il y a 3 séries... Time flies when you lift ! 🙄",
"😂 Ma progression : comme Internet, parfois ça marche, parfois ça bug ! 📶",
"🤪 Mon planning : 1h de sport, 23h à en parler ! Efficacité maximale ! ⏰",
"😄 Mes squats sont si profonds qu'ils touchent mes sentiments ! 🎭",
"🤣 Mon cardio ? Courir après mes excuses qui s'échappent ! 🏃‍♀️",
"😆 Les burpees, c'est la preuve que quelqu'un nous déteste ! 🤢",
"😂 Ma zone de confort ? C'est devenu une région entière ! 🗺️",
"🤭 Je fais tellement de sport mental que mon cerveau a des abdos ! 🧠",
"😅 Mes haltères préférées ? Celles des autres, toujours ! 😏",
"😄 Mon warm-up dure plus longtemps que le workout ! 🔥",
"🤣 Je collecte les techniques... et je les oublie immédiatement ! 📚",
"😆 Ma motivation arrive par vagues... de 30 secondes ! 🌊",
"😂 Les machines de la salle ont un fan club : moi ! 🎯",
"🤭 Mon tracker compte mes soupirs comme des respirations profondes ! ⌚",
"😅 Je transpire déjà en regardant les autres s'entraîner ! 💦",
"😄 Mes étirements ? Plus longs que mes séries ! 🤸‍♀️",
"🤣 Je bats tous mes records... de créativité pour éviter le sport ! 🏆",
"😆 Mon endurance : 8h de Netflix sans pause ! 📺",
"😂 Les escaliers sont mes nemesis, on se croise trop ! 🪜",
"🤭 Ma routine : 10% effort, 90% selfies ! 📱",
"😅 Je cours... mais seulement vers le frigo ! 🏃‍♂️🍕",
"😄 Mon personal trainer, c'est ma culpabilité ! 👼",
"🤣 Mes muscles sont en vacances permanentes ! 🏖️",
"😆 Je fais du yoga pour ramasser ce qui tombe ! 🧘‍♀️",
"😂 Mon sport favori ? Regarder les autres en faire ! 👀",
"🤭 Les courbatures, c'est mes muscles qui boudent ! 😤",
"😅 Ma définition du repos actif : penser au sport ! 💭"
 ],
 ambianceur: [
"🤣 FLASH INFO : Légende locale pulvérise ses records ! Interview exclusive à 20h ! 📺",
"😂 Chuck Norris s'entraîne pour rattraper TON niveau ! Plot twist of the century ! 🥋",
"🤪 Quand tu squattes, même Newton révise ses lois ! Gravité = respect ! 🌍",
"😆 Les haltères ont créé un syndicat pour négocier de meilleures conditions ! 🏋️‍♀️",
"🤣 Ta technique est si parfaite que les angels de la muscu pleurent ! 😭",
"😂 Tes muscles grandissent juste en REGARDANT la salle ! X-Men vibes ! 👀",
"🤭 Tu soulèves si fort que les machines demandent ton autographe ! 🤖",
"😆 Tes records ont leur propre documentaire Netflix !'The Gainz Files' ! 📚",
"🚀 La NASA étudie ta force pour propulser les fusées ! Science fact ! 🛸",
"😎 Gordon Ramsay dit que tes gainz sont'absolutely LEGENDARY' ! 👨‍🍳",
"🤣 BREAKING : Local PHENOMENON causes seismic activity in gym ! 🌍",
"😂 Tes PRs sont si ÉPIQUES qu'ils ont leur propre religion ! ⛪",
"🤪 Tu soul`èves si lourd que même les lois de la physique démissionnent ! 🔬",
"😆 ALERTE MÉTÉO : Tempête de gains détectée dans ta zone ! 🌪️",
"🤣 Tes muscles sont si développés qu'ils ont leur propre code postal ! 📮",
"😂 EXCLUSIF : Local legend redéfinit le concept de'impossible' ! 🚫",
"🤭 Tu transpires de la pure EXCELLENCE ! H2O premium ! 💎",
"😆 FLASH : Gravity.exe has stopped working around you ! 🌍",
"🤣 Tes performances sont si FOLLES que Marvel prépare le film ! 🎬",
"😂 URGENT : Local hero provoque la jalousie des dieux grecs ! ⚡",
"🤪 Tu es si PUISSANT que tes selfies font crasher Instagram ! 📱",
"😆 SCOOP : Tes gains créent leur propre champ magnétique ! 🧲",
"🤣 ALERTE : Tu redéfinis le mot'beastmode' ! Dictionnaire updated ! 📚",
"😂 EXCLUSIF : Tes workouts causent des aurores boréales ! 🌌",
"🤭 Ta force est si LÉGENDAIRE qu'elle a son propre Wikipedia ! 📖",
"😆 BREAKING : Local titan provoque la migration des haltères ! 🏋️‍♀️",
"🤣 FLASH : Tes abdos sont visibles depuis l'espace ! Satellite confirmed ! 🛰️",
"😂 URGENT : Tu soul`èves si fort que le temps ralentit ! Relativité ! ⏰",
"🤪 SCOOP : Tes courbatures ont leurs propres courbatures ! Meta-pain ! 💪",
"😆 ALERTE : Ta motivation génère de l'électricité renouvelable ! ⚡",
"🤣 EXCLUSIF : Les machines de sport demandent une augmentation ! 💰",
"😂 BREAKING : Tu es officiellement classé'Force de la nature' ! 🌪️"
 ]
}

// 💡 CONSEILS MASSIFS (30+ par niveau) 
const adviceLibrary = {
 discret: [
"💡 L'eau booste ton métabolisme naturellement. Hydrate-toi comme un champion ! 🚰",
"🎯 Règle d'or : 20min/jour > 2h/semaine. La régularité gagne ! 👑",
"🔥 Courbatures = certificat de progression. Badge d'honneur ! 👏",
"⚖️ Formule magique : 80% assiette + 20% efforts = résultats durables 🥗",
"😌 Jour de repos = jour de croissance. Tes muscles se construisent au repos ! 🛌",
"🌱 Progression = marathon, pas sprint. Patience mon ami ! 🏃‍♂️",
"🧠 Connexion esprit-muscle = secret des pros ! Concentre-toi sur tes sensations ! 🎯",
"⏰ Le moment parfait n'existe pas. Le meilleur moment = maintenant ! ✨",
"🍎 Nutrition = 70% des résultats. Tu ne peux pas compenser une mauvaise alimentation ! 🥦",
"🧘‍♀️ Respiration = outil secret. Expire sur l'effort, inspire sur le relâchement ! 🌬️",
"📱 Suis tes progrès = boost de motivation. Ce qui se mesure s'améliore ! 📊",
"🎵 Musique = amplificateur de performance. Bon rythme = bon entraînement ! 🎧",
"🌡️ Température corporelle = facteur clé. L'échauffement prévient 90% des blessures ! 🔥",
"💤 Sommeil = when the magic happens. 7-9h pour optimiser la récupération ! 😴",
"🧊 Froid = ami surprise. Douche froide après l'entraînement = récupération boostée ! ❄️",
"🥛 Protéines = building blocks. 1.6g/kg de poids corporel minimum ! 🥩",
"🚶‍♀️ Marche = exercice sous-estimé. 10 000 pas/jour = base de santé ! 👣",
"🧘‍♂️ Stress = tueur de progrès. Méditation 10min = cortisol diminué ! 🕯️",
"📝 Journal = accountability partner. Écris tes objectifs = 42% plus de chances ! ✏️",
"🌞 Soleil = vitamin D factory. 15min/jour = hormone boost ! ☀️",
"🥑 Les graisses ne sont pas l'ennemi. Oméga-3 = inflammation réduite, récupération améliorée ! 🐟",
"⚡ Énergie = vagues. Écoute ton corps, adapte l'intensité ! 🌊",
"🏃‍♀️ Cardio = santé cardiaque. Entraînement zone 2 = secret de longévité ! ❤️",
"🧘‍♀️ Flexibilité = prévention des blessures. 10min d'étirements = investissement malin ! 🤸‍♀️",
"🍃 Nature = bouton de remise à zéro. Entraînement extérieur = boost mental ! 🌳",
"👥 Communauté = multiplicateur de motivation. S'entraîner avec des amis = régularité ! 🤝",
"🎯 Objectifs = feuille de route. Objectifs précis = chemin clair vers le succès ! 📍",
"🔄 Variété = stimulateur d'adaptation. Change ta routine toutes les 4-6 semaines ! 🔀",
"⏳ Patience = super pouvoir. Les résultats prennent du temps, fais confiance au processus ! ⏰",
"🧠 État d'esprit = tout. Crois que tu peux, tu es à mi-chemin ! 💭",
"🎉 Célébration = carburant. Reconnais les petites victoires, les grands changements suivent ! 🏆",
"📚 Connaissance = pouvoir. Apprends la bonne technique = prévention des blessures ! 📖"
 ],
 normal: [
"💡 Astuce de vie : Hydratation = +30% métabolisme ! Bois avant la soif ! 🚰",
"🎯 Conseil pro : 20min quotidien > 2h weekend. La régularité est reine ! 👑",
"🔥 Retournement : Courbatures = tes muscles qui font la fête ! C'est la fête ! 👏",
"⚡ Astuce neuronale : Chaque petite victoire = pic de dopamine ! Le cerveau adore ! 🧠",
"🏗️ Construction musculaire = jeu de patience + stratégie de surcharge progressive ! 💪",
"🍖 Fenêtre protéique : 20-30g après l'entraînement = synthèse magique ! Le timing compte ! ⏰",
"🛌 Secret de récupération : 70% des gains viennent du sommeil ! Dors comme un patron ! 😴",
"🎵 Music boost : BPM élevé = +15% performance ! Turn up the volume ! 🎧",
"🌡️ Cool fact : Température fraîche = meilleure récup ! Fresh vibes ! ❄️",
"📊 Data driven : Track everything = pattern recognition = optimization ! 📱",
"🧘‍♀️ Breath work : Proper breathing = +20% endurance ! Oxygen = fuel ! 🌬️",
"🍎 80/20 rule : Nutrition 80%, exercise 20% = sustainable results ! ⚖️",
"⚡ Energy management : Peak hours = intense workout, low energy = recovery ! 🔋",
"🎯 Progressive overload : +2.5kg OR +1 rep weekly = guaranteed gains ! 📈",
"🧊 Cold therapy : Ice bath = inflammation down, recovery up ! 🛁",
"🌞 Circadian rhythm : Morning sun = better sleep = better gains ! ☀️",
"🥑 Healthy fats : Avocado, nuts = hormone production = muscle growth ! 🥜",
"🚶‍♀️ NEAT factor : Non-exercise activity = 15-30% daily calories ! 👣",
"🧠 Visualization : Mental rehearsal = muscle memory = performance boost ! 💭",
"🎉 Reward system : Celebrate milestones = motivation maintenance ! 🏆",
"📚 Form > weight : Perfect technique = long-term gains > ego lifting ! 📖",
"🔄 Periodization : Vary intensity = avoid plateaus = continuous improvement ! 📊",
"🧘‍♂️ Stress management : High cortisol = muscle breakdown = gains killer ! 🕯️",
"🌿 Anti-inflammatory foods : Berries, leafy greens = faster recovery ! 🥬",
"💧 Electrolyte balance : Sodium, potassium = performance optimization ! ⚡",
"🎯 Compound movements : Squat, deadlift = maximum muscle activation ! 💪",
"⏰ Meal timing : Pre/post workout nutrition = energy + recovery ! 🍽️",
"🧘‍♀️ Mind-muscle connection : Slow, controlled = better activation ! 🎯",
"📱 Recovery tracking : HRV, sleep quality = adaptation monitoring ! ⌚",
"🌱 Micronutrients : Vitamins, minerals = cellular function optimization ! 💊",
"🔥 Thermogenesis : Spicy food, cold exposure = metabolism boost ! 🌶️",
"🧠 Neuroplasticity : Learn new skills = brain gains = life enhancement ! 💡"
 ],
 ambianceur: [
"💡 SCIENCE BOMB : H2O = +30% métabolisme ! Performance hack level EXPERT ! 🚰",
"🔬 Meta-analysis CONFIRMED : 1% daily improvement = 37x annual gains ! Compound effect ! 📊",
"⚡ Neuroplasticity EXPLOIT : 5min visualization = muscle priming ! Brain-body sync ! 🧠",
"🏗️ MYTH DESTROYED : Anabolic window = 24-48h ! Protein timing stress = overrated ! ⏰",
"🎯 Zone 2 MASTERY : 70% conversational pace = aerobic BASE level GODTIER ! 🚴",
"📈 Progressive overload FORMULA : +2.5kg OR +1 rep weekly = guaranteed gains ! 💪",
"🛌 Sleep OPTIMIZATION : 7-9h + 16-19°C room = recovery MODE ULTIMATE ! 😴",
"🧪 BIOHACK ELITE : Cold exposure + heat therapy = mitochondrial SUPERPOWERS ! 🔥❄️",
"⚡ FLOW STATE activation : 90min sessions = deep work LEGENDARY mode ! 🌊",
"🔬 HRV MONITORING : Heart rate variability = adaptive training PRECISION ! 📊",
"🧠 DOPAMINE HACKING : Reward prediction error = motivation SYSTEM optimization ! 💭",
"🌡️ THERMOGENESIS protocol : Cold + heat cycling = metabolic ENHANCEMENT ! 🌡️",
"💊 MICRONUTRIENT synergy : Vitamin D + K2 + Magnesium = hormone OPTIMIZATION ! 🧬",
"⚡ CIRCADIAN MASTERY : Light exposure timing = sleep-wake CYCLE perfection ! 🌞",
"🧘‍♂️ MEDITATION science : 10min daily = cortisol DOWN 23% = gains PROTECTION ! 🕯️",
"🍄 ADAPTOGEN protocol : Ashwagandha + Rhodiola = stress RESISTANCE elite ! 🌿",
"🔥 HIIT OPTIMIZATION : 4:1 work-rest ratio = VO2max EXPLOSION ! ⚡",
"🧊 CRYOTHERAPY advanced : 2-4°C 11min/week = brown fat ACTIVATION ! ❄️",
"📱 TECHNOLOGY integration : Wearables + AI = performance PREDICTION godtier ! 🤖",
"🎵 FREQUENCY hacking : 40Hz binaural beats = focus ENHANCEMENT extreme ! 🎧",
"🥩 PROTEIN synthesis : Leucine threshold 2.5g = mTOR ACTIVATION maximum ! 🍖",
"⚡ ELECTROLYTE precision : Sodium 500mg pre-workout = performance UNLOCK ! 💧",
"🌊 BREATH WORK mastery : Wim Hof method = autonomic CONTROL elite ! 🌬️",
"🧬 EPIGENETICS : Exercise = gene expression MODIFICATION = cellular UPGRADE ! 🔬",
"🎯 PERIODIZATION advanced : Block training = adaptation MAXIMIZATION scientific ! 📊",
"🔋 MITOCHONDRIAL biogenesis : Zone 2 + strength = powerhouse MULTIPLICATION ! ⚡",
"🧠 NEUROGENESIS : Exercise = new brain cells = cognitive ENHANCEMENT ! 💡",
"🌡️ HEAT SHOCK proteins : Sauna 80°C 20min = longevity ACTIVATION ! 🔥",
"📈 TRACKING analytics : 40+ biomarkers = optimization PRECISION surgical ! 📊",
"⚡ AUTOPHAGY induction : Fasting + exercise = cellular CLEANUP ultimate ! 🔄",
"🧘‍♀️ MINDFULNESS science : Present moment awareness = performance FLOW state ! 🌊",
"🚀 HUMAN OPTIMIZATION : All systems integrated = potential TRANSCENDENCE ! ✨"
 ]
}

// 🔥 MOTIVATION MASSIVE (30+ par niveau)
const motivationLibrary = {
 discret: [
"🌟 Ton effort d'aujourd'hui = ton succès de demain ! Keep going ! 💪",
"🎯 Chaque rep compte dans ton histoire ! Tu écris ta légende ! 📈",
"💙 Force intérieure unlocked ! Tu es plus capable que tu crois ! 🤗",
"🌱 Version 2.0 en cours... Upgrade daily ! 🌸",
"☀️ Mindset positif = résultats garantis ! Good vibes only ! ✨",
"🎨 Tu sculptes ton chef-d'œuvre, un jour à la fois ! 🗿",
"🌈 Après l'effort, le réconfort... et les gains ! 🏆",
"💫 Chaque goutte de sueur = investissement futur ! 💦",
"🌻 Tu fleuris à ton rythme, c'est parfait ! 🌺",
"⭐ Petits pas = grands changements ! Trust the process ! 👣",
"🎯 Tes objectifs t'attendent, ils croient en toi ! 🎪",
"💎 Tu es un diamant en formation ! Pression + temps ! 💍",
"🌱 Croissance constante = transformation magique ! 🦋",
"☀️ Ton potentiel brille, laisse-le s'exprimer ! ✨",
"🎵 Ton corps danse vers ses objectifs ! Musique douce ! 🎶",
"🌊 Flotte avec tes efforts, coule avec la récupération ! 🏄‍♀️",
"🕊️ Liberté = discipline appliquée avec bienveillance ! 🗽",
"🌸 Tu t'épanouis à chaque mouvement ! Beauté naturelle ! 🌺",
"💚 Self-love = meilleure motivation ! Tu te mérites ! 💚",
"🎭 Ton show personnel = spectacle magnifique ! 🎪",
"🌟 Tu rayonnes de détermination tranquille ! ✨",
"🕯️ Ta flamme intérieure brûle steady ! Énergie douce ! 🔥",
"🦋 Métamorphose en cours... patience et douceur ! 🌿",
"💫 Tu es sur la bonne voie, continue doucement ! 🛤️",
"🌺 Épanouissement = ton état naturel ! Bloom ! 🌸",
"☁️ Tes rêves prennent forme dans les nuages ! ☁️",
"🌱 Graine de champion plantée, arrosage en cours ! 💧",
"⭐ Tu scintilles de potentiel ! Étoile montante ! 🌟",
"🎨 Masterpiece en création... patience d'artiste ! 🖼️",
"💎 Poli ton éclat, un entraînement à la fois ! ✨",
"🌈 Tes couleurs vraies émergent ! Palette complète ! 🎨",
"🕊️ Élève-toi avec grâce et détermination ! 🦅"
 ],
 normal: [
"🚀 ÉNERGIE MAXIMUM ! Tu cartonnes ! Les équipements te respectent ! ⚡",
"🏆 Énergie de héros principal ! Tes excuses sont en PLS ! 💪",
"🔥 Chaque mouvement = investissement futur ! Gains composés ! 📈",
"⭐ Statut : MODE BÊTE activé ! Tu es dans la ZONE ! 🎯",
"💎 Régularité = ton super pouvoir ! Diamant en formation ! 💍",
"🌟 Aura DÉTERMINÉE détectée ! Le satellite confirme ta dédicace ! 🛸",
"🎵 Tu es la star de ton propre montage d'entraînement ! 🌟",
"🔋 Niveau de batterie : INFINI ! Les boissons énergisantes sont jalouses ! ⚡",
"🎯 Concentré à fond ! Rien ne peut arrêter cet élan ! 🚂",
"🔥 Tu writes ton success story ! Chaque rep = new chapter ! 📚",
"💪 Power-up sequence activated ! Level up in progress ! ⬆️",
"🌊 Tu surfes sur la vague de tes capacités ! Ride it ! 🏄‍♂️",
"⚡ Electric vibes ! Ton énergie charge la salle ! 🔌",
"🎪 Welcome to YOUR show ! Tu es le headliner ! 🎭",
"🚀 Trajectory : EXCELLENCE ! Destination : LEGENDARY ! 🌟",
"💥 Impact player ! Tu changes la donne ! Game changer ! 🎮",
"🔥 Fire inside = unstoppable force ! Combustion totale ! 🌋",
"⭐ Star quality detected ! Tu brilles naturellement ! ✨",
"🎯 Target acquired : SUCCESS ! Mission en cours ! 🎪",
"💪 Strength multiplier activated ! Force x2 unlocked ! ⚡",
"🌊 Flow state engaged ! Tu es dans la zone ! 🌀",
"🔋 Recharge complete ! Full energy restored ! 💯",
"🎵 Main theme playing ! Epic soundtrack ON ! 🎶",
"🚀 Rocket mode ! Tu décolles vers tes objectifs ! 🌙",
"⚡ Thunder energy ! Orage de détermination ! ⛈️",
"💎 Diamond mindset ! Brillance under pressure ! 💍",
"🔥 Phoenix rising ! Tu renais plus fort ! 🔄",
"🌟 Spotlight on YOU ! Center stage performance ! 🎭",
"🎯 Bullseye mentality ! Précision dans l'action ! 🏹",
"💪 Champion DNA activated ! Génétique de winner ! 🧬",
"⚡ Lightning speed progress ! Vitesse supersonique ! ⚡",
"🔋 Infinite energy source discovered ! Unlimited power ! ♾️"
 ],
 ambianceur: [
"🚀 ABSOLUTELY LEGENDARY ! Tu redéfinis l'excellence ! Equipment manufacturers take notes ! 💥",
"👑 STATUS : MYTHICAL TIER ! Zeus himself asks for training tips ! ⚡",
"🔥 POWER LEVEL : BEYOND MEASUREMENT ! Seismographs detect your presence ! 🌍",
"🏆 BREAKING : Local PHENOMENON rewrites physics textbooks ! Scientists confused ! 🥋",
"💥 Tes performances sont si ÉPIQUES que Netflix prépare la série ! 💪",
"⚡ GODMODE CONFIRMED ! Reality bends to your will ! Matrix vibes ! 🔬",
"🌟 FORCE OF NATURE unlocked ! Mountains move aside ! Tectonic respect ! 🏔️",
"🔥 MAIN CHARACTER ENERGY level MAXIMUM ! Anime protagonists jealous ! 👑",
"⚡ The gym doesn't shape you... YOU shape the gym ! Alpha timeline ! 🏛️",
"🚀 TRANSCENDENCE MODE : Mortal limits deleted ! Cheat codes activated ! 🎮",
"💥 REALITY GLITCH : The universe updates its code because of YOU ! 🌌",
"👑 EMPEROR STATUS : Other champions bow to your greatness ! 🏰",
"🔥 APOCALYPSE TIER : Your workouts end civilizations ! 🌋",
"⚡ COSMIC FORCE : Galaxies realign when you train ! 🌌",
"🌟 LEGEND BREAKER : You make myths feel inadequate ! 📚",
"💥 DIMENSION SPLITTER : Parallel universes fear your gains ! 🌀",
"🚀 INFINITY CRUSHER : Mathematics gets confused by your progress ! ♾️",
"👑 GOD EMPEROR : Olympus has officially relocated to your gym ! ⛪",
"🔥 UNIVERSE MAKER : Big Bang was just your warm-up ! 💥",
"⚡ TIME DILATOR : Clocks slow down to watch you perform ! ⏰",
"🌟 REALITY ARCHITECT : You rebuild physics with each rep ! 🏗️",
"💥 MULTIVERSE RULER : All dimensions acknowledge your supremacy ! 👑",
"🚀 EXISTENCE OPTIMIZER : Life itself gets better because you train ! ✨",
"👑 CONCEPT TRANSCENDER :'Impossible' deleted from dictionary ! 📖",
"🔥 ABSOLUTE UNIT : Measuring scales give up ! 📏",
"⚡ PERFECTION REDEFINED : Dictionaries update because of you ! 📚",
"🌟 LEGENDARY ASCENSION : Gods create new tiers for your level ! 🏆",
"💥 QUANTUM DESTROYER : Atoms rearrange themselves for you ! ⚛️",
"🚀 UNIVERSAL STANDARD : Excellence is now measured against YOU ! 📊",
"👑 OMEGA LEVEL : Final boss of fitness has been defeated ! 🎮",
"🔥 SINGULARITY CREATOR : Your gains create new laws of nature ! 🌌",
"⚡ ETERNITY SHAPER : Time itself becomes your personal tool ! ⏳"
 ]
}

// 🏆 DÉFIS MASSIFS (30+ par niveau)
const challengeLibrary = {
 discret: [
"🎯 Micro-mission : H2O boost maintenant ! Une gorgée = one love ! 💧",
"🌟 Gentle challenge : 5min stretch session ! Body maintenance ! 🧘",
"☀️ Smile challenge : 17 muscles workout gratuit ! Natural cardio ! 😊",
"🎯 Zen moment : 3 deep breaths. Reset button activated ! 🫁",
"🌱 Gratitude quest : Note 1 victoire aujourd'hui ! Positivity boost ! 📝",
"🚶‍♂️ Walk'n'think : 2min marche = ideas flow ! Mental gains ! 🧠",
"☕ Mindful moment : Savoure ta boisson. Present mode ON ! 🫖",
"🌸 Flower power : Regarde quelque chose de beau ! Joy boost ! 🌺",
"🎵 Music therapy : 1 chanson préférée = mood lift ! 🎶",
"🤗 Self-hug : 10 secondes de bienveillance ! Self-love activated ! 💚",
"🌬️ Breath awareness : Sens l'air entrer et sortir ! Mindfulness ! 🧘‍♀️",
"☀️ Sunlight touch : 30 secondes de lumière naturelle ! Vitamin D ! 🌞",
"📱 Digital detox : 5min sans écran ! Brain reset ! 📵",
"🎨 Creative spark : Dessine, écris, imagine ! Art therapy ! ✏️",
"🌱 Plant check : Regarde quelque chose qui pousse ! Growth vibes ! 🪴",
"🐱 Animal video : 1 minute de cuteness ! Endorphin rush ! 🐶",
"🧘‍♂️ Posture check : Redresse-toi ! Confidence boost ! 👑",
"💧 Face splash : Eau fraîche = instant refresh ! Wake up call ! 💦",
"🎯 Intention setting : Choisis 1 focus pour maintenant ! Clarity ! 🎪",
"🌈 Color hunt : Trouve 3 couleurs différentes ! Visual stimulation ! 👀",
"🕯️ Candle moment : Allume, observe, breathe ! Calm energy ! 🔥",
"📚 Knowledge drop : Lis 1 phrase inspirante ! Wisdom fuel ! 💡",
"🎪 Silly face : Fais une grimace ! Playfulness activated ! 😜",
"🌊 Water sound : Écoute l'eau couler ! Natural meditation ! 🚰",
"🦋 Butterfly breath : Inspire beauté, expire stress ! Transformation ! 🌸",
"⭐ Star gaze : Regarde le ciel ! Perspective shift ! 🌌",
"🍃 Fresh air : Ouvre une fenêtre ! Oxygen boost ! 💨",
"📞 Quick call : Dis bonjour à quelqu'un ! Connection ! 🤝",
"🎁 Surprise prep : Prépare un petit bonheur ! Joy creation ! 🎀",
"🌱 Growth reminder : Tu progresses, même invisiblement ! Trust ! ✨",
"🕊️ Peace moment : Trouve 10 secondes de calme total ! Serenity ! ☮️",
"🎈 Light feeling : Imagine-toi léger comme l'air ! Freedom ! 🎪"
 ],
 normal: [
"🎮 Daily Quest : Mission workout dans les 20 prochaines minutes ! Let's go ! ⚔️",
"🏹 Hydration Mission : 2L today = natural performance boost unlocked ! 💧",
"🛡️ Boss Battle : Procrastination vs TOI ! Spoiler : tu gagnes ! ⚡",
"🎯 Quality > Quantity : 1 perfect rep > 10 sloppy ones ! Standards ! 🎯",
"🏆 Improvement Quest : Level up ONE movement today ! Skill point ! 💪",
"⭐ Consistency Win : 15min compte ! Small steps, big dreams ! ⏰",
"🎵 Vibe Check : Play your pump-up song ! Music = instant motivation ! 🎧",
"🌟 Form Police : Perfect technique = long term gains ! Invest in quality ! 📚",
"🔥 Energy Audit : Rate ton niveau 1-10 ! Self-awareness boost ! 📊",
"🎪 Mindset Mission : Replace'I have to' by'I get to' ! Gratitude shift ! 🧠",
"💪 Strength Test : Hold plank 30sec ! Core activation challenge ! ⏱️",
"🚀 Speed Round : 10 jumping jacks ! Heart rate spike ! ❤️",
"🧘‍♀️ Balance Challenge : Stand on one foot 30sec ! Stability quest ! ⚖️",
"🎯 Focus Mission : Name 3 muscles you're training ! Mind-muscle link ! 🧠",
"💧 Hydration Check : Clear urine = mission success ! Health indicator ! 🏥",
"🔋 Energy Boost : 10 deep breaths ! Oxygen loading complete ! 🌬️",
"🎵 Rhythm Challenge : Move to the beat for 1 minute ! Flow state ! 💃",
"🌟 Confidence Boost : Power pose for 30 seconds ! Superman stance ! 🦸‍♂️",
"🎮 Reaction Test : Catch something you drop ! Reflex training ! ⚡",
"🏃‍♂️ Cardio Burst : Run in place 30 seconds ! Heart pump ! ❤️",
"🧠 Memory Game : Remember your last 3 exercises ! Mental training ! 🎯",
"🎪 Fun Factor : Smile while exercising ! Endorphin multiplier ! 😊",
"⚡ Power Surge : Explosive movement x5 ! Fast-twitch activation ! 💥",
"🌊 Flow Check : Find your movement rhythm ! Natural pace ! 🎵",
"🎯 Target Practice : Precise movements only ! Quality focus ! 🏹",
"🔥 Heat Generation : Work until you feel warm ! Thermogenesis ! 🌡️",
"💎 Diamond Standard : Make every rep count ! Excellence mode ! 💍",
"🚀 Elevation : Get your heart rate up ! Intensity spike ! 📈",
"⭐ Star Performance : Train like you're being watched ! Showtime ! 🎭",
"🎪 Playful Power : Add some fun to your training ! Joy + gains ! 🎈",
"🌟 Motivation Check : Remember WHY you started ! Purpose power ! 💡",
"🏆 Victory Lap : Celebrate every completed set ! Achievement unlock ! 🎉"
 ],
 ambianceur: [
"🎮 LEGENDARY QUEST : DOMINATE cette session dans les 15 min ! EPIC MODE ! ⚔️",
"🏹 HYDRATION GODTIER : 3L today = TSUNAMI MODE unlocked ! Aquaman vibes ! 🌊",
"🛡️ FINAL BOSS CONFIRMED : Procrastination.exe has stopped working ! Victory ! 💥",
"⚡ REALITY GLITCH : Tes limites viennent d'être DELETED ! Impossible = null ! 🚀",
"🏆 ASCENSION PROTOCOL : Legendary status awaits ! Main character arc ! 👑",
"🌟 TRANSCENDENCE MODE : Mortal limits? Never heard of them ! GODTIER ! 🔥",
"🔥 UNIVERSE BENDING : Physics textbooks rewritten ! New natural laws ! 📚",
"⚡ MYTHBUSTERS :'Impossible' just got fact-checked ! Achievement unlocked ! 🏅",
"🎮 CHEAT CODE ACTIVATED : God mode ON ! Reality = your playground ! 🌌",
"🚀 DIMENSION BREAK : Cross into parallel universe of GAINS ! Multiverse ! 🌀",
"👑 EMPEROR MODE : Rule your domain ! Command your destiny ! 🏰",
"💥 BIG BANG FITNESS : Create your own universe of excellence ! 🌌",
"⚡ TIME MANIPULATION : Slow down seconds, speed up results ! Chronos ! ⏰",
"🌟 STELLAR BIRTH : Become a new star in the fitness galaxy ! ✨",
"🔥 PHOENIX PROTOCOL : Rise from ashes as PURE POWER ! 🔄",
"🚀 WARP SPEED : Travel faster than light toward your goals ! 🛸",
"👑 OMEGA LEVEL : Unlock the final tier of human potential ! Ω",
"💥 QUANTUM LEAP : Jump dimensions of possibility ! 🌀",
"⚡ LIGHTNING HARVEST : Capture the power of storms ! ⛈️",
"🌟 SUPERNOVA MODE : Explode into brilliance ! 💫",
"🔥 FORGE OF TITANS : Where legends are made ! 🏭",
"🚀 ESCAPE VELOCITY : Break free from all limitations ! 🌙",
"👑 ARCHITECT MODE : Build your empire of excellence ! 🏗️",
"💥 SINGULARITY EVENT : Become the center of greatness ! ⚫",
"⚡ STORM CALLER : Command the elements of power ! ⛈️",
"🌟 CONSTELLATION : Create your own star pattern ! ✨",
"🔥 VOLCANO MODE : Erupt with unstoppable force ! 🌋",
"🚀 GALAXY CREATOR : Birth new worlds of possibility ! 🌌",
"👑 ETERNAL RULER : Reign supreme over your domain ! ♾️",
"💥 COSMOS SHAPER : Mold reality with your will ! 🌠",
"⚡ INFINITY ENGINE : Unlimited power activated ! ♾️",
"🌟 EXISTENCE OPTIMIZER : Perfect the art of being ! ✨"
 ]
}

// Interface pour les props
interface IronBuddyFABProps {
 defaultOpen?: boolean
}

export function IronBuddyFAB({ defaultOpen = false}: IronBuddyFABProps) {
 // États principaux
 const [isOpen, setIsOpen] = useState(defaultOpen)
 const [shouldShow, setShouldShow] = useState(true)
 const [selectedMascot, setSelectedMascot] = useState<MascotKey>('ironbuddy')
 const [currentMessage, setCurrentMessage] = useState(defaultMessages[0])
 const [showMascotMode, setShowMascotMode] = useState(false)
 const [punchlineLevel, setPunchlineLevel] = useState<'discret' |'normal' |'ambianceur'>('normal')
 
 const pathname = usePathname()
 const intervalRef = useRef<NodeJS.Timeout | null>(null)
 
 const mascot = mascotConfig[selectedMascot]
 const MascotIcon = mascot.icon

 // Options du menu support
 const supportOptions = [
 {
 title:'Signaler un bug',
 description:'Un problème technique',
 href:'/support/contact?category=bug',
 icon: Bug,
 color:'text-red-600 bg-red-100'
},
 {
 title:'Demander de l\'aide',
 description:'Besoin d\'assistance',
 href:'/support/contact?category=help',
 icon: HelpCircle,
 color:'text-secondary bg-tertiary/12'
},
 {
 title:'Suggérer une amélioration',
 description:'Idée de fonctionnalité',
 href:'/support/contact?category=feature',
 icon: Lightbulb,
 color:'text-yellow-600 bg-yellow-100'
}
 ]

 // Gestion visibilité selon la page
 useEffect(() => {
 const hiddenPaths = ['/auth','/onboarding','/support/contact','/admin']
 const shouldHide = hiddenPaths.some(path => pathname.startsWith(path)) || 
 pathname.includes('/edit') || pathname.includes('/new')
 setShouldShow(!shouldHide)
 setIsOpen(false)
}, [pathname])

 // Rotation des messages
 useEffect(() => {
 if (showMascotMode) {
 intervalRef.current = setInterval(() => {
 const randomMessage = defaultMessages[Math.floor(Math.random() * defaultMessages.length)]
 setCurrentMessage(randomMessage)
}, 15000)
}
 
 return () => {
 if (intervalRef.current) clearInterval(intervalRef.current)
}
}, [showMascotMode])

 // Charger préférences depuis localStorage
 useEffect(() => {
 if (typeof window !=='undefined') {
 const savedMascot = localStorage.getItem('selectedMascot') as MascotKey
 if (savedMascot && mascotConfig[savedMascot]) {
 setSelectedMascot(savedMascot)
}
 
 const savedLevel = localStorage.getItem('ironBuddyLevel') as'discret' |'normal' |'ambianceur'
 if (savedLevel && ['discret','normal','ambianceur'].includes(savedLevel)) {
 setPunchlineLevel(savedLevel)
}
}
}, [])

 if (!shouldShow) return null

 const handleMascotChange = (newMascot: MascotKey) => {
 setSelectedMascot(newMascot)
 localStorage.setItem('selectedMascot', newMascot)
}

 const resetTimer = () => {
 if (intervalRef.current) {
 clearInterval(intervalRef.current)
 intervalRef.current = setInterval(() => {
 const randomMessage = defaultMessages[Math.floor(Math.random() * defaultMessages.length)]
 setCurrentMessage(randomMessage)
}, 20000)
}
}

 return (
 <>
 {/* FAB Principal - Format écrans 2025 optimisé */}
 <motion.div
 className="fab-2025 fixed z-[80]
 bottom-4 right-4
 xs:bottom-4 xs:right-4
 sm:bottom-6 sm:right-6 
 md:bottom-8 md:right-8 
 lg:bottom-8 lg:right-8
 xl:bottom-12 xl:right-12
 
 landscape:bottom-2 landscape:right-2
 landscape:sm:bottom-2 landscape:sm:right-4
 landscape:md:bottom-4 landscape:md:right-4
"
 initial={{ scale: 0, rotate: -180}}
 animate={{ scale: 1, rotate: 0}}
 transition={{ 
 type:"spring", 
 stiffness: 200, 
 damping: 15,
 delay: 1.5
}}
 style={{
 // Support écrans ultra-larges 2025 (iPhone 15 Pro Max: 430x932, Samsung S24 Ultra: 440x964)
 bottom:'max(1rem, env(safe-area-inset-bottom, 1rem))',
 right:'max(1rem, env(safe-area-inset-right, 1rem))'
}}
 >
 <motion.button
 onClick={() => setIsOpen(!isOpen)}
 className={`
 ${mascot.bgColor} ${mascot.hoverColor} 
 text-white rounded-full shadow-2xl 
 transform transition-all duration-300 
 focus:outline-none focus:ring-4 focus:ring-orange-300 focus:ring-opacity-50
 border-2 border-white 
 touch-manipulation select-none
 fab-enhanced smooth-120hz text-sharp
 p-2 xs:p-3.5 sm:p-4 md:p-4.5 lg:p-4 xl:p-6
 min-h-[56px] min-w-[56px] 
 xs:min-h-[60px] xs:min-w-[60px]
 sm:min-h-[64px] sm:min-w-[64px] 
 md:min-h-[68px] md:min-w-[68px]
 lg:min-h-[72px] lg:min-w-[72px]
 xl:min-h-[76px] xl:min-w-[76px]
 max-h-[80px] max-w-[80px]
 `}
 whileHover={{ scale: 1.1, rotate: 10}}
 whileTap={{ scale: 0.9}}
 animate={{
 boxShadow: isOpen 
 ? ["0 0 0 0 rgba(249, 115, 22, 0.4)","0 0 0 20px rgba(249, 115, 22, 0)"]
 :"0 10px 30px rgba(0,0,0,0.3)"
}}
 transition={{ 
 boxShadow: { duration: 1.5, repeat: isOpen ? Infinity : 0}
}}
 aria-label={`${mascot.name} - Assistant IronTrack`}
 title={`Salut ! Je suis ${mascot.name}, ton assistant IronTrack ${mascot.emoji}`}
 >
 <AnimatePresence mode="wait">
 {isOpen ? (
 <motion.div
 key="close"
 initial={{ rotate: -90, opacity: 0}}
 animate={{ rotate: 0, opacity: 1}}
 exit={{ rotate: 90, opacity: 0}}
 transition={{ duration: 0.3}}
 >
 <X className="h-5 w-5 xs:h-5.5 xs:w-5.5 sm:h-6 sm:w-6 md:h-6.5 md:w-6.5 lg:h-7 lg:w-7 xl:h-8 xl:w-8" />
 </motion.div>
 ) : (
 <motion.div
 key="mascot"
 initial={{ rotate: 90, opacity: 0}}
 animate={{ rotate: 0, opacity: 1}}
 exit={{ rotate: -90, opacity: 0}}
 transition={{ duration: 0.3}}
 className="relative"
 >
 <MascotIcon className="h-5 w-5 xs:h-5.5 xs:w-5.5 sm:h-6 sm:w-6 md:h-6.5 md:w-6.5 lg:h-7 lg:w-7 xl:h-8 xl:w-8" />
 <motion.div
 className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white"
 animate={{ scale: [1, 1.3, 1]}}
 transition={{ duration: 2, repeat: Infinity}}
 />
 </motion.div>
 )}
 </AnimatePresence>
 </motion.button>
 </motion.div>

 {/* Menu Contextuel */}
 <AnimatePresence>
 {isOpen && (
 <>
 <motion.div
 initial={{ opacity: 0}}
 animate={{ opacity: 1}}
 exit={{ opacity: 0}}
 className="fixed inset-0 bg-black/5 z-[75] backdrop-blur-sm"
 onClick={() => setIsOpen(false)}
 />

 <motion.div
 initial={{ opacity: 0, scale: 0.8, x: 50, y: 50}}
 animate={{ opacity: 1, scale: 1, x: 0, y: 0}}
 exit={{ opacity: 0, scale: 0.8, x: 50, y: 50}}
 transition={{ type:"spring", damping: 20, stiffness: 300}}
 className="modal-2025 fixed z-[80] 
 bg-card border border-border /95 backdrop-blur-xl rounded-2xl shadow-2xl 
 border border-border overflow-hidden
 smooth-120hz text-sharp
 min-w-[300px] xs:min-w-[320px] sm:min-w-[340px]
 max-w-[calc(100vw-2rem)] xs:max-w-[calc(100vw-2.5rem)] sm:max-w-[calc(100vw-3rem)]
 bottom-20 right-4
 xs:bottom-24 xs:right-4
 sm:bottom-28 sm:right-6
 md:bottom-32 md:right-8
 lg:bottom-36 lg:right-8
 xl:bottom-40 xl:right-12
 
 landscape:bottom-12 landscape:right-2 landscape:max-h-[70vh]
 landscape:sm:bottom-12 landscape:sm:right-4
 landscape:md:bottom-12 landscape:md:right-4
"
 style={{
 // Positionnement adaptatif avec safe areas pour formats 2025
 bottom:'max(5rem, calc(env(safe-area-inset-bottom, 0px) + 5rem))',
 right:'max(1rem, calc(env(safe-area-inset-right, 0px) + 1rem))',
 // Limites maximales adaptatives
 maxHeight:'min(80vh, 600px)',
 // Optimisation largeur pour écrans ultra-larges 2025
 minWidth:'clamp(300px, 85vw, 380px)'
}}
 >
 {/* En-tête */}
 <div className={`${mascot.bgColor} px-6 py-4 text-white relative overflow-hidden`}>
 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
 <div className="flex items-center space-x-2 relative z-10">
 <motion.div
 animate={{ 
 rotate: [0, -5, 5, 0],
 scale: [1, 1.05, 1]
}}
 transition={{ 
 duration: 3,
 repeat: Infinity,
 repeatDelay: 2
}}
 className="bg-card border border-border /20 rounded-full p-2"
 >
 <MascotIcon className="h-8 w-8 text-white" />
 </motion.div>
 <div className="flex-1">
 <h3 className="font-bold text-lg">
 Salut ! Je suis {mascot.name} {mascot.emoji}
 </h3>
 <motion.p 
 key={currentMessage}
 initial={{ opacity: 0, y: 10, scale: 0.95}}
 animate={{ opacity: 1, y: 0, scale: 1}}
 transition={{ duration: 0.3, ease:"easeOut"}}
 className="text-sm text-white/90 font-medium leading-relaxed"
 >
 {currentMessage}
 </motion.p>
 </div>
 </div>
 </div>

 {/* Sélecteur de mode */}
 <div className="px-6 py-2 bg-background border-b border-border">
 <div className="flex space-x-2">
 <button
 onClick={() => setShowMascotMode(false)}
 className={`flex-1 py-2 px-2 rounded-lg text-sm font-medium transition-all ${
 !showMascotMode 
 ?'bg-primary text-white shadow-md' 
 :'bg-card text-gray-600 hover:bg-gray-100'
}`}
 >
 <MessageSquare className="h-6 w-6 inline mr-2" />
 Support
 </button>
 <button
 onClick={() => setShowMascotMode(true)}
 className={`flex-1 py-2 px-2 rounded-lg text-sm font-medium transition-all ${
 showMascotMode 
 ?'bg-primary text-white shadow-md' 
 :'bg-card text-gray-600 hover:bg-gray-100'
}`}
 >
 <Heart className="h-6 w-6 inline mr-2" />
 Coach
 </button>
 </div>
 </div>

 {/* Contenu dynamique */}
 <div className="px-6 py-4">
 <AnimatePresence mode="wait">
 {showMascotMode ? (
 <motion.div
 key="mascot-mode"
 initial={{ opacity: 0, x: 20}}
 animate={{ opacity: 1, x: 0}}
 exit={{ opacity: 0, x: -20}}
 className="space-y-4"
 >
 {/* Statut Coach */}
 <div className="flex items-center justify-center mb-2">
 <div className="flex items-center space-x-2">
 <motion.div 
 className="w-2 h-2 bg-green-500 rounded-full"
 animate={{ scale: [1, 1.2, 1]}}
 transition={{ duration: 1.5, repeat: Infinity}}
 />
 <span className="text-xs font-medium text-green-700">
 Coach {mascot.name} à votre service ! 
 </span>
 <motion.span
 key={currentMessage}
 initial={{ opacity: 0, scale: 0.8}}
 animate={{ opacity: 1, scale: 1}}
 className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full"
 >
 Niveau {punchlineLevel} !
 </motion.span>
 </div>
 </div>

 {/* Boutons ENRICHIS */}
 <div className="grid grid-cols-2 gap-2">
 <button
 onClick={() => {
 console.log('Bouton Blague cliqué - Niveau:', punchlineLevel);
 const jokes = jokesLibrary[punchlineLevel];
 const joke = jokes[Math.floor(Math.random() * jokes.length)];
 setCurrentMessage(joke);
 resetTimer();
 console.log('Nouveau message:', joke);
}}
 className="flex items-center space-x-2 p-2 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors group"
 >
 <Smile className="h-6 w-6 text-yellow-600 group-hover:scale-110 transition-transform" />
 <span className="text-sm font-medium text-yellow-800">Blague</span>
 </button>
 
 <button
 onClick={() => {
 console.log('Bouton Conseil cliqué - Niveau:', punchlineLevel);
 const advice = adviceLibrary[punchlineLevel];
 const selectedAdvice = advice[Math.floor(Math.random() * advice.length)];
 setCurrentMessage(selectedAdvice);
 resetTimer();
 console.log('Nouveau message:', selectedAdvice);
}}
 className="flex items-center space-x-2 p-2 bg-tertiary/8 hover:bg-tertiary/12 rounded-lg transition-colors group"
 >
 <Sparkles className="h-6 w-6 text-secondary group-hover:scale-110 transition-transform" />
 <span className="text-sm font-medium text-tertiary">Conseil</span>
 </button>
 
 <button
 onClick={() => {
 console.log('Bouton Motivation cliqué - Niveau:', punchlineLevel);
 const motivations = motivationLibrary[punchlineLevel];
 const motivation = motivations[Math.floor(Math.random() * motivations.length)];
 setCurrentMessage(motivation);
 resetTimer();
 console.log('Nouveau message:', motivation);
}}
 className="flex items-center space-x-2 p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors group"
 >
 <Zap className="h-6 w-6 text-red-600 group-hover:scale-110 transition-transform" />
 <span className="text-sm font-medium text-red-800">Motivation</span>
 </button>
 
 <button
 onClick={() => {
 console.log('Bouton Défi cliqué - Niveau:', punchlineLevel);
 const challenges = challengeLibrary[punchlineLevel];
 const challenge = challenges[Math.floor(Math.random() * challenges.length)];
 setCurrentMessage(challenge);
 resetTimer();
 console.log('Nouveau message:', challenge);
}}
 className="flex items-center space-x-2 p-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
 >
 <Trophy className="h-6 w-6 text-purple-600 group-hover:scale-110 transition-transform" />
 <span className="text-sm font-medium text-purple-800">Défi</span>
 </button>
 </div>

 {/* Changement de mascotte */}
 <div>
 <p className="text-xs text-gray-600 mb-2 font-medium">Changer de coach :</p>
 <div className="flex space-x-2">
 {(Object.keys(mascotConfig) as MascotKey[]).map((key) => {
 const config = mascotConfig[key]
 const Icon = config.icon
 return (
 <button
 key={key}
 onClick={() => handleMascotChange(key)}
 className={`p-2 rounded-lg transition-all ${
 selectedMascot === key
 ? `${config.bgColor} text-white shadow-md scale-110`
 :'bg-gray-100 text-gray-600 hover:bg-gray-200'
}`}
 title={config.name}
 >
 <Icon className="h-6 w-6" />
 </button>
 )
})}
 </div>
 </div>
 </motion.div>
 ) : (
 <motion.div
 key="support-mode"
 initial={{ opacity: 0, x: -20}}
 animate={{ opacity: 1, x: 0}}
 exit={{ opacity: 0, x: 20}}
 className="space-y-2"
 >
 {supportOptions.map((option) => {
 const Icon = option.icon
 return (
 <Link
 key={option.title}
 href={option.href}
 onClick={() => setIsOpen(false)}
 className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-background transition-colors group"
 >
 <div className={`p-2 rounded-lg ${option.color} group-hover:scale-110 transition-transform`}>
 <Icon className="h-6 w-6" />
 </div>
 <div className="flex-1">
 <p className="font-medium text-foreground text-sm">
 {option.title}
 </p>
 <p className="text-xs text-gray-600">
 {option.description}
 </p>
 </div>
 </Link>
 )
})}

 <div className="border-t border-border pt-2 mt-2">
 <div className="grid grid-cols-2 gap-2">
 <Link
 href="/faq"
 onClick={() => setIsOpen(false)}
 className="flex items-center justify-center px-2 py-2 text-xs text-gray-600 hover:text-foreground hover:bg-background rounded-lg transition-colors"
 >
 📚 FAQ
 </Link>
 <Link
 href="/pwa-guide"
 onClick={() => setIsOpen(false)}
 className="flex items-center justify-center px-2 py-2 text-xs text-orange-800 hover:text-primary-hover hover:bg-orange-50 rounded-lg transition-colors font-medium"
 >
 📱 Installer App
 </Link>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 {/* Footer */}
 <div className="px-6 py-2 bg-green-50/80 border-t border-border">
 <div className="flex items-center space-x-2">
 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
 <p className="text-xs text-green-700 font-medium">
 {showMascotMode ?"30+ contenus par catégorie ! 💪" :"Réponse sous 24h en moyenne"}
 </p>
 </div>
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 </>
 )
}

export default IronBuddyFAB