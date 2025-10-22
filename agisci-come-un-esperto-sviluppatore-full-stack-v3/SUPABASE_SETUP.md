# 🚀 Configurazione Supabase per AMC Cantieri

Questa guida ti aiuterà a configurare Supabase per integrare l'app AMC Cantieri con un backend real-time e sincronizzarlo con il tuo gestionale.

## 📋 Prerequisiti

- Account Supabase (gratuito su [supabase.com](https://supabase.com))
- Node.js installato
- L'app AMC Cantieri clonata localmente

## 🔧 Step 1: Creare un Progetto Supabase

1. Vai su [supabase.com](https://supabase.com) e accedi
2. Clicca su "New Project"
3. Compila i campi:
   - **Name**: AMC Cantieri
   - **Database Password**: Scegli una password sicura (salvala!)
   - **Region**: Scegli la regione più vicina (es. Frankfurt per l'Italia)
4. Clicca "Create new project" e attendi il completamento (~ 2 minuti)

## 🗄️ Step 2: Eseguire lo Schema Database

1. Nel tuo progetto Supabase, vai alla sezione **SQL Editor** (icona nella sidebar)
2. Clicca su "+ New Query"
3. Copia tutto il contenuto del file `supabase-schema.sql` dalla root del progetto
4. Incolla nel SQL Editor
5. Clicca "Run" per eseguire lo script
6. Verifica che le tabelle siano state create andando in **Database → Tables**

Dovresti vedere:
- ✅ users
- ✅ projects
- ✅ project_members
- ✅ messages
- ✅ message_reads
- ✅ sync_log

## 🔑 Step 3: Configurare le Credenziali nell'App

1. Nel progetto Supabase, vai su **Settings → API**
2. Copia i seguenti valori:
   - **Project URL** (sotto "Config")
   - **anon public** key (sotto "Project API keys")

3. Nella root dell'app, crea un file `.env`:

```bash
# Nella cartella agisci-come-un-esperto-sviluppatore-full-stack-v3/
cp .env.example .env
```

4. Apri il file `.env` e inserisci le tue credenziali:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_NAME=AMC Cantieri
VITE_ENABLE_DEMO_MODE=false
```

**IMPORTANTE**: Imposta `VITE_ENABLE_DEMO_MODE=false` per usare Supabase invece della modalità demo locale.

## 👤 Step 4: Configurare l'Autenticazione

### Opzione A: Email/Password (Consigliata per sviluppo)

1. Vai su **Authentication → Providers**
2. Abilita "Email"
3. **Disabilita "Confirm email"** per testing (puoi riabilitarlo dopo)

### Opzione B: Social Login (Opzionale)

Puoi abilitare Google, GitHub, etc. in **Authentication → Providers**

## 🧑‍💼 Step 5: Creare Utenti Demo

Ci sono due modi:

### Via SQL (Automatico)

Lo script `supabase-schema.sql` già crea 3 utenti demo:
- `admin@amc.com` (Admin)
- `user@amc.com` (User)
- `luca@amc.com` (User)

Ma devi creare le credenziali di auth manualmente:

1. Vai su **Authentication → Users**
2. Clicca "+ Add user"
3. Inserisci:
   - Email: `admin@amc.com`
   - Password: `admin123`
   - **Disabilita "Auto Confirm User"** se vuoi testare subito
4. Ripeti per `user@amc.com` e `luca@amc.com`

### Via Signup nell'App

Altrimenti puoi semplicemente fare signup nell'app e poi aggiornare il ruolo in Supabase:

1. Registrati nell'app
2. Vai su **Database → users**
3. Trova il tuo utente e cambia `role` da `user` a `admin`

## 🚀 Step 6: Avviare l'App

```bash
cd agisci-come-un-esperto-sviluppatore-full-stack-v3
npm install
npm run dev
```

Apri [http://localhost:5173](http://localhost:5173) e prova a fare login!

## ✅ Verifica Funzionamento

### Test 1: Login
- Accedi con `admin@amc.com` / `admin123`
- Dovresti vedere i cantieri di esempio

### Test 2: Chat Real-time
- Apri due browser (o due tab in incognito)
- Accedi con due utenti diversi sullo stesso cantiere
- Invia un messaggio da un browser
- Dovrebbe apparire nell'altro browser in tempo reale! ⚡

### Test 3: Creare un Cantiere
- Come admin, vai su "Admin" nella sidebar
- Clicca "+ Nuovo Progetto"
- Compila i campi e salva
- Il cantiere dovrebbe apparire immediatamente nella lista

## 📊 Integrazione con il Gestionale

L'app include una tabella `sync_log` che registra tutte le modifiche a progetti e messaggi.

### Come Funziona

Ogni volta che crei/modifichi un progetto o messaggio, viene creato un record in `sync_log` con:
- `entity_type`: 'projects' o 'messages'
- `entity_id`: ID dell'entità modificata
- `action`: 'create', 'update', o 'delete'
- `synced_to_gestionale`: false (da sincronizzare)

### Sincronizzare con il Gestionale

Puoi creare un job/webhook che:

1. Legge i record `sync_log` con `synced_to_gestionale = false`
2. Invia i dati al gestionale via API
3. Marca il record come sincronizzato:

```sql
UPDATE sync_log
SET synced_to_gestionale = true,
    synced_at = NOW()
WHERE id = 'xxx';
```

### Esempio con Webhook

1. In Supabase, vai su **Database → Webhooks**
2. Crea un webhook per la tabella `sync_log`
3. Event: `INSERT`
4. URL: Il tuo endpoint gestionale (es. `https://gestionale.amc.com/api/sync`)
5. Il gestionale riceve i dati e li processa

### Esempio Codice Node.js

```javascript
// Server del gestionale
app.post('/api/sync', async (req, res) => {
  const { entity_type, entity_id, action } = req.body.record;

  // Recupera i dati completi da Supabase
  const { data } = await supabase
    .from(entity_type)
    .select('*')
    .eq('id', entity_id)
    .single();

  // Inserisci/Aggiorna nel gestionale
  await gestionale.sync(data);

  // Marca come sincronizzato
  await supabase
    .from('sync_log')
    .update({ synced_to_gestionale: true, synced_at: new Date() })
    .eq('id', req.body.record.id);

  res.json({ success: true });
});
```

## 🔐 Sicurezza

### Row Level Security (RLS)

L'app è configurata con RLS per proteggere i dati:

- **Users**: Tutti possono vedere, solo admin possono modificare
- **Projects**: Membri vedono solo i loro progetti, admin vedono tutto
- **Messages**: Solo membri del progetto possono vedere/creare messaggi
- **Sync Log**: Solo admin possono vedere

### API Keys

- ✅ **anon key**: Va bene nel frontend (ha accesso limitato grazie a RLS)
- ❌ **service_role key**: NEVER nel frontend! Solo nel backend del gestionale

## 🛠️ Troubleshooting

### "Credenziali non valide" al login
- Verifica che l'utente esista in **Authentication → Users**
- Verifica che l'utente esista anche in **Database → users**
- Password corretta?

### "Project not found" o dati non caricano
- Verifica RLS policies
- Controlla la console del browser (F12) per errori
- Verifica che l'utente sia membro del progetto in `project_members`

### Messaggi non in real-time
- Verifica che Realtime sia abilitato per la tabella `messages` in **Database → Replication**
- Controlla la console per errori WebSocket

### Modalità Demo invece di Supabase
- Verifica che `.env` esista nella root del progetto
- Verifica che `VITE_ENABLE_DEMO_MODE=false`
- Riavvia il server (`npm run dev`)

## 📚 Risorse Utili

- [Documentazione Supabase](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Guide](https://supabase.com/docs/guides/realtime)

## 🤝 Supporto

Per problemi o domande:
- Controlla la documentazione Supabase
- Apri un issue su GitHub
- Contatta il supporto AMC

---

✨ Fatto! La tua app è ora connessa a Supabase e pronta per l'integrazione con il gestionale!
