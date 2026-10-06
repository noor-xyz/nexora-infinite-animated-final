-- Make the first five Python levels match the starter curriculum.
-- Higher levels and all other worlds remain database-driven and unchanged.
update public.levels as l
set title = content.title,
    topic = content.topic,
    difficulty = content.difficulty,
    xp_reward = content.xp_reward,
    challenge_count = 5
from (
  values
    (1, 'Level 1 · Python Fundamentals', 'Python Fundamentals', 'beginner', 50),
    (2, 'Level 2 · Variables & Data Types', 'Variables & Data Types', 'beginner', 60),
    (3, 'Level 3 · Conditions', 'Conditions', 'intermediate', 70),
    (4, 'Level 4 · Loops', 'Loops', 'intermediate', 80),
    (5, 'Level 5 · Mini Challenge', 'Mini Challenge', 'advanced', 100)
) as content(level_number, title, topic, difficulty, xp_reward)
where l.world_id = 'python'
  and l.level_number = content.level_number
  and l.is_active = true;

update public.chapters
set title = 'Python Fundamentals',
    description = 'Build your Python foundation through variables, conditions, loops, and a mini challenge.'
where world_id = 'python'
  and chapter_number = 1;

with quiz_seed(level_number, challenge_number, prompt, options, answer, explanation, xp_reward) as (
  values
    (2, 1, 'What does this code display? value = 42; print(type(value).__name__)', '["str", "int", "float", "bool"]'::jsonb, 1, '42 is written as an integer literal, so its type name is int.', 12),
    (2, 2, 'After these statements, what is the value of score? score = 8; score += 3', '["11", "83", "8", "3"]'::jsonb, 0, 'The augmented assignment adds 3 to the current value 8, producing 11.', 12),
    (2, 3, 'What is the result of the Python expression "7" + "3"?', '["10", "73", "7 3", "A TypeError"]'::jsonb, 1, 'Both operands are strings, so + concatenates them rather than adding them numerically.', 12),
    (2, 4, 'What is the type name of is_ready in this assignment? is_ready = False', '["str", "bool", "int", "NoneType"]'::jsonb, 1, 'False is one of Python’s Boolean values, whose type name is bool.', 12),
    (2, 5, 'Which is a valid Python variable name?', '["player-score", "2nd_player", "player_score", "class"]'::jsonb, 2, 'Names can contain underscores and cannot start with a digit or use a reserved keyword.', 12),

    (3, 1, 'With temperature = 18, what does this expression produce? "warm" if temperature >= 20 else "mild" if temperature >= 15 else "cold"', '["warm", "mild", "cold", "Nothing"]'::jsonb, 1, '18 is below 20 but at least 15, so the nested conditional expression produces mild.', 14),
    (3, 2, 'Which operator checks whether lives is equal to zero in an if condition?', '["=", "==", "===", "!="]'::jsonb, 1, 'Python uses == to compare values. A single = assigns a value.', 14),
    (3, 3, 'What does this expression produce? "has items" if [] else "empty"', '["has items", "empty", "[]", "It raises an error"]'::jsonb, 1, 'An empty list is falsy in Python, so the conditional expression produces empty.', 14),
    (3, 4, 'With age = 16 and has_ticket = True, what does "enter" if age >= 18 and has_ticket else "not yet" produce?', '["enter", "True", "not yet", "Nothing"]'::jsonb, 2, 'The and condition is false because age is less than 18, so the expression produces not yet.', 14),
    (3, 5, 'Which grade is produced for score = 82? "A" if score >= 90 else "B" if score >= 70 else "C"', '["A", "B", "C", "No grade"]'::jsonb, 1, '82 does not meet the first threshold but does meet the nested condition threshold of 70.', 14),

    (4, 1, 'Which values are produced by for n in range(1, 4): print(n)?', '["1, 2, 3, 4", "0, 1, 2, 3", "1, 2, 3", "2, 3, 4"]'::jsonb, 2, 'range(1, 4) starts at 1 and stops before 4, producing 1, 2, and 3.', 16),
    (4, 2, 'A loop adds each value in [2, 4, 6] to total, which starts at 0. What is total after the loop?', '["12", "10", "6", "246"]'::jsonb, 0, 'The loop adds each number: 2 + 4 + 6 equals 12.', 16),
    (4, 3, 'Which sequence does list(range(2, 9, 3)) produce?', '["2, 3, 4, 5, 6, 7, 8", "2, 5, 8", "2, 5", "3, 6, 9"]'::jsonb, 1, 'range(start, stop, step) begins at 2, increases by 3, and excludes the stop value 9.', 16),
    (4, 4, 'A while loop starts counter at 0 and adds 1 while counter < 3. What is its final value?', '["2", "3", "4", "The loop never ends"]'::jsonb, 1, 'The loop increments counter until it reaches 3; then counter < 3 is false.', 16),
    (4, 5, 'What does this loop build? letters = []; for letter in "cat": letters.append(letter.upper())', '["[\"cat\"]", "[\"C\", \"A\", \"T\"]", "[\"c\", \"a\", \"t\"]", "[\"T\", \"A\", \"C\"]"]'::jsonb, 1, 'The loop visits each character and appends its uppercase form in the original order.', 16),

    (5, 1, 'A loop starts total at 0 and adds each price in [4, 6, 10] when price >= 5. What is total?', '["4", "10", "16", "20"]'::jsonb, 2, 'Only 6 and 10 meet the condition, and their sum is 16.', 20),
    (5, 2, 'A loop starts count at 0 and adds 1 for each value in [-2, 0, 3, 5] that is greater than 0. What is count?', '["2", "3", "1", "4"]'::jsonb, 0, 'Only 3 and 5 are greater than zero, so the count is 2.', 20),
    (5, 3, 'What does max(values) return when values = [72, 91, 58]?', '["72", "91", "58", "221"]'::jsonb, 1, 'max returns the largest item in the list, which is 91.', 20),
    (5, 4, 'A loop counts words longer than three characters in ["sun", "moon", "star"]. What is the count?', '["0", "1", "2", "3"]'::jsonb, 2, 'moon and star each have four characters, so two words satisfy the condition.', 20),
    (5, 5, 'What is printed, in order? for n in range(1, 4): print("even" if n % 2 == 0 else n)', '["even, 1, even", "1, even, 3", "1, 2, 3", "2, even, 4"]'::jsonb, 1, 'The loop visits 1, 2, and 3: odd values print themselves and 2 prints even.', 20)
)
insert into public.challenges (
  level_id,
  challenge_number,
  type,
  prompt,
  options,
  answer,
  explanation,
  xp_reward
)
select
  l.id,
  q.challenge_number,
  'quiz',
  q.prompt,
  q.options,
  to_jsonb(q.answer),
  q.explanation,
  q.xp_reward
from quiz_seed as q
join public.levels as l
  on l.world_id = 'python'
 and l.level_number = q.level_number
 and l.is_active = true
on conflict (level_id, challenge_number) do update
set type = excluded.type,
    prompt = excluded.prompt,
    options = excluded.options,
    answer = excluded.answer,
    explanation = excluded.explanation,
    xp_reward = excluded.xp_reward;
