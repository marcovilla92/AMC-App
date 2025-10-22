
# 🏗️ AMC Cantieri - App di Gestione Cantieri

App di messaggistica moderna per cantieri edili con **backend Supabase**, chat in tempo reale, condivisione media e pannello amministratore. Ogni conversazione, foto e video è organizzata per cantiere. Perfetta per integrare con il tuo gestionale!

**✨ Novità**: UI completamente rinnovata, animazioni fluide, integrazione Supabase per sincronizzazione dati con gestionale!

## 🚀 Deploy Rapido

### Netlify (Consigliato)
```bash
npm install
npm run build
# Trascina la cartella su app.netlify.com/drop
```

### Vercel
```bash
npm install
npm run deploy:vercel
```

### GitHub Pages
```bash
npm install
npm run deploy:gh-pages
```

## 👨‍💻 Sviluppo Locale

```bash
npm install
npm run dev
```

## 📝 Credenziali Demo

- **Admin**: admin@amc.com / admin123
- **User**: user@amc.com / user123

## 🔌 Modalità di Utilizzo

### Modalità Demo (Default)
L'app funziona out-of-the-box con dati locali salvati nel browser. Perfetta per testare!

### Modalità Supabase (Produzione)
Connetti l'app a Supabase per:
- ✅ **Database real-time** condiviso tra tutti gli utenti
- ✅ **Sincronizzazione** con il tuo gestionale
- ✅ **Autenticazione** centralizzata
- ✅ **Backup automatico** dei dati

📚 **[Leggi la guida completa →](./SUPABASE_SETUP.md)**

## ✨ Features

### 🎨 Design Moderno
- ✅ **UI Rinnovata**: Design moderno con glassmorphism e gradients
- ✅ **Animazioni Fluide**: Transizioni e animazioni con Framer Motion
- ✅ **Icone Lucide**: Icone moderne e pulite
- ✅ **Responsive**: Perfetto su mobile, tablet e desktop

### 🏗️ Gestione Cantieri
- ✅ **Cantieri Completi**: Nome, descrizione, indirizzo, coordinate
- ✅ **Stati Cantiere**: Pianificazione, In Corso, Sospeso, Completato
- ✅ **Selezione Rapida**: I dipendenti selezionano il cantiere dalla sidebar
- ✅ **Badge Colorati**: Stati visualizzati con colori intuitivi

### 💬 Chat Real-time
- ✅ **Messaggistica Istantanea**: Chat per ogni cantiere
- ✅ **Condivisione Media**: Foto, video e documenti del cantiere
- ✅ **Galleria Media**: Visualizza tutti i media di un cantiere
- ✅ **Real-time Updates**: Con Supabase, messaggi in tempo reale

### 🔐 Backend & Integrazione
- ✅ **Supabase Ready**: Integrazione completa con Supabase
- ✅ **Sync Log**: Traccia modifiche per sincronizzazione con gestionale
- ✅ **Row Level Security**: Sicurezza a livello di riga
- ✅ **Modalità Demo**: Funziona anche senza backend per testing

### 👨‍💼 Amministrazione
- ✅ **Pannello Admin**: Crea e gestisce cantieri
- ✅ **Form Avanzati**: Tutti i campi necessari per cantieri
- ✅ **Statistiche**: Overview progetti e membri
- ✅ **Gestione Membri**: Assegna utenti ai cantieri

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Framer Motion** - Animazioni
- **Lucide React** - Icone moderne
- **CSS Variables** - Theming moderno
- **Vite** - Build tool velocissimo

### Backend (Opzionale)
- **Supabase** - Database PostgreSQL + Real-time + Auth
- **Row Level Security** - Sicurezza integrata
- **WebSocket** - Real-time subscriptions

### Storage
- **Local Storage** - Modalità demo
- **Supabase Database** - Modalità produzione

## 📱 Come Funziona

1. **Login**: Accedi con le credenziali demo (admin o user)
2. **Selezione Cantiere**: Nella sidebar sinistra, seleziona il cantiere su cui stai lavorando
3. **Chat**: Comunica con il team del cantiere in tempo reale
4. **Condividi Media**: Carica foto e video dal cantiere con il pulsante 📎
5. **Visualizza Media**: Usa la tab "Media" per vedere tutte le foto/video del cantiere
6. **Admin**: Gli admin possono creare nuovi cantieri con indirizzo, stato e data inizio

## 🎯 Casi d'Uso

- **Dipendente in cantiere**: Seleziona il cantiere, scatta foto dei progressi e condividi nel gruppo
- **Capo progetto**: Monitora tutti i cantieri, leggi messaggi e foto da remoto
- **Amministratore**: Crea nuovi cantieri, gestisci team e visualizza statistiche

## 🔗 Integrazione con Gestionale

L'app è pronta per integrarsi con il tuo gestionale esistente!

### Come Funziona

1. **Sync Log**: Ogni modifica a progetti/messaggi viene loggata in `sync_log`
2. **Webhook/Polling**: Il gestionale può ascoltare via webhook o polling
3. **Bidirezionale**: Il gestionale può anche inviare dati all'app

### Esempio Flusso

```
App → Crea Cantiere → Supabase → Sync Log
       ↓
Gestionale legge Sync Log → Importa nel gestionale → Marca come synced
```

📚 **[Guida Integrazione Gestionale →](./SUPABASE_SETUP.md#-integrazione-con-il-gestionale)**

## 📸 Screenshots

### Login Moderno
Design glassmorphism con background animato

### Dashboard Cantieri
Lista cantieri con stati colorati e info dettagliate

### Chat Real-time
Messaggi istantanei con foto e video

### Pannello Admin
Crea e gestisci cantieri con form completo

## 🤝 Contribuire

1. Fork il progetto
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è privato e proprietario di AMC.

---

🏗️ Creato per ottimizzare la comunicazione nei cantieri edili | Powered by React + Supabase
