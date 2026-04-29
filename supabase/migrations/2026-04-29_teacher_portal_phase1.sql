alter table public.profiles
add column if not exists role text not null default 'student'
check (role in ('student', 'teacher'));

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.class_enrollments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (class_id, student_id)
);

create index if not exists classes_teacher_id_idx on public.classes(teacher_id, created_at desc);
create index if not exists class_enrollments_class_id_idx on public.class_enrollments(class_id, created_at desc);
create index if not exists class_enrollments_student_id_idx on public.class_enrollments(student_id, created_at desc);

drop trigger if exists classes_touch_updated_at on public.classes;
create trigger classes_touch_updated_at
before update on public.classes
for each row execute function public.touch_updated_at();

alter table public.classes enable row level security;
alter table public.class_enrollments enable row level security;

drop policy if exists "Teachers manage their own classes" on public.classes;
create policy "Teachers manage their own classes"
on public.classes
for all
to authenticated
using (
  teacher_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'teacher'
  )
)
with check (
  teacher_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'teacher'
  )
);

drop policy if exists "Teachers manage enrollments for their classes" on public.class_enrollments;
create policy "Teachers manage enrollments for their classes"
on public.class_enrollments
for all
to authenticated
using (
  exists (
    select 1
    from public.classes c
    join public.profiles p on p.id = auth.uid()
    where c.id = class_enrollments.class_id
      and c.teacher_id = auth.uid()
      and p.role = 'teacher'
  )
)
with check (
  exists (
    select 1
    from public.classes c
    join public.profiles p on p.id = auth.uid()
    where c.id = class_enrollments.class_id
      and c.teacher_id = auth.uid()
      and p.role = 'teacher'
  )
);
