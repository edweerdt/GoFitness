# Go Fitness 💪

**Go Fitness** is een slimme, rustige en overzichtelijke fitness-app (Progressive Web App) speciaal ontworpen voor (beginners in) krachttraining. Geen overvolle dashboards, geen voedingstracking en geen afleidende sociale functies. Gewoon een slimme coach die je helpt consistent te blijven.

## ✨ Features

- 🚦 **Slim Herstel (Stoplicht-systeem):** De app berekent op basis van je rusttijd of je klaar bent voor een nieuwe sessie (Groen), beter rustig aan kunt doen (Oranje) of echt moet rusten (Rood).
- 🧠 **Aanbevolen Sessies:** Automatisch advies over welke sessie je vandaag het beste kunt oppakken.
- 📥 **Flexibele Schema Import:** Importeer eenvoudig je eigen trainingsschema's via JSON-bestanden, of laad ze direct in via een publieke Google Drive link of externe URL.
- 🌙 **Thema's:** Volautomatische ondersteuning voor lichte en donkere thema's op basis van je apparaat, inclusief een handmatige schakelaar.
- 💾 **Pauzeren & Hervatten:** Je actieve training wordt continu lokaal opgeslagen. App per ongeluk afgesloten? Je kunt exact verder waar je gebleven was.
- 📊 **Voortgang & Mijlpalen:** Simpele, rustige statistieken en motiverende beloningen voor consistentie en het opbouwen van een routine.
- 📱 **100% PWA:** De app draait volledig veilig en lokaal op je toestel. Geen accounts nodig, en installeerbaar op je startscherm.
- ☁️ **Cloud-sync (optioneel):** Log in met Google en je schema's en sessies synchroniseren automatisch tussen al je apparaten, met altijd een backup in je eigen Google Drive. Zonder login blijft alles gewoon lokaal werken.

## 🛠️ Tech Stack

Volledig gebouwd zonder complexe frameworks of build tools. Snel, lichtgewicht en onderhoudbaar.
- **HTML5** & **CSS3** (Met premium design-elementen en glassmorphism)
- **Vanilla JavaScript** (ES6+, LocalStorage API)
- **Service Workers** (Voor offline functionaliteit)

## ☁️ Google-login & Cloud-sync instellen (eenmalig)

De sync werkt volledig client-side: je data staat in de verborgen app-map (`appDataFolder`) van je **eigen** Google Drive. Er is geen eigen server nodig. Om dit te activeren maak je eenmalig een (gratis) Google OAuth Client ID aan:

1. Ga naar de [Google Cloud Console](https://console.cloud.google.com/) en maak een nieuw project (bijv. "GoFitness").
2. Ga naar **APIs & Services > Library** en schakel de **Google Drive API** in.
3. Ga naar **APIs & Services > OAuth consent screen**: kies *External*, vul de appnaam in en voeg jezelf (en eventuele andere gebruikers) toe als *Test user*.
4. Ga naar **APIs & Services > Credentials > Create Credentials > OAuth client ID**:
   - Application type: **Web application**
   - Authorized JavaScript origins: je GitHub Pages-URL (bijv. `https://<gebruikersnaam>.github.io`) en eventueel `http://localhost:8000` om lokaal te testen.
5. Kopieer het **Client ID** en vul het in bovenaan `sync.js`:
   ```js
   const GOOGLE_CLIENT_ID = '1234567890-abc.apps.googleusercontent.com';
   ```
6. Commit en deploy. Op de **Schema's**-pagina verschijnt nu de knop **Inloggen met Google**.

### Hoe de sync werkt

- Bij het openen van de app en na elke wijziging (nieuwe sessie, import, bewerking, verwijdering) wordt automatisch gesynchroniseerd.
- Samenvoegen gebeurt zonder dataverlies: sessies en schema's van verschillende apparaten worden samengevoegd op id, verwijderingen worden overal doorgevoerd, en bij een conflict wint de nieuwste bewerking.
- De data staat als `gofitness-data.json` in de app-map van je Google Drive; die map is alleen toegankelijk voor deze app en telt als automatische backup.
- Offline? De app werkt gewoon door en synchroniseert zodra je weer online bent.

## 🚀 Live Zetten (GitHub Pages)

1. Ga in je repository naar **Settings > Pages**.
2. Kies bij *Source* voor **Deploy from a branch** en selecteer de `main` branch.
3. Open de gegenereerde weblink op je telefoon.
4. Kies in het browser-menu voor **App installeren** of **Toevoegen aan startscherm**.
5. Klaar om te trainen!