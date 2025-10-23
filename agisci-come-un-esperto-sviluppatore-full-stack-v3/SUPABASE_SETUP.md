# 🚀 AMC App - Guida Setup Supabase

## Panoramica

Questa guida ti aiuterà a configurare Supabase come backend per l'AMC App, includendo:
- ✅ Database PostgreSQL
- ✅ Autenticazione utenti
- ✅ Real-time messaging
- ✅ Storage file/media
- ✅ Row Level Security (RLS)
- ✅ API REST automatiche

---

## 📋 Prerequisiti

1. Account Supabase (gratuito) - [Registrati qui](https://supabase.com)
2. Node.js installato (per l'app)
3. Git (opzionale)

---

## 🎯 Passo 1: Creare Progetto Supabase

1. **Vai su** [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Clicca** su "New Project"
3. **Compila** i dettagli:
   - **Name**: `amc-app` (o nome preferito)
   - **Database Password**: Genera una password sicura (**SALVALA!**)
   - **Region**: Scegli la regione più vicina (es. `Europe West`)
   - **Pricing Plan**: `Free` (sufficiente per iniziare)
4. **Clicca** "Create new project"
5. **Attendi** ~2 minuti per il provisioning

---

## 🗄️ Passo 2: Configurare Database

### 2.1 Eseguire lo Schema SQL

1. Nella dashboard Supabase, vai su **SQL Editor** (icona nel menu laterale)
2. Clicca su **"New query"**
3. **Copia** il contenuto del file `supabase_schema.sql`
4. **Incolla** nell'editor SQL
5. Clicca su **"Run"** (o premi `Ctrl+Enter`)
6. Verifica che lo script si completi con successo (vedi messaggio "Success")

### 2.2 Verificare le Tabelle

1. Vai su **Table Editor** nel menu laterale
2. Dovresti vedere queste tabelle:
   - ✅ `users`
   - ✅ `projects`
   - ✅ `project_members`
   - ✅ `messages`
   - ✅ `message_reads`
   - ✅ `time_entries`

---

## 🔑 Passo 3: Ottenere le Chiavi API

1. Vai su **Settings** > **API** nella dashboard
2. Troverai queste informazioni:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. **Copia** entrambi i valori

---

## ⚙️ Passo 4: Configurare l'App

### 4.1 Creare file .env

1. **Crea** un file chiamato `.env` nella root del progetto:
   ```bash
   touch .env
   ```

2. **Incolla** questo contenuto (sostituisci con le tue chiavi):
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key
   ```

3. **Salva** il file

### 4.2 Riavviare il Server di Sviluppo

```bash
# Ferma il server corrente (Ctrl+C)
# Riavvia con:
npm run dev
```

L'app ora si connetterà a Supabase!

---

## 🔐 Passo 5: Configurare Autenticazione

### 5.1 Abilitare Email/Password Auth

1. Vai su **Authentication** > **Providers**
2. **Abilita** "Email" provider
3. Configurazioni consigliate:
   - ✅ Enable email confirmations (disabilita per testing)
   - ✅ Enable password recovery
   - Minimum password length: `6`

### 5.2 Configurare Email Templates (opzionale)

1. Vai su **Authentication** > **Email Templates**
2. Personalizza i template per:
   - Conferma registrazione
   - Reset password
   - Cambio email

---

## 📡 Passo 6: Abilitare Realtime

1. Vai su **Database** > **Replication**
2. **Abilita** la replica per queste tabelle:
   - ✅ `messages`
   - ✅ `message_reads`
   - ✅ `time_entries`
3. Clicca su **Save**

Ora i messaggi arriveranno in tempo reale! 🎉

---

## 📦 Passo 7: Configurare Storage (per file/media)

### 7.1 Creare Bucket Storage

1. Vai su **Storage** nel menu laterale
2. Clicca su **"New bucket"**
3. Configura:
   - **Name**: `media`
   - **Public bucket**: ✅ Sì (per file/immagini pubblici)
4. Clicca su **"Create bucket"**

### 7.2 Configurare Policies Storage

1. Seleziona il bucket `media`
2. Vai su **Policies**
3. Aggiungi queste policy:

**Policy 1: Upload Files (autenticati possono caricare)**
```sql
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');
```

**Policy 2: Public Read (tutti possono leggere)**
```sql
CREATE POLICY "Anyone can read media files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');
```

---

## 🧪 Passo 8: Testare la Connessione

### 8.1 Test Base

Apri la console del browser (F12) nell'app e verifica:
```javascript
// Dovresti vedere nella console:
// ✅ "Supabase client initialized"
```

### 8.2 Test Autenticazione

1. Prova a registrarti con una nuova email
2. Verifica che l'utente sia creato nella tabella `auth.users`
3. Prova il login

### 8.3 Test Messaggi Real-time

1. Apri l'app in due tab del browser
2. Login con utenti diversi nello stesso progetto
3. Invia un messaggio da un tab
4. Verifica che appaia istantaneamente nell'altro tab

---

## 🎨 Passo 9: Notifiche Push (opzionale)

### 9.1 Registrare Service Worker

Il service worker per le notifiche push è già pronto in `public/sw.js`

### 9.2 Richiedere Permessi

Le notifiche vengono richieste automaticamente al primo login

### 9.3 Testare Notifiche

1. Apri l'app
2. Concedi permesso notifiche quando richiesto
3. Riduci a icona/chiudi il browser
4. Fai inviare un messaggio da un altro utente
5. Dovresti ricevere una notifica desktop

---

## 📊 Monitoraggio e Analytics

### Database Usage
- Vai su **Settings** > **Usage** per monitorare:
  - Numero richieste API
  - Storage usato
  - Bandwidth consumata

### Logs
- Vai su **Logs** > **Postgres Logs** per debug query
- Vai su **Logs** > **API Logs** per vedere le richieste

---

## 🔧 Troubleshooting

### ❌ "Connection failed"
**Soluzione**: Verifica che le chiavi nel `.env` siano corrette

### ❌ "Permission denied for table X"
**Soluzione**: Verifica le RLS policies nel SQL Editor

### ❌ "Realtime not working"
**Soluzione**:
1. Verifica che la replica sia attiva per la tabella
2. Controlla che il client si sottoscriva correttamente

### ❌ "Storage upload failed"
**Soluzione**: Verifica le policy del bucket storage

---

## 📚 Risorse Utili

- [Documentazione Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime](https://supabase.com/docs/guides/realtime)
- [Storage](https://supabase.com/docs/guides/storage)

---

## 🎉 Completato!

Ora la tua AMC App è connessa a Supabase con:
- ✅ Database PostgreSQL scalabile
- ✅ Autenticazione sicura
- ✅ Messaggi in tempo reale
- ✅ Storage file/media
- ✅ API REST automatiche
- ✅ Notifiche push

**Prossimi passi:**
1. Personalizza i template email
2. Aggiungi utenti al progetto
3. Configura un dominio custom (opzionale)
4. Setup backup automatici (Settings > Database)

---

## 🆘 Supporto

Per problemi o domande:
- Discord Supabase: [discord.gg/supabase](https://discord.gg/supabase)
- GitHub Issues: [github.com/your-repo/issues](https://github.com)
- Email: support@amc.com

