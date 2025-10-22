
# 🏗️ AMC Cantieri - App di Gestione Cantieri

App di messaggistica per cantieri edili con gestione progetti, chat in tempo reale, condivisione media e pannello amministratore. Ogni conversazione, foto e video è organizzata per cantiere.

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

- **Admin**: admin@company.com / admin123
- **User**: user@company.com / user123

## ✨ Features

- ✅ **Gestione Cantieri**: Ogni progetto/cantiere con nome, descrizione, indirizzo
- ✅ **Stati Cantiere**: Pianificazione, In Corso, Sospeso, Completato
- ✅ **Selezione Rapida**: I dipendenti possono selezionare il cantiere dalla sidebar
- ✅ **Chat Real-time**: Messaggistica istantanea per ogni cantiere
- ✅ **Condivisione Media**: Foto, video e documenti del cantiere
- ✅ **Galleria Media**: Visualizza tutti i media di un cantiere
- ✅ **Pannello Admin**: Crea e gestisce cantieri con campi personalizzati
- ✅ **Dati Demo**: 4 cantieri di esempio con messaggi e foto
- ✅ **Storage Persistente**: I dati rimangono salvati localmente
- ✅ **Design Responsive**: Funziona su mobile e desktop

## 🛠️ Tech Stack

- React 18
- TypeScript
- CSS Modules
- Vite
- Persistent Storage API

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

---

🏗️ Creato per ottimizzare la comunicazione nei cantieri edili
