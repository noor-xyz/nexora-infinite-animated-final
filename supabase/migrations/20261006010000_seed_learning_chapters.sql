-- Group existing levels into five-level chapters without limiting the schema.
with level_groups as (
  select world_id, ((level_number - 1) / 5) + 1 as chapter_number,
         min(level_number) as first_level
  from public.levels
  group by world_id, ((level_number - 1) / 5) + 1
)
insert into public.chapters(world_id, chapter_number, title, description)
select g.world_id, g.chapter_number,
       coalesce(l.topic, 'Chapter ' || g.chapter_number),
       'Build your skills through levels ' || g.first_level || '–' || (g.first_level + 4) || '.'
from level_groups g
left join public.levels l on l.world_id = g.world_id and l.level_number = g.first_level
on conflict(world_id, chapter_number) do update
set title = excluded.title, description = excluded.description;

update public.levels l
set chapter_id = c.id
from public.chapters c
where c.world_id = l.world_id
  and c.chapter_number = ((l.level_number - 1) / 5) + 1
  and l.chapter_id is distinct from c.id;
