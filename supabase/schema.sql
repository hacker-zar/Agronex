-- ============================================================================
-- AGRONEX — SCHEMA ÚNICO DE SUPABASE
--
-- Un solo archivo. Se corre UNA vez, completo, en el SQL Editor de una base vacía.
-- Reemplaza a las migraciones anteriores (01_enums, 02_migracion, 03_coordenadas).
-- v2: categorías completas (12), reseñas con puntajes por aspecto y "volvería a trabajar",
--     ubicación en vivo del trabajo (reservation_locations), demoras con tipo y minutos (incidents).
--
-- Qué crea:
--   * 12 tablas: profiles, machinery, availability_windows, reservations,
--     reservation_events, reservation_operation_events, reservation_schedule_proposals,
--     incidents, reviews, notifications, payments, reservation_locations
--   * Trigger que crea el perfil cuando alguien se registra
--   * Funciones que manejan los cambios de estado (el cliente NO hace UPDATE de estados)
--   * RLS + permisos por columna (el cliente no puede falsear rating, estados, precios, pagos)
--
-- Si ya existen tablas de Agronex, el script se detiene sin tocar nada y te dice cuáles.
-- Para empezar de cero, ver el bloque RESET al final del archivo.
-- Todo corre en una transacción: si algo falla, no queda nada a medias.
-- ============================================================================

begin;

-- ============================================================================
-- 0. Chequeo de base vacía + limpieza defensiva de restos anteriores
-- ============================================================================
do $$
declare
  v_found text;
begin
  select string_agg(table_name, ', ') into v_found
  from information_schema.tables
  where table_schema = 'public'
    and table_name in ('profiles', 'machinery', 'availability_windows', 'reservations',
                       'reservation_events', 'reservation_operation_events',
                       'reservation_schedule_proposals', 'incidents', 'reviews',
                       'notifications', 'payments', 'reservation_locations');
  if v_found is not null then
    raise exception
      'Ya existen tablas de Agronex (%). Este script es para una base vacia: borralas con el bloque RESET del final del archivo y volve a correrlo.',
      v_found;
  end if;
end $$;

-- Funciones sueltas de intentos anteriores (cualquier firma): se borran para no duplicar.
do $$
declare
  f record;
begin
  for f in
    select p.oid::regprocedure as sig
    from pg_proc p
    where p.pronamespace = 'public'::regnamespace
      and p.proname in ('set_updated_at', 'is_reservation_party', 'handle_new_user',
                        'machinery_before_insert', 'profiles_after_name_update',
                        'reservations_before_insert', 'reservations_after_insert',
                        'incidents_after_insert', 'reviews_before_insert', 'reviews_after_insert',
                        '_apply_reservation_status', 'transition_reservation', 'set_operation_stage',
                        'propose_schedule', 'respond_schedule', 'valid_category_ratings', 'report_location',
                        'reservations_after_status_update')
  loop
    execute format('drop function if exists %s cascade', f.sig);
  end loop;
end $$;

-- Triggers viejos sobre auth.users que llamaban a funciones de public (p. ej. un handle_new_user
-- anterior): se borran para que no creen perfiles duplicados.
do $$
declare
  t record;
begin
  for t in
    select tg.tgname
    from pg_trigger tg
    join pg_class c on c.oid = tg.tgrelid
    join pg_proc p on p.oid = tg.tgfoid
    where c.relnamespace = 'auth'::regnamespace and c.relname = 'users'
      and not tg.tgisinternal
      and p.pronamespace = 'public'::regnamespace
  loop
    execute format('drop trigger if exists %I on auth.users', t.tgname);
  end loop;
exception when others then
  raise notice 'No se pudieron revisar los triggers de auth.users: %', sqlerrm;
end $$;

-- ============================================================================
-- 1. Tablas
-- ============================================================================

-- 1.0 Validador de puntajes por aspecto de una reseña: objeto JSON con valores numéricos de 1 a 5
create function public.valid_category_ratings(c jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select jsonb_typeof(c) = 'object'
     and pg_column_size(c) <= 1024
     and not exists (
       select 1 from jsonb_each(c) e
       where case when jsonb_typeof(e.value) = 'number'
                  then (e.value #>> '{}')::numeric not between 1 and 5
                  else true end
     );
$$;

-- 1.1 Perfiles (1 fila por usuario de auth.users)
create table public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  name                 text not null default '',
  email                text not null default '',
  role                 text not null default 'ambos' check (role in ('productor', 'contratista', 'ambos')),
  zone                 text not null default '',
  hectares             numeric check (hectares is null or hectares >= 0),
  base_location        text not null default '',
  base_latitude        double precision,
  base_longitude       double precision,
  operation_radius_km  numeric not null default 80 check (operation_radius_km > 0),
  bio                  text not null default '',
  onboarding_completed boolean not null default false,
  terms_version        text,
  terms_accepted_at    timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  deleted_at           timestamptz,
  constraint profiles_base_coords_check check (
    (base_latitude is null) = (base_longitude is null)
    and (base_latitude is null
         or (base_latitude between -90 and 90 and base_longitude between -180 and 180))
  )
);

-- 1.2 Ofertas (camiones y maquinaria)
create table public.machinery (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid not null references public.profiles(id),
  category       text not null check (category in ('Camion', 'Tractor', 'Sembradora', 'Pulverizadora', 'Cosechadora', 'Embolsadora',
                                                    'Dron', 'Otros', 'Fertilizadora', 'Extractora', 'Acoplado', 'Tolva')),
  title          text not null check (char_length(title) between 1 and 120),
  price          numeric not null check (price > 0),
  price_unit     text not null default 'hectarea'
                 check (price_unit in ('hectarea', 'tonelada', 'bolsa', 'viaje', 'kilometro',
                                       'tonelada_kilometro', 'hora', 'dia', 'fijo')),
  location       text not null default '',
  latitude       double precision,
  longitude      double precision,
  availability   text not null default '',
  plate          text,
  owner_name     text not null default '',
  description    text not null default 'Maquinaria publicada para solicitar reserva.',
  min_hectares   numeric check (min_hectares is null or min_hectares >= 0),
  daily_capacity numeric check (daily_capacity is null or daily_capacity > 0),
  rating         numeric check (rating between 1 and 5),
  reviews_count  integer not null default 0,
  would_work_again_pct integer check (would_work_again_pct is null or would_work_again_pct between 0 and 100),
  has_operator   boolean not null default false,
  brand          text,
  model_year     integer check (model_year between 1950 and 2100),
  badge          text,
  highlight      text,
  offer_status   text not null default 'active' check (offer_status in ('active', 'paused', 'inactive')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz,
  constraint machinery_coords_check check (
    (latitude is null) = (longitude is null)
    and (latitude is null or (latitude between -90 and 90 and longitude between -180 and 180))
  )
);

-- 1.3 Ventanas de disponibilidad de una oferta
create table public.availability_windows (
  id              uuid primary key default gen_random_uuid(),
  machinery_id    uuid not null references public.machinery(id) on delete cascade,
  date_start      date not null,
  date_end        date not null,
  estimated_hours numeric check (estimated_hours is null or estimated_hours > 0),
  status          text not null default 'available'
                  check (status in ('available', 'partially_booked', 'unavailable')),
  created_at      timestamptz not null default now(),
  constraint availability_windows_dates check (date_end >= date_start)
);

-- 1.4 Reservas / solicitudes de trabajo
create table public.reservations (
  id                    uuid primary key default gen_random_uuid(),
  machinery_id          uuid not null references public.machinery(id),
  requester_id          uuid not null references public.profiles(id),
  owner_id              uuid not null references public.profiles(id),
  status                text not null default 'pending'
                        check (status in ('pending', 'schedule_counter', 'original_kept', 'accepted',
                                          'working', 'done', 'rejected', 'cancelled')),
  -- datos que copia el servidor al crear la reserva (el cliente no los manda)
  machine_title         text not null,
  owner_name            text not null default '',
  requester_name        text not null default '',
  category              text not null,
  price_unit            text check (price_unit is null or price_unit in
                          ('hectarea', 'tonelada', 'bolsa', 'viaje', 'kilometro',
                           'tonelada_kilometro', 'hora', 'dia', 'fijo')),
  unit_price            numeric check (unit_price is null or unit_price > 0),
  -- cuándo
  date_start            date not null,
  date_end              date,
  date_flexible         boolean not null default false,
  start_time            time,
  end_time              time,
  -- qué y cuánto
  job_type              text not null,
  job_other             text,
  urgency               text check (urgency is null or urgency in ('flexible', 'esta-semana', 'manana', 'hoy')),
  hectares              numeric check (hectares is null or hectares > 0),
  quantity              numeric check (quantity is null or quantity > 0),
  estimated_km          numeric check (estimated_km is null or estimated_km > 0),
  estimated_value       numeric check (estimated_value is null or estimated_value >= 0),
  cargo_type            text,
  -- dónde
  field_location        text not null default '',
  field_latitude        double precision,
  field_longitude       double precision,
  origin                text,
  origin_latitude       double precision,
  origin_longitude      double precision,
  destination           text,
  destination_latitude  double precision,
  destination_longitude double precision,
  -- extras propios de cada tipo de trabajo (cultivo, grano, condiciones de acceso, notas, etc.)
  details               jsonb not null default '{}'::jsonb,
  -- seguimiento
  operation_stage       text check (operation_stage is null or operation_stage in
                          ('accepted', 'on_way_origin', 'arrived_origin', 'loading', 'loaded',
                           'in_transit_destination', 'arrived_destination', 'unloading', 'unloaded', 'done',
                           'on_way_field', 'arrived_field', 'working_field', 'setup', 'planting',
                           'spraying', 'mixing', 'harvesting', 'wrapping_up')),
  operation_updated_at  timestamptz,
  resolved_at           timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint reservations_quantity_present check (hectares is not null or quantity is not null),
  constraint reservations_dates_check check (date_end is null or date_end >= date_start),
  constraint reservations_details_check check (jsonb_typeof(details) = 'object' and pg_column_size(details) <= 4096),
  constraint reservations_coords_check check (
    (field_latitude is null) = (field_longitude is null)
    and (field_latitude is null
         or (field_latitude between -90 and 90 and field_longitude between -180 and 180))
    and (origin_latitude is null) = (origin_longitude is null)
    and (origin_latitude is null
         or (origin_latitude between -90 and 90 and origin_longitude between -180 and 180))
    and (destination_latitude is null) = (destination_longitude is null)
    and (destination_latitude is null
         or (destination_latitude between -90 and 90 and destination_longitude between -180 and 180))
  )
);

-- 1.5 Historial de estados de la reserva
create table public.reservation_events (
  id             uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  status         text not null check (status in ('pending', 'schedule_counter', 'original_kept', 'accepted',
                                                  'working', 'done', 'rejected', 'cancelled')),
  note           text,
  created_at     timestamptz not null default now()
);

-- 1.6 Historial de etapas operativas (en camino, cargando, etc.)
create table public.reservation_operation_events (
  id             uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  stage          text not null check (stage in
                   ('accepted', 'on_way_origin', 'arrived_origin', 'loading', 'loaded',
                    'in_transit_destination', 'arrived_destination', 'unloading', 'unloaded', 'done',
                    'on_way_field', 'arrived_field', 'working_field', 'setup', 'planting',
                    'spraying', 'mixing', 'harvesting', 'wrapping_up')),
  label          text not null,
  created_at     timestamptz not null default now()
);

-- 1.7 Propuestas de horario: contrapropuesta del contratista y pedidos de reprogramación
create table public.reservation_schedule_proposals (
  id             uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  kind           text not null check (kind in ('counter', 'reschedule')),
  proposed_by    uuid not null references public.profiles(id),
  date_start     date not null,
  date_end       date,
  start_time     time,
  end_time       time,
  reason         text check (reason is null or char_length(reason) <= 300),
  status         text not null default 'pending'
                 check (status in ('pending', 'accepted', 'rejected', 'original_kept', 'cancelled')),
  created_at     timestamptz not null default now(),
  resolved_at    timestamptz
);

-- 1.8 Incidentes y demoras reportados durante el trabajo
create table public.incidents (
  id             uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  reason         text not null default '',
  -- Si es una demora: cuándo ocurre (inicio / ejecución / final) y cuántos minutos.
  -- Sin estos dos campos es un incidente común (ruta cortada, problema mecánico, etc.).
  delay_type     text check (delay_type is null or delay_type in ('start', 'execution', 'end')),
  delay_minutes  integer check (delay_minutes is null or delay_minutes between 1 and 1440),
  reported_by    uuid not null references public.profiles(id),
  created_at     timestamptz not null default now(),
  constraint incidents_reason_check check (
    char_length(reason) <= 300 and (char_length(reason) >= 1 or delay_minutes is not null)
  ),
  constraint incidents_delay_pair check ((delay_type is null) = (delay_minutes is null))
);

-- 1.9 Reseñas (solo sobre trabajos finalizados)
create table public.reviews (
  id             uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  reviewer_id    uuid not null references public.profiles(id),
  reviewee_id    uuid not null references public.profiles(id),
  reviewer_role  text not null check (reviewer_role in ('producer', 'contractor')),
  rating         smallint not null check (rating between 1 and 5),
  category_ratings jsonb not null default '{}'::jsonb,
  would_work_again boolean not null,
  tags           text[] not null default '{}',
  comment        text check (comment is null or char_length(comment) <= 500),
  created_at     timestamptz not null default now(),
  constraint reviews_one_per_party unique (reservation_id, reviewer_id),
  constraint reviews_category_ratings_check check (public.valid_category_ratings(category_ratings))
);

-- 1.10 Notificaciones
--   type usados por la app: system, job_request, job_accepted, job_cancelled, review, message,
--   producer, contractor
create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null default 'system',
  title      text not null,
  body       text,
  priority   text not null default 'LOW' check (priority in ('LOW', 'MEDIUM', 'HIGH')),
  read       boolean not null default false,
  related_id uuid,
  created_at timestamptz not null default now()
);

-- 1.11 Pagos (solo lectura para las partes; lo escribe el servidor)
create table public.payments (
  id                uuid primary key default gen_random_uuid(),
  reservation_id    uuid not null references public.reservations(id),
  producer_id       uuid not null references public.profiles(id),
  contractor_id     uuid not null references public.profiles(id),
  amount            numeric not null check (amount > 0),
  platform_fee      numeric not null default 0 check (platform_fee >= 0),
  contractor_amount numeric not null check (contractor_amount >= 0),
  currency          text not null default 'ARS',
  status            text not null default 'pending' check (status in ('pending', 'paid', 'released', 'cancelled')),
  paid_at           timestamptz,
  released_at       timestamptz,
  payment_method    text,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- 1.12 Última ubicación compartida por el contratista mientras el trabajo está en curso.
--      Una sola fila por reserva (no se guarda historial). Se borra sola al terminar el trabajo.
create table public.reservation_locations (
  reservation_id uuid primary key references public.reservations(id) on delete cascade,
  latitude       double precision not null check (latitude between -90 and 90),
  longitude      double precision not null check (longitude between -180 and 180),
  accuracy_m     numeric check (accuracy_m is null or accuracy_m >= 0),
  updated_at     timestamptz not null default now()
);

-- ============================================================================
-- 2. Índices (columnas que usan las políticas RLS y los joins)
-- ============================================================================
create index idx_machinery_owner           on public.machinery (owner_id);
create index idx_machinery_catalog         on public.machinery (offer_status, created_at desc) where deleted_at is null;
create index idx_availability_machinery    on public.availability_windows (machinery_id);
create index idx_reservations_requester    on public.reservations (requester_id);
create index idx_reservations_owner        on public.reservations (owner_id);
create index idx_reservations_machinery    on public.reservations (machinery_id);
create index idx_res_events_reservation    on public.reservation_events (reservation_id);
create index idx_res_op_events_reservation on public.reservation_operation_events (reservation_id);
create index idx_proposals_reservation     on public.reservation_schedule_proposals (reservation_id);
create index idx_incidents_reservation     on public.incidents (reservation_id);
create index idx_reviews_reservation       on public.reviews (reservation_id);
create index idx_notifications_user_read   on public.notifications (user_id, read);
create index idx_payments_producer         on public.payments (producer_id);
create index idx_payments_contractor       on public.payments (contractor_id);

-- ============================================================================
-- 3. Funciones y triggers
-- ============================================================================

-- 3.1 updated_at automático
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end $$;

create trigger trg_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_set_updated_at before update on public.machinery
  for each row execute function public.set_updated_at();
create trigger trg_set_updated_at before update on public.reservations
  for each row execute function public.set_updated_at();
create trigger trg_set_updated_at before update on public.payments
  for each row execute function public.set_updated_at();

-- 3.2 Perfil automático al registrarse (datos que manda el cliente en options.data del signUp:
--     name, role, terms_version)
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text := coalesce(new.raw_user_meta_data ->> 'role', 'ambos');
  v_terms text := nullif(new.raw_user_meta_data ->> 'terms_version', '');
begin
  if v_role not in ('productor', 'contratista', 'ambos') then
    v_role := 'ambos';
  end if;

  insert into public.profiles (id, email, name, role, terms_version, terms_accepted_at)
  values (
    new.id,
    coalesce(new.email, ''),
    left(coalesce(new.raw_user_meta_data ->> 'name', ''), 60),
    v_role,
    v_terms,
    case when v_terms is not null then now() end
  )
  on conflict (id) do nothing;

  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Usuarios que ya existían en auth.users antes de este script
insert into public.profiles (id, email, name)
select u.id, coalesce(u.email, ''), left(coalesce(u.raw_user_meta_data ->> 'name', ''), 60)
from auth.users u
on conflict (id) do nothing;

-- 3.3 Si el usuario cambia su nombre, se actualiza en sus ofertas
create function public.profiles_after_name_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.name is distinct from old.name then
    update public.machinery set owner_name = new.name where owner_id = new.id;
  end if;
  return new;
end $$;

create trigger trg_profiles_after_name_update
  after update of name on public.profiles
  for each row execute function public.profiles_after_name_update();

-- 3.4 ¿El usuario actual es parte (solicitante o dueño) de la reserva?
create function public.is_reservation_party(p_reservation uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.reservations r
    where r.id = p_reservation and auth.uid() in (r.requester_id, r.owner_id)
  );
$$;

-- 3.5 Ofertas: el nombre del dueño sale del perfil, no del cliente
create function public.machinery_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select coalesce(p.name, '') into new.owner_name
  from public.profiles p where p.id = new.owner_id;
  new.owner_name := coalesce(new.owner_name, '');
  return new;
end $$;

create trigger trg_machinery_before_insert
  before insert on public.machinery
  for each row execute function public.machinery_before_insert();

-- 3.6 Reservas: los datos copiados de la oferta los pone el servidor (el cliente no puede falsearlos)
create function public.reservations_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  m record;
begin
  select mc.owner_id, mc.title, mc.owner_name, mc.category, mc.price, mc.price_unit,
         mc.offer_status, mc.deleted_at
    into m
    from public.machinery mc
   where mc.id = new.machinery_id;

  if not found or m.deleted_at is not null or m.offer_status <> 'active' then
    raise exception 'Esta oferta no está disponible.' using errcode = '22023';
  end if;
  if m.owner_id = new.requester_id then
    raise exception 'No podés reservar tu propia oferta.' using errcode = '22023';
  end if;

  new.owner_id             := m.owner_id;
  new.machine_title        := m.title;
  new.owner_name           := m.owner_name;
  new.category             := m.category;
  new.price_unit           := m.price_unit;
  new.unit_price           := m.price;
  new.status               := 'pending';
  new.resolved_at          := null;
  new.operation_stage      := null;
  new.operation_updated_at := null;

  select coalesce(p.name, '') into new.requester_name
    from public.profiles p where p.id = new.requester_id;

  return new;
end $$;

create trigger trg_reservations_before_insert
  before insert on public.reservations
  for each row execute function public.reservations_before_insert();

-- Evento inicial + aviso al dueño
create function public.reservations_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.reservation_events (reservation_id, status) values (new.id, new.status);
  insert into public.notifications (user_id, type, title, body, priority, related_id)
  values (new.owner_id, 'job_request', 'Nueva solicitud', new.machine_title, 'HIGH', new.id);
  return new;
end $$;

create trigger trg_reservations_after_insert
  after insert on public.reservations
  for each row execute function public.reservations_after_insert();

-- 3.7 Incidentes: aviso a la otra parte
create function public.incidents_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.reservations;
  v_other uuid;
  v_title text;
  v_body text;
begin
  select * into r from public.reservations where id = new.reservation_id;
  v_other := case when new.reported_by = r.owner_id then r.requester_id else r.owner_id end;

  if new.delay_minutes is not null then
    v_title := 'Demora reportada';
    v_body := 'Demora de ' || new.delay_minutes || ' min'
              || case new.delay_type when 'start' then ' al inicio'
                                     when 'execution' then ' durante el trabajo'
                                     else ' al final' end
              || case when new.reason <> '' then ': ' || new.reason else '' end;
  else
    v_title := 'Incidente reportado';
    v_body := new.reason;
  end if;

  insert into public.notifications (user_id, type, title, body, priority, related_id)
  values (v_other, 'system', v_title, v_body, 'HIGH', r.id);
  return new;
end $$;

create trigger trg_incidents_after_insert
  after insert on public.incidents
  for each row execute function public.incidents_after_insert();

-- 3.8 Reseñas: reviewer/reviewee/rol salen del servidor; solo sobre trabajos finalizados
create function public.reviews_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.reservations;
  v_uid uuid := auth.uid();
begin
  select * into r from public.reservations where id = new.reservation_id;
  if not found or v_uid is null or v_uid not in (r.owner_id, r.requester_id) then
    raise exception 'No tenés acceso a esta reserva.' using errcode = '42501';
  end if;
  if r.status <> 'done' then
    raise exception 'Solo se puede calificar un trabajo finalizado.' using errcode = '22023';
  end if;
  new.reviewer_id   := v_uid;
  new.reviewer_role := case when v_uid = r.requester_id then 'producer' else 'contractor' end;
  new.reviewee_id   := case when v_uid = r.requester_id then r.owner_id else r.requester_id end;
  return new;
end $$;

create trigger trg_reviews_before_insert
  before insert on public.reviews
  for each row execute function public.reviews_before_insert();

-- Recalcula rating y cantidad de reseñas de la oferta (solo reseñas hechas por productores)
create function public.reviews_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_machinery uuid;
begin
  if new.reviewer_role <> 'producer' then
    return new;
  end if;
  select r.machinery_id into v_machinery from public.reservations r where r.id = new.reservation_id;
  update public.machinery m
     set rating = s.avg_rating, reviews_count = s.cnt, would_work_again_pct = s.pct
    from (
      select round(avg(v.rating)::numeric, 1) as avg_rating,
             count(*)::int as cnt,
             round(100.0 * count(*) filter (where v.would_work_again) / count(*))::int as pct
        from public.reviews v
        join public.reservations rs on rs.id = v.reservation_id
       where rs.machinery_id = v_machinery and v.reviewer_role = 'producer'
    ) s
   where m.id = v_machinery;
  return new;
end $$;

create trigger trg_reviews_after_insert
  after insert on public.reviews
  for each row execute function public.reviews_after_insert();

-- 3.9 Interna: aplica un cambio de estado, deja evento y avisa a la otra parte.
--     No es invocable por el cliente.
create function public._apply_reservation_status(
  p_id uuid, p_status text, p_actor uuid, p_note text default null
)
returns public.reservations
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.reservations;
  v_other uuid;
  v_title text;
  v_type text;
  v_priority text;
begin
  update public.reservations
     set status = p_status,
         resolved_at = case when p_status in ('accepted', 'rejected', 'cancelled', 'done')
                            then coalesce(resolved_at, now()) else resolved_at end
   where id = p_id
   returning * into r;

  insert into public.reservation_events (reservation_id, status, note)
  values (r.id, p_status, left(p_note, 300));

  v_other := case when p_actor = r.owner_id then r.requester_id else r.owner_id end;
  select
    case p_status
      when 'accepted'         then 'Solicitud aceptada'
      when 'rejected'         then 'Solicitud rechazada'
      when 'cancelled'        then 'Solicitud cancelada'
      when 'original_kept'    then 'El productor mantiene el horario original'
      when 'schedule_counter' then 'Nueva propuesta de horario'
      when 'working'          then 'Trabajo en curso'
      when 'done'             then 'Trabajo finalizado'
      else 'Cambió el estado de tu solicitud'
    end,
    case p_status
      when 'accepted'  then 'job_accepted'
      when 'rejected'  then 'job_cancelled'
      when 'cancelled' then 'job_cancelled'
      else 'system'
    end,
    case when p_status in ('accepted', 'schedule_counter') then 'HIGH' else 'MEDIUM' end
  into v_title, v_type, v_priority;

  insert into public.notifications (user_id, type, title, body, priority, related_id)
  values (v_other, v_type, v_title, r.machine_title, v_priority, r.id);

  return r;
end $$;

-- 3.10 Transiciones simples de estado, con permisos por rol
--        contratista (dueño): pending / original_kept -> accepted | rejected
--        productor (solicitante): pending -> cancelled
create function public.transition_reservation(
  p_id uuid, p_status text, p_note text default null
)
returns public.reservations
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.reservations;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Necesitás iniciar sesión.' using errcode = '28000';
  end if;

  select * into r from public.reservations where id = p_id for update;
  if not found or v_uid not in (r.owner_id, r.requester_id) then
    raise exception 'No tenés acceso a esta reserva.' using errcode = '42501';
  end if;

  if not (
       (v_uid = r.owner_id     and r.status in ('pending', 'original_kept') and p_status in ('accepted', 'rejected'))
    or (v_uid = r.requester_id and r.status = 'pending'                     and p_status = 'cancelled')
  ) then
    raise exception 'Transición no permitida (% a %).', r.status, p_status using errcode = '22023';
  end if;

  return public._apply_reservation_status(p_id, p_status, v_uid, p_note);
end $$;

-- 3.11 Etapas operativas del trabajo (solo el contratista)
create function public.set_operation_stage(
  p_id uuid, p_stage text, p_label text default null
)
returns public.reservations
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.reservations;
  v_uid uuid := auth.uid();
  v_prev text;
  v_status text;
  v_label text;
begin
  if v_uid is null then
    raise exception 'Necesitás iniciar sesión.' using errcode = '28000';
  end if;

  select * into r from public.reservations where id = p_id for update;
  if not found or r.owner_id <> v_uid then
    raise exception 'Solo el contratista puede actualizar la operación.' using errcode = '42501';
  end if;

  v_prev := r.status;
  if v_prev not in ('accepted', 'working') then
    raise exception 'La reserva no admite cambios de operación en este estado.' using errcode = '22023';
  end if;

  v_label  := left(coalesce(nullif(trim(p_label), ''), p_stage), 80);
  v_status := case when p_stage = 'done' then 'done'
                   when p_stage = 'accepted' then 'accepted'
                   else 'working' end;

  update public.reservations
     set operation_stage = p_stage,          -- si la etapa no existe, falla por el CHECK
         operation_updated_at = now(),
         status = v_status,
         resolved_at = case when v_status = 'done' then coalesce(resolved_at, now()) else resolved_at end
   where id = p_id
   returning * into r;

  insert into public.reservation_operation_events (reservation_id, stage, label)
  values (r.id, p_stage, v_label);

  if v_status <> v_prev then
    insert into public.reservation_events (reservation_id, status) values (r.id, v_status);
  end if;

  insert into public.notifications (user_id, type, title, body, priority, related_id)
  values (r.requester_id, 'system', v_label, r.machine_title, 'MEDIUM', r.id);

  return r;
end $$;

-- 3.12 Proponer horario
--        counter    : el contratista contrapropone sobre una solicitud pendiente
--        reschedule : cualquiera de las partes pide cambiar la fecha (pendiente o aceptada)
create function public.propose_schedule(
  p_reservation uuid,
  p_kind text,
  p_date_start date,
  p_date_end date default null,
  p_start_time time default null,
  p_end_time time default null,
  p_reason text default null
)
returns public.reservation_schedule_proposals
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.reservations;
  v_uid uuid := auth.uid();
  v_prop public.reservation_schedule_proposals;
  v_other uuid;
begin
  if v_uid is null then
    raise exception 'Necesitás iniciar sesión.' using errcode = '28000';
  end if;

  select * into r from public.reservations where id = p_reservation for update;
  if not found or v_uid not in (r.owner_id, r.requester_id) then
    raise exception 'No tenés acceso a esta reserva.' using errcode = '42501';
  end if;

  if p_kind not in ('counter', 'reschedule') then
    raise exception 'Tipo de propuesta inválido.' using errcode = '22023';
  end if;
  if p_date_end is not null and p_date_end < p_date_start then
    raise exception 'La fecha de fin no puede ser anterior al inicio.' using errcode = '22023';
  end if;
  if p_start_time is not null and p_end_time is not null
     and p_end_time <= p_start_time
     and (p_date_end is null or p_date_end = p_date_start) then
    raise exception 'La hora de finalización debe ser posterior al inicio.' using errcode = '22023';
  end if;
  if exists (select 1 from public.reservation_schedule_proposals
              where reservation_id = r.id and status = 'pending') then
    raise exception 'Ya hay una propuesta de horario pendiente.' using errcode = '22023';
  end if;

  if p_kind = 'counter' then
    if v_uid <> r.owner_id or r.status <> 'pending' then
      raise exception 'Solo el contratista puede contraproponer sobre una solicitud pendiente.' using errcode = '22023';
    end if;
  else
    if r.status not in ('pending', 'accepted') then
      raise exception 'No se puede reprogramar en este estado.' using errcode = '22023';
    end if;
  end if;

  insert into public.reservation_schedule_proposals
    (reservation_id, kind, proposed_by, date_start, date_end, start_time, end_time, reason)
  values
    (r.id, p_kind, v_uid, p_date_start, p_date_end, p_start_time, p_end_time, left(p_reason, 300))
  returning * into v_prop;

  if p_kind = 'counter' then
    perform public._apply_reservation_status(r.id, 'schedule_counter', v_uid, p_reason);
  else
    v_other := case when v_uid = r.owner_id then r.requester_id else r.owner_id end;
    insert into public.notifications (user_id, type, title, body, priority, related_id)
    values (v_other, 'system', 'Propuesta de cambio de fecha', r.machine_title, 'HIGH', r.id);
  end if;

  return v_prop;
end $$;

-- 3.13 Responder una propuesta de horario
--        counter    : solo el productor -> accept | keep_original | cancel
--        reschedule : solo la otra parte -> accept | reject
create function public.respond_schedule(p_proposal uuid, p_action text)
returns public.reservation_schedule_proposals
language plpgsql
security definer
set search_path = ''
as $$
declare
  pr public.reservation_schedule_proposals;
  r  public.reservations;
  v_uid uuid := auth.uid();
  v_new_status text;
begin
  if v_uid is null then
    raise exception 'Necesitás iniciar sesión.' using errcode = '28000';
  end if;

  select * into pr from public.reservation_schedule_proposals where id = p_proposal for update;
  if not found then
    raise exception 'La propuesta no existe.' using errcode = 'P0002';
  end if;

  select * into r from public.reservations where id = pr.reservation_id for update;
  if v_uid not in (r.owner_id, r.requester_id) then
    raise exception 'No tenés acceso a esta reserva.' using errcode = '42501';
  end if;
  if pr.status <> 'pending' then
    raise exception 'La propuesta ya fue respondida.' using errcode = '22023';
  end if;

  if pr.kind = 'counter' then
    if v_uid <> r.requester_id or r.status <> 'schedule_counter' then
      raise exception 'Solo el productor puede responder la contrapropuesta.' using errcode = '22023';
    end if;
    if p_action not in ('accept', 'keep_original', 'cancel') then
      raise exception 'Acción inválida.' using errcode = '22023';
    end if;

    if p_action = 'accept' then
      update public.reservations
         set date_start = pr.date_start,
             date_end   = pr.date_end,
             start_time = coalesce(pr.start_time, start_time),
             end_time   = coalesce(pr.end_time, end_time)
       where id = r.id;
    end if;

    v_new_status := case p_action
      when 'accept' then 'accepted'
      when 'keep_original' then 'original_kept'
      else 'cancelled' end;

    update public.reservation_schedule_proposals
       set status = v_new_status, resolved_at = now()
     where id = pr.id
     returning * into pr;

    perform public._apply_reservation_status(r.id, v_new_status, v_uid, null);

  else  -- reschedule
    if v_uid = pr.proposed_by then
      raise exception 'No podés responder tu propia propuesta.' using errcode = '22023';
    end if;
    if p_action not in ('accept', 'reject') then
      raise exception 'Acción inválida.' using errcode = '22023';
    end if;

    if p_action = 'accept' then
      update public.reservations
         set date_start = pr.date_start,
             date_end   = pr.date_end,
             start_time = coalesce(pr.start_time, start_time),
             end_time   = coalesce(pr.end_time, end_time)
       where id = r.id;
    end if;

    update public.reservation_schedule_proposals
       set status = case when p_action = 'accept' then 'accepted' else 'rejected' end,
           resolved_at = now()
     where id = pr.id
     returning * into pr;

    if p_action = 'accept' and r.status = 'pending' then
      perform public._apply_reservation_status(r.id, 'accepted', v_uid, null);
    else
      insert into public.notifications (user_id, type, title, body, priority, related_id)
      values (pr.proposed_by, 'system',
              case when p_action = 'accept' then 'Cambio de fecha aceptado' else 'Cambio de fecha rechazado' end,
              r.machine_title, 'MEDIUM', r.id);
    end if;
  end if;

  return pr;
end $$;

-- 3.14 Ubicación en vivo: solo el contratista, solo con el trabajo en curso, como mucho 1 vez cada 3 s
create function public.report_location(
  p_reservation uuid,
  p_latitude double precision,
  p_longitude double precision,
  p_accuracy numeric default null
)
returns public.reservation_locations
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.reservations;
  v_uid uuid := auth.uid();
  v_loc public.reservation_locations;
begin
  if v_uid is null then
    raise exception 'Necesitás iniciar sesión.' using errcode = '28000';
  end if;

  select * into r from public.reservations where id = p_reservation;
  if not found or r.owner_id <> v_uid then
    raise exception 'Solo el contratista puede compartir su ubicación.' using errcode = '42501';
  end if;
  if r.status <> 'working' then
    raise exception 'La ubicación solo se comparte mientras el trabajo está en curso.' using errcode = '22023';
  end if;
  if p_latitude is null or p_longitude is null
     or p_latitude not between -90 and 90 or p_longitude not between -180 and 180 then
    raise exception 'Coordenadas inválidas.' using errcode = '22023';
  end if;

  insert into public.reservation_locations as l (reservation_id, latitude, longitude, accuracy_m)
  values (r.id, p_latitude, p_longitude, p_accuracy)
  on conflict (reservation_id) do update
     set latitude = excluded.latitude,
         longitude = excluded.longitude,
         accuracy_m = excluded.accuracy_m,
         updated_at = now()
   where l.updated_at < now() - interval '3 seconds'
  returning * into v_loc;

  if v_loc.reservation_id is null then   -- llegó antes de los 3 s: se devuelve la última guardada
    select * into v_loc from public.reservation_locations where reservation_id = r.id;
  end if;
  return v_loc;
end $$;

-- Al salir de "en curso" (terminado, cancelado, etc.) se borra la ubicación compartida
create function public.reservations_after_status_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status and new.status <> 'working' then
    delete from public.reservation_locations where reservation_id = new.id;
  end if;
  return new;
end $$;

create trigger trg_reservations_after_status_update
  after update of status on public.reservations
  for each row execute function public.reservations_after_status_update();

-- ============================================================================
-- 4. Seguridad: RLS + permisos por columna
-- ============================================================================
alter table public.profiles                       enable row level security;
alter table public.machinery                      enable row level security;
alter table public.availability_windows           enable row level security;
alter table public.reservations                   enable row level security;
alter table public.reservation_events             enable row level security;
alter table public.reservation_operation_events   enable row level security;
alter table public.reservation_schedule_proposals enable row level security;
alter table public.incidents                      enable row level security;
alter table public.reviews                        enable row level security;
alter table public.notifications                  enable row level security;
alter table public.payments                       enable row level security;
alter table public.reservation_locations          enable row level security;

-- Partir de cero: nadie tiene nada; después se otorga lo mínimo.
revoke all on public.profiles, public.machinery, public.availability_windows, public.reservations,
              public.reservation_events, public.reservation_operation_events,
              public.reservation_schedule_proposals, public.incidents, public.reviews,
              public.notifications, public.payments, public.reservation_locations
  from anon, authenticated;

-- 4.1 profiles: cada uno ve y edita el suyo; las contrapartes de una reserva se ven entre sí
grant select on public.profiles to authenticated;
grant update (name, zone, hectares, base_location, base_latitude, base_longitude,
              operation_radius_km, bio, role, onboarding_completed, terms_version, terms_accepted_at)
  on public.profiles to authenticated;

create policy profiles_select on public.profiles for select to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1 from public.reservations r
       where (r.requester_id = auth.uid() and r.owner_id = profiles.id)
          or (r.owner_id = auth.uid() and r.requester_id = profiles.id)
    )
  );

create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- 4.2 machinery: catálogo público (activas); el dueño ve y edita las suyas.
--     rating, reviews_count, badge, highlight y owner_name NO son escribibles desde el cliente.
grant select on public.machinery to anon, authenticated;
grant insert (owner_id, category, title, price, price_unit, location, latitude, longitude, availability,
              plate, description, min_hectares, daily_capacity, has_operator, brand, model_year)
  on public.machinery to authenticated;
grant update (category, title, price, price_unit, location, latitude, longitude, availability,
              plate, description, min_hectares, daily_capacity, has_operator, brand, model_year,
              offer_status, deleted_at)
  on public.machinery to authenticated;

create policy machinery_select_public on public.machinery for select to anon, authenticated
  using (deleted_at is null and offer_status = 'active');

create policy machinery_select_own on public.machinery for select to authenticated
  using (owner_id = auth.uid());

create policy machinery_insert on public.machinery for insert to authenticated
  with check (owner_id = auth.uid());

create policy machinery_update on public.machinery for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- 4.3 availability_windows: las ve quien ve la oferta; solo el dueño las gestiona (sin DELETE)
grant select on public.availability_windows to anon, authenticated;
grant insert (machinery_id, date_start, date_end, estimated_hours) on public.availability_windows to authenticated;
grant update (date_start, date_end, estimated_hours, status) on public.availability_windows to authenticated;

create policy availability_select on public.availability_windows for select to anon, authenticated
  using (exists (select 1 from public.machinery m where m.id = availability_windows.machinery_id));

create policy availability_insert on public.availability_windows for insert to authenticated
  with check (exists (select 1 from public.machinery m
                       where m.id = availability_windows.machinery_id and m.owner_id = auth.uid()));

create policy availability_update on public.availability_windows for update to authenticated
  using (exists (select 1 from public.machinery m
                  where m.id = availability_windows.machinery_id and m.owner_id = auth.uid()))
  with check (exists (select 1 from public.machinery m
                       where m.id = availability_windows.machinery_id and m.owner_id = auth.uid()));

-- 4.4 reservations: solo las partes la ven; el cliente solo puede CREAR (los cambios van por funciones)
grant select on public.reservations to authenticated;
grant insert (machinery_id, requester_id, date_start, date_end, date_flexible, start_time, end_time,
              job_type, job_other, urgency, hectares, quantity, estimated_km, estimated_value, cargo_type,
              field_location, field_latitude, field_longitude, origin, origin_latitude, origin_longitude,
              destination, destination_latitude, destination_longitude, details)
  on public.reservations to authenticated;

create policy reservations_select on public.reservations for select to authenticated
  using (requester_id = auth.uid() or owner_id = auth.uid());

create policy reservations_insert on public.reservations for insert to authenticated
  with check (requester_id = auth.uid());

-- 4.5 Historiales: solo lectura para las partes (los escriben las funciones)
grant select on public.reservation_events to authenticated;
grant select on public.reservation_operation_events to authenticated;
grant select on public.reservation_schedule_proposals to authenticated;

create policy res_events_select on public.reservation_events for select to authenticated
  using (public.is_reservation_party(reservation_id));

create policy res_op_events_select on public.reservation_operation_events for select to authenticated
  using (public.is_reservation_party(reservation_id));

create policy proposals_select on public.reservation_schedule_proposals for select to authenticated
  using (public.is_reservation_party(reservation_id));

-- 4.6 incidents: las partes los ven y los reportan
grant select on public.incidents to authenticated;
grant insert (reservation_id, reason, delay_type, delay_minutes, reported_by)
  on public.incidents to authenticated;

create policy incidents_select on public.incidents for select to authenticated
  using (public.is_reservation_party(reservation_id));

create policy incidents_insert on public.incidents for insert to authenticated
  with check (reported_by = auth.uid() and public.is_reservation_party(reservation_id));

-- 4.7 notifications: cada uno ve las suyas y puede marcarlas como leídas (nada más)
grant select on public.notifications to authenticated;
grant update (read) on public.notifications to authenticated;

create policy notifications_select on public.notifications for select to authenticated
  using (user_id = auth.uid());

create policy notifications_update on public.notifications for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 4.8 payments: SOLO lectura para las partes. Ninguna escritura desde el cliente.
grant select on public.payments to authenticated;

create policy payments_select on public.payments for select to authenticated
  using (producer_id = auth.uid() or contractor_id = auth.uid());

-- 4.9 reviews: las partes las ven; se crean solo sobre trabajos finalizados
grant select on public.reviews to authenticated;
grant insert (reservation_id, rating, category_ratings, would_work_again, tags, comment)
  on public.reviews to authenticated;

create policy reviews_select on public.reviews for select to authenticated
  using (public.is_reservation_party(reservation_id));

create policy reviews_insert on public.reviews for insert to authenticated
  with check (reviewer_id = auth.uid() and public.is_reservation_party(reservation_id));

-- 4.10 reservation_locations: solo lectura para las partes (la escribe report_location)
grant select on public.reservation_locations to authenticated;

create policy locations_select on public.reservation_locations for select to authenticated
  using (public.is_reservation_party(reservation_id));

-- 4.11 Permisos de ejecución de funciones
revoke all on function public.handle_new_user()                              from public, anon, authenticated;
revoke all on function public._apply_reservation_status(uuid, text, uuid, text) from public, anon, authenticated;

revoke all on function public.transition_reservation(uuid, text, text) from public, anon, authenticated;
grant execute on function public.transition_reservation(uuid, text, text) to authenticated;

revoke all on function public.set_operation_stage(uuid, text, text) from public, anon, authenticated;
grant execute on function public.set_operation_stage(uuid, text, text) to authenticated;

revoke all on function public.propose_schedule(uuid, text, date, date, time, time, text)
  from public, anon, authenticated;
grant execute on function public.propose_schedule(uuid, text, date, date, time, time, text) to authenticated;

revoke all on function public.respond_schedule(uuid, text) from public, anon, authenticated;
grant execute on function public.respond_schedule(uuid, text) to authenticated;

revoke all on function public.report_location(uuid, double precision, double precision, numeric)
  from public, anon, authenticated;
grant execute on function public.report_location(uuid, double precision, double precision, numeric) to authenticated;

revoke all on function public.valid_category_ratings(jsonb) from public, anon;
grant execute on function public.valid_category_ratings(jsonb) to authenticated;

revoke all on function public.is_reservation_party(uuid) from public, anon;
grant execute on function public.is_reservation_party(uuid) to authenticated;

commit;

-- ============================================================================
-- Verificación: deben aparecer las 12 tablas con rls_activo = true y políticas > 0
-- (excepto notifications/payments/etc. que igual tienen al menos 1)
-- ============================================================================
select c.relname as tabla, c.relrowsecurity as rls_activo,
       (select count(*) from pg_policies p where p.schemaname = 'public' and p.tablename = c.relname) as politicas
from pg_class c
where c.relnamespace = 'public'::regnamespace and c.relkind = 'r'
order by c.relname;

-- ============================================================================
-- RESET (solo si querés empezar de cero). Está comentado a propósito.
-- Descomentá, corrélo SOLO, y después volvé a correr este archivo completo.
-- ============================================================================
-- drop table if exists public.payments, public.reviews, public.notifications, public.incidents,
--   public.reservation_schedule_proposals, public.reservation_operation_events,
--   public.reservation_events, public.reservation_locations, public.reservations,
--   public.availability_windows, public.machinery, public.profiles cascade;