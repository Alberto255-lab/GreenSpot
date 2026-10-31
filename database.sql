-- =====================================================================
--  GreenSpot · DATABASE COMPLETO  ·  un solo file per Supabase
--  Incolla tutto nell'SQL Editor di Supabase ed esegui.
--  È rieseguibile: funziona sia su un progetto nuovo sia su uno già esistente
--  (non cancella utenti, punti, premi o scansioni).
--  Indice: 1 Tabelle · 2 Funzioni di supporto · 3 Funzioni applicative
--          4 Sicurezza (RLS) · 5 Storage · 6 Dati iniziali · 7 Automazioni (cron)
-- =====================================================================


-- ============================ 1. TABELLE =============================

create table if not exists profiles (
  id            uuid primary key references auth.users on delete cascade,
  username      text unique not null,
  role          text not null default 'user' check (role in ('user', 'admin', 'azienda')),
  banned        boolean not null default false,
  bonus_points  numeric not null default 0,
  created_at    timestamptz default now()
);

create table if not exists partners (
  id                    uuid primary key default gen_random_uuid(),
  company_name          text not null,
  logo_url              text,
  description           text,
  products_description  text,
  points_required       numeric,               -- non più usato (i punti stanno nei premi)
  created_at            timestamptz default now()
);

create table if not exists partnership_requests (
  id                    uuid primary key default gen_random_uuid(),
  num                   bigserial,             -- numero richiesta (#001, #002, ...)
  user_id               uuid references profiles on delete set null default auth.uid(),
  company_name          text not null,
  logo_url              text,
  description           text,
  products_description  text,
  contact_phone         text,
  status                text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejected_at           timestamptz,
  partner_id            uuid references partners on delete set null,
  created_at            timestamptz default now()
);

create table if not exists partner_accounts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles on delete cascade,
  partner_id  uuid not null unique references partners on delete cascade,
  created_at  timestamptz default now()
);

create table if not exists rewards (
  id               uuid primary key default gen_random_uuid(),
  partner_id       uuid not null references partners on delete cascade,
  name             text not null,
  points_required  numeric not null check (points_required > 0),
  created_at       timestamptz default now()
);

create table if not exists transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles on delete cascade,
  partner_id  uuid not null references partners on delete cascade,
  reward_id   uuid references rewards on delete set null,
  points      numeric not null default 0,      -- costo del premio al momento del riscatto
  counted     boolean not null default true,   -- false dopo "Azzera punti"
  token       text unique not null,
  status      text not null default 'generated' check (status in ('generated', 'redeemed')),
  created_at  timestamptz default now()
);

create table if not exists scans (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles on delete cascade,
  barcode     text not null,
  points      numeric not null default 0.5,
  created_at  timestamptz default now()
);

create table if not exists collection_points (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  kind        text not null check (kind in ('machine', 'bin')),
  address     text,
  lat         double precision not null,
  lon         double precision not null,
  approved    boolean not null default false,
  photo_url   text,
  ai_verdict  text,                      -- 'ok' | 'unchecked'
  ai_note     text,
  user_id     uuid references profiles(id) on delete set null default auth.uid(),
  created_at  timestamptz default now()
);

create table if not exists medals (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  type           text not null unique check (type in (
                   'monthly_top1', 'monthly_top2', 'monthly_top3',
                   'yearly_top1', 'yearly_top2', 'yearly_top3',
                   'consolation_monthly', 'consolation_yearly')),
  color          text not null default 'gold' check (color in ('gold', 'silver', 'bronze', 'green')),
  has_envelope   boolean not null default false,
  reward_points  integer not null default 0,
  description    text
);

create table if not exists user_medals (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references profiles(id) on delete cascade,
  medal_id         uuid not null references medals(id),
  period_key       text,
  awarded_at       timestamptz default now(),
  envelope_opened  boolean not null default false,
  reward_claimed   boolean not null default false,
  unique (user_id, medal_id, period_key)
);


-- punti OpenStreetMap nascosti dall'admin
create table if not exists hidden_osm_points (
  osm_id      text primary key,
  hidden_by   uuid default auth.uid(),
  created_at  timestamptz default now()
);

create table if not exists collection_schedules (
  id              uuid primary key default gen_random_uuid(),
  city            text not null,
  neighborhood    text,
  waste_type      text not null check (waste_type in ('plastica', 'carta', 'vetro', 'organico', 'indifferenziato', 'RAEE')),
  collection_date date not null,
  notes           text,
  created_at      timestamptz default now()
);
create index if not exists collection_schedules_city_date on collection_schedules (lower(city), collection_date);

create table if not exists user_schedule_preferences (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null unique references profiles(id) on delete cascade,
  city                   text,
  neighborhood           text,
  notifications_enabled  boolean not null default true
);


-- codici a barre già scansionati: ogni bottiglia vale una sola volta, per tutti gli utenti
create table if not exists scanned_barcodes (
  barcode     text primary key,
  digits      int[] not null,                  -- il codice scomposto cifra per cifra
  user_id     uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- zone del calendario ritiri: Nazione > Paese > Comune (il calendario sta nel comune)
create table if not exists places (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('country', 'town', 'comune')),
  name        text not null,
  parent_id   uuid references places(id) on delete cascade,
  created_at  timestamptz default now()
);
create unique index if not exists places_unique
  on places (kind, lower(name), coalesce(parent_id, '00000000-0000-0000-0000-000000000000'::uuid));


-- ====================== 2. FUNZIONI DI SUPPORTO ======================

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin') $$;

-- Profilo automatico alla registrazione (il ruolo parte sempre da 'user')
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- Registra l'istante del rifiuto di una richiesta partnership
create or replace function set_rejected_at() returns trigger language plpgsql as $$
begin
  if new.status = 'rejected' and old.status is distinct from 'rejected' then
    new.rejected_at = now();
  end if;
  return new;
end $$;
drop trigger if exists trg_rejected on partnership_requests;
create trigger trg_rejected before update on partnership_requests
  for each row execute function set_rejected_at();


-- ===================== 3. FUNZIONI APPLICATIVE =======================
-- Punti, premi e medaglie vengono gestiti qui, lato server: dal browser non si possono falsificare.

-- Scansione bottiglia: +0.5 punti, una volta al giorno per codice
create or replace function add_scan(p_barcode text) returns numeric
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Login richiesto'; end if;
  if exists (select 1 from profiles where id = auth.uid() and banned) then
    raise exception 'Account bannato';
  end if;
  if exists (select 1 from scans
             where user_id = auth.uid() and barcode = p_barcode and created_at::date = current_date) then
    raise exception 'Bottiglia già scansionata oggi';
  end if;
  insert into scans (user_id, barcode, points) values (auth.uid(), p_barcode, 0.5);
  return 0.5;
end $$;

-- Statistiche utente e saldo punti (scansioni + bonus medaglie - premi riscattati)
create or replace function stats() returns json
language sql security definer set search_path = public as $$
  select json_build_object(
    'total',   (select coalesce(sum(points), 0) from scans),
    'users',   (select count(distinct user_id) from scans),
    'mine',    (select coalesce(sum(points), 0) from scans where user_id = auth.uid()),
    'record',  (select coalesce(max(d), 0)
                from (select sum(points) d from scans where user_id = auth.uid() group by created_at::date) x),
    'balance', (select coalesce(sum(points), 0) from scans where user_id = auth.uid())
             + (select coalesce(bonus_points, 0) from profiles where id = auth.uid())
             - (select coalesce(sum(points), 0) from transactions where user_id = auth.uid() and counted)
  ) $$;

-- Riscatto di un premio: genera il token
create or replace function redeem(p_reward uuid) returns text
language plpgsql security definer set search_path = public as $$
declare need numeric; pid uuid; bal numeric; tok text;
begin
  if exists (select 1 from profiles where id = auth.uid() and banned) then
    raise exception 'Account bannato';
  end if;
  select points_required, partner_id into need, pid from rewards where id = p_reward;
  if need is null then raise exception 'Premio non trovato'; end if;
  bal := (stats()->>'balance')::numeric;
  if bal < need then raise exception 'Punti insufficienti (% / %)', bal, need; end if;
  tok := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
  insert into transactions (user_id, partner_id, reward_id, points, token)
  values (auth.uid(), pid, p_reward, need, tok);
  return tok;
end $$;

-- Token riscattati presso la propria azienda (con username e premio)
create or replace function company_transactions()
returns table (id uuid, token text, username text, reward text, status text, created_at timestamptz)
language sql security definer set search_path = public as $$
  select t.id, t.token, p.username, r.name, t.status, t.created_at
  from transactions t
  join profiles p on p.id = t.user_id
  left join rewards r on r.id = t.reward_id
  join partner_accounts a on a.partner_id = t.partner_id and a.user_id = auth.uid()
  order by t.created_at desc $$;

create or replace function mark_redeemed(p_id uuid) returns void
language sql security definer set search_path = public as $$
  update transactions set status = 'redeemed'
  where id = p_id and partner_id in (select partner_id from partner_accounts where user_id = auth.uid()) $$;

-- Elimina le richieste rifiutate da più di 24 ore (sparisce sia dall'admin sia dall'utente).
-- Parte da sola ogni ora (sezione 7) e anche quando qualcuno apre Partnership/Admin.
create or replace function purge_rejected() returns void
language sql security definer set search_path = public as $$
  delete from partnership_requests
  where status = 'rejected'
    and coalesce(rejected_at, created_at) < now() - interval '24 hours' $$;
grant execute on function purge_rejected() to authenticated;

-- Admin: azzera i punti di un utente
create or replace function admin_reset_points(p_user uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Non autorizzato'; end if;
  delete from scans where user_id = p_user;
  update transactions set counted = false where user_id = p_user;
  update profiles set bonus_points = 0 where id = p_user;
end $$;

-- Admin: elimina un account (e a cascata tutti i suoi dati)
create or replace function admin_delete_user(p_user uuid) returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if not is_admin() then raise exception 'Non autorizzato'; end if;
  if p_user = auth.uid() then raise exception 'Non puoi eliminare te stesso'; end if;
  delete from auth.users where id = p_user;
end $$;

-- Login con username: restituisce l'email associata
create or replace function email_for_username(p_username text) returns text
language sql stable security definer set search_path = public, auth as $$
  select u.email::text from auth.users u
  join public.profiles p on p.id = u.id
  where lower(p.username) = lower(p_username) limit 1 $$;
grant execute on function email_for_username(text) to anon, authenticated;

-- Classifica: top 10 + la tua posizione se sei fuori (funzione server)
create or replace function leaderboard(p_period text default 'monthly')
returns table(rank_pos bigint, uid uuid, uname text, bottles bigint)
language plpgsql security definer set search_path = public as $$
declare since timestamptz;
begin
  since := case p_period
    when 'monthly' then date_trunc('month', now())
    when 'yearly'  then date_trunc('year', now())
    else '-infinity'::timestamptz end;
  return query
    select x.pos, x.u, x.n, x.b from (
      select row_number() over (order by count(*) desc, min(s.created_at)) as pos,
             s.user_id as u, p.username as n, count(*) as b
      from scans s join profiles p on p.id = s.user_id
      where s.created_at >= since
      group by s.user_id, p.username) x
    where x.pos <= 10 or x.u = auth.uid()
    order by x.pos;
end $$;
grant execute on function leaderboard(text) to authenticated;

-- Medaglie: assegnazione fine mese / fine anno (logica interna, senza controllo admin)
create or replace function _assign_medals(p_period text) returns int
language plpgsql security definer set search_path = public as $$
declare k text; since timestamptz; n int := 0; thr int; r record; mt medals; umid uuid;
begin
  if p_period = 'monthly' then
    since := date_trunc('month', now()); k := to_char(since, 'YYYY-MM'); thr := 20;
  elsif p_period = 'yearly' then
    since := date_trunc('year', now()); k := to_char(since, 'YYYY'); thr := 40;
  else raise exception 'Periodo non valido'; end if;

  for r in
    select user_id, count(*) total, row_number() over (order by count(*) desc, min(created_at)) pos
    from scans where created_at >= since group by user_id
  loop
    if r.pos <= 3 then
      select * into mt from medals where type = p_period || '_top' || r.pos;
    elsif r.total >= thr then
      select * into mt from medals where type = 'consolation_' || p_period;
    else
      continue;
    end if;
    umid := null;
    insert into user_medals (user_id, medal_id, period_key) values (r.user_id, mt.id, k)
      on conflict do nothing returning id into umid;
    if umid is not null then
      n := n + 1;
      if not mt.has_envelope then   -- medaglie senza busta: punti accreditati subito
        update user_medals set reward_claimed = true where id = umid;
        update profiles set bonus_points = bonus_points + mt.reward_points where id = r.user_id;
      end if;
    end if;
  end loop;
  return n;
end $$;

revoke all on function _assign_medals(text) from public, anon, authenticated;

-- Versione manuale per l'admin (non usata dall'app, utile da SQL/API)
create or replace function assign_medals(p_period text) returns int
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Non autorizzato'; end if;
  return _assign_medals(p_period);
end $$;


-- Medaglie: apertura busta ricompensa
create or replace function open_envelope(p_id uuid) returns integer
language plpgsql security definer set search_path = public as $$
declare um user_medals; mt medals;
begin
  select * into um from user_medals where id = p_id and user_id = auth.uid();
  if um.id is null then raise exception 'Busta non trovata'; end if;
  select * into mt from medals where id = um.medal_id;
  if not mt.has_envelope or um.envelope_opened then raise exception 'Busta non apribile'; end if;
  update user_medals set envelope_opened = true, reward_claimed = true where id = p_id;
  update profiles set bonus_points = bonus_points + mt.reward_points where id = auth.uid();
  return mt.reward_points;
end $$;


-- Scansione bottiglia: registra il codice a barre (errore se già usato da chiunque)
-- e poi assegna i punti con add_scan. Se add_scan fallisce, anche il salvataggio del codice viene annullato.
create or replace function add_scan_checked(p_barcode text, p_digits int[]) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Login richiesto'; end if;
  begin
    insert into scanned_barcodes (barcode, digits, user_id) values (p_barcode, p_digits, auth.uid());
  exception when unique_violation then
    raise exception 'barcode_already_scanned';
  end;
  perform add_scan(p_barcode);
end $$;
revoke all on function add_scan_checked(text, int[]) from public;
grant execute on function add_scan_checked(text, int[]) to authenticated;

-- Medaglie automatiche: il giorno prima della fine del mese / dell'anno assegna le medaglie.
-- (Funzione interna: la chiama solo il cron della sezione 7; nessun utente può eseguirla.)
create or replace function auto_assign_medals() returns void
language plpgsql security definer set search_path = public as $$
declare tomorrow date := current_date + 1;
begin
  if extract(day from tomorrow) = 1 then
    perform _assign_medals('monthly');
    if extract(month from tomorrow) = 1 then perform _assign_medals('yearly'); end if;
  end if;
end $$;
revoke all on function auto_assign_medals() from public, anon, authenticated;


-- ======================= 4. SICUREZZA (RLS) ==========================

alter table profiles              enable row level security;
alter table partners              enable row level security;
alter table partnership_requests  enable row level security;
alter table partner_accounts      enable row level security;
alter table rewards               enable row level security;
alter table transactions          enable row level security;
alter table scans                 enable row level security;
alter table collection_points     enable row level security;
alter table medals                enable row level security;
alter table user_medals           enable row level security;

-- profili
drop policy if exists "profiles read" on profiles;
create policy "profiles read" on profiles for select using (id = auth.uid() or is_admin());
drop policy if exists "profiles admin update" on profiles;
create policy "profiles admin update" on profiles for update using (is_admin());
-- scansioni (si scrivono solo con add_scan)
drop policy if exists "scans read" on scans;
create policy "scans read" on scans for select using (user_id = auth.uid() or is_admin());
-- richieste partnership
drop policy if exists "req insert" on partnership_requests;
create policy "req insert" on partnership_requests for insert with check (status = 'pending');
drop policy if exists "req own read" on partnership_requests;
create policy "req own read" on partnership_requests for select using (user_id = auth.uid());
drop policy if exists "req admin read" on partnership_requests;
create policy "req admin read" on partnership_requests for select using (is_admin());
drop policy if exists "req admin update" on partnership_requests;
create policy "req admin update" on partnership_requests for update using (is_admin());
-- partner, account azienda, premi
drop policy if exists "partners read" on partners;
create policy "partners read" on partners for select using (true);
drop policy if exists "partners admin write" on partners;
create policy "partners admin write" on partners for all using (is_admin()) with check (is_admin());
drop policy if exists "pa read" on partner_accounts;
create policy "pa read" on partner_accounts for select using (user_id = auth.uid() or is_admin());
drop policy if exists "pa admin write" on partner_accounts;
create policy "pa admin write" on partner_accounts for all using (is_admin()) with check (is_admin());
drop policy if exists "rewards read" on rewards;
create policy "rewards read" on rewards for select using (true);
drop policy if exists "rewards owner write" on rewards;
create policy "rewards owner write" on rewards for all
  using      (is_admin() or partner_id in (select partner_id from partner_accounts where user_id = auth.uid()))
  with check (is_admin() or partner_id in (select partner_id from partner_accounts where user_id = auth.uid()));
-- transazioni (si scrivono solo con redeem)
drop policy if exists "tx read" on transactions;
create policy "tx read" on transactions for select using (user_id = auth.uid() or is_admin());
-- punti di raccolta (le segnalazioni utente restano in attesa finché l'admin le approva)
drop policy if exists "cp read" on collection_points;
create policy "cp read" on collection_points for select
  using (approved or user_id = auth.uid() or is_admin());
drop policy if exists "cp admin write" on collection_points;
create policy "cp admin write" on collection_points for all using (is_admin()) with check (is_admin());
drop policy if exists "cp user insert" on collection_points;
create policy "cp user insert" on collection_points for insert to authenticated with check (approved = false);
-- medaglie (assegnazione e buste solo via funzioni)
drop policy if exists "medals read" on medals;
create policy "medals read" on medals for select to authenticated using (true);
drop policy if exists "user_medals read own" on user_medals;
create policy "user_medals read own" on user_medals for select using (user_id = auth.uid());

-- l'admin può eliminare le partnership approvate non ancora create come partner
drop policy if exists "req admin delete" on partnership_requests;
create policy "req admin delete" on partnership_requests for delete using (is_admin());

-- codici a barre: nessuna policy (si usano solo tramite add_scan_checked)
alter table scanned_barcodes enable row level security;

-- zone del calendario: lettura per tutti gli utenti loggati, scrittura solo admin
alter table places enable row level security;
drop policy if exists "places read" on places;
create policy "places read" on places for select to authenticated using (true);
drop policy if exists "places admin write" on places;
create policy "places admin write" on places for all using (is_admin()) with check (is_admin());

alter table hidden_osm_points enable row level security;
drop policy if exists "hidden read" on hidden_osm_points;
create policy "hidden read" on hidden_osm_points for select to authenticated using (true);
drop policy if exists "hidden admin write" on hidden_osm_points;
create policy "hidden admin write" on hidden_osm_points for all using (is_admin()) with check (is_admin());

-- calendario raccolta rifiuti
alter table collection_schedules       enable row level security;
alter table user_schedule_preferences  enable row level security;
drop policy if exists "sched read" on collection_schedules;
create policy "sched read" on collection_schedules for select to authenticated using (true);
drop policy if exists "sched admin write" on collection_schedules;
create policy "sched admin write" on collection_schedules for all using (is_admin()) with check (is_admin());
drop policy if exists "prefs own" on user_schedule_preferences;
create policy "prefs own" on user_schedule_preferences for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());


-- ========================== 5. STORAGE ===============================

insert into storage.buckets (id, name, public) values ('logos', 'logos', true) on conflict do nothing;
drop policy if exists "logos read" on storage.objects;
create policy "logos read" on storage.objects for select using (bucket_id = 'logos');
drop policy if exists "logos upload" on storage.objects;
create policy "logos upload" on storage.objects for insert with check (bucket_id = 'logos');

insert into storage.buckets (id, name, public) values ('spots', 'spots', true) on conflict do nothing;
drop policy if exists "spots read" on storage.objects;
create policy "spots read" on storage.objects for select using (bucket_id = 'spots');
drop policy if exists "spots upload" on storage.objects;
create policy "spots upload" on storage.objects for insert to authenticated with check (bucket_id = 'spots');
drop policy if exists "spots admin delete" on storage.objects;
create policy "spots admin delete" on storage.objects for delete using (bucket_id = 'spots' and is_admin());


-- ======================== 6. DATI INIZIALI ===========================

-- Premi medaglie: quelli sopra i 50 punti sono stati ridotti di 25 (200→175, 120→95, 80→55)
insert into medals (name, type, color, has_envelope, reward_points, description) values
  ('Campione del Mese',    'monthly_top1',        'gold',   true,  50,  '1º classificato del mese'),
  ('Argento del Mese',     'monthly_top2',        'silver', true,  30,  '2º classificato del mese'),
  ('Bronzo del Mese',      'monthly_top3',        'bronze', true,  20,  '3º classificato del mese'),
  ('Campione dell''Anno',  'yearly_top1',         'gold',   true,  175, '1º classificato dell''anno'),
  ('Argento dell''Anno',   'yearly_top2',         'silver', true,  95,  '2º classificato dell''anno'),
  ('Bronzo dell''Anno',    'yearly_top3',         'bronze', true,  55,  '3º classificato dell''anno'),
  ('Eco Costante',         'consolation_monthly', 'green',  false, 5,   'Almeno 20 bottiglie in un mese'),
  ('Eco Instancabile',     'consolation_yearly',  'green',  false, 15,  'Almeno 40 bottiglie in un anno')
on conflict (type) do update set
  name = excluded.name, color = excluded.color, has_envelope = excluded.has_envelope,
  reward_points = excluded.reward_points, description = excluded.description;

-- Zone di esempio per il calendario ritiri (solo Qualiano ha il calendario; gli altri comuni sono vuoti)
do $$
declare
  c record; t record; cid uuid; tid uuid;
begin
  for c in select * from (values
      ('Italia'), ('United Kingdom'), ('France')) v(name) loop
    insert into places (kind, name) values ('country', c.name) on conflict do nothing;
  end loop;

  for t in select * from (values
      ('Italia',         'Napoli',  array['Qualiano', 'Giugliano in Campania', 'Pozzuoli']),
      ('Italia',         'Roma',    array['Fiumicino', 'Tivoli']),
      ('Italia',         'Milano',  array['Monza', 'Sesto San Giovanni']),
      ('United Kingdom', 'London',  array['Camden', 'Westminster']),
      ('France',         'Paris',   array['Versailles'])
    ) v(country, town, comuni) loop
    select id into cid from places where kind = 'country' and name = t.country;
    insert into places (kind, name, parent_id) values ('town', t.town, cid) on conflict do nothing;
    select id into tid from places where kind = 'town' and name = t.town and parent_id = cid;
    insert into places (kind, name, parent_id)
      select 'comune', x, tid from unnest(t.comuni) x on conflict do nothing;
  end loop;
end $$;

-- Calendario simulato: solo Qualiano (date relative a oggi). Si inserisce solo se Qualiano non ha ancora ritiri.
do $$
declare w record;
begin
  if exists (select 1 from collection_schedules where city = 'Qualiano') then return; end if;
  for w in select * from (values
      ('organico',        1, 'Raccolta settimanale organico'),
      ('plastica',        2, 'Raccolta settimanale plastica'),
      ('carta',           3, 'Raccolta settimanale carta'),
      ('vetro',           4, 'Raccolta settimanale vetro'),
      ('indifferenziato', 5, 'Raccolta settimanale indifferenziato'),
      ('RAEE',            6, 'Ritiro RAEE su prenotazione')
    ) v(waste, plus, note) loop
    insert into collection_schedules (city, neighborhood, waste_type, collection_date, notes)
    values ('Qualiano', null, w.waste, current_date + w.plus, w.note);
  end loop;
end $$;

-- Pulizia: toglie il calendario simulato delle altre città inserito in precedenza (restano solo i dati inseriti a mano)
delete from collection_schedules
where city <> 'Qualiano'
  and notes in ('Raccolta settimanale organico', 'Raccolta settimanale plastica', 'Raccolta settimanale carta',
                'Raccolta settimanale vetro', 'Raccolta settimanale indifferenziato', 'Ritiro RAEE su prenotazione');

-- Comuni con calendario già presente ma non ancora nella gerarchia: restano utilizzabili dagli utenti.


-- ========================= 7. AUTOMAZIONI (cron) =====================
-- Richiedono l'estensione pg_cron (Supabase: Database > Extensions > pg_cron, oppure la riga sotto).
-- Se non è disponibile lo script continua lo stesso: l'app pulisce comunque le richieste scadute a video.
do $$
begin
  create extension if not exists pg_cron;
  -- ogni ora: elimina le partnership rifiutate da più di 24 ore
  perform cron.schedule('gs-purge-rejected', '0 * * * *', 'select public.purge_rejected()');
  -- ogni sera alle 23:55 (UTC): se domani è il 1° del mese / dell'anno, assegna le medaglie
  perform cron.schedule('gs-auto-medals', '55 23 * * *', 'select public.auto_assign_medals()');
exception when others then
  raise notice 'pg_cron non attivo (%): attivalo da Database > Extensions e riesegui questo blocco', sqlerrm;
end $$;

-- =====================================================================
--  DOPO aver registrato l'utente Admin dall'app, esegui:
--  update profiles set role = 'admin' where lower(username) = 'admin';
-- =====================================================================

-- Aggiorna la cache dello schema di Supabase, così le tabelle nuove (es. places) sono subito disponibili all'app
notify pgrst, 'reload schema';
