with quiz_seed(world_id, topic, challenge_number, prompt, options, answer, explanation) as (
  values
    ('python', 'Getting Started', 1, 'Which Python command displays text in the console?', '["print(\"Hello\")", "echo(\"Hello\")", "show(\"Hello\")", "display(\"Hello\")"]'::jsonb, 0, 'The print() function writes the supplied value to the console.'),
    ('python', 'Getting Started', 2, 'Which file extension is conventionally used for a Python source file?', '[".py", ".python", ".pyt", ".pt"]'::jsonb, 0, 'Python source files conventionally use the .py extension.'),
    ('python', 'Getting Started', 3, 'Which characters begin a single-line comment in Python?', '["#", "//", "--", "/*"]'::jsonb, 0, 'A hash character begins a single-line comment in Python.'),
    ('python', 'Getting Started', 4, 'What does Python do with the expression 2 + 3?', '["Calculates 5", "Joins the digits into 23", "Prints 2 + 3 literally", "Raises an error"]'::jsonb, 0, 'The + operator adds the two integer values, producing 5.'),
    ('python', 'Getting Started', 5, 'Which statement assigns the value 7 to a variable named score?', '["score = 7", "7 = score", "let score := 7", "int score == 7"]'::jsonb, 0, 'Python uses a single equals sign to assign a value to a variable.'),

    ('javascript', 'Getting Started', 1, 'Which statement writes text to the developer console in JavaScript?', '["console.log(\"Hello\")", "print(\"Hello\")", "echo \"Hello\"", "System.out.println(\"Hello\")"]'::jsonb, 0, 'console.log() writes its argument to the JavaScript console.'),
    ('javascript', 'Getting Started', 2, 'Which file extension is commonly used for a JavaScript source file?', '[".js", ".java", ".jvs", ".script"]'::jsonb, 0, 'JavaScript source files conventionally use the .js extension.'),
    ('javascript', 'Getting Started', 3, 'Which prefix starts a single-line comment in JavaScript?', '["//", "#", "--", "<!--"]'::jsonb, 0, 'Two forward slashes begin a single-line JavaScript comment.'),
    ('javascript', 'Getting Started', 4, 'Which value represents the absence of an assigned value in JavaScript?', '["undefined", "empty", "voided", "nil"]'::jsonb, 0, 'A declared variable without an assigned value has the value undefined.'),
    ('javascript', 'Getting Started', 5, 'Which operator checks both value and type for equality in JavaScript?', '["===", "=", "==", "=>"]'::jsonb, 0, 'The strict equality operator === compares without converting operand types.'),

    ('java', 'Getting Started', 1, 'Which method is the standard entry point of a basic Java application?', '["public static void main(String[] args)", "public void start(String args)", "static int run()", "main()"]'::jsonb, 0, 'The Java launcher looks for the public static main method with a String array parameter.'),
    ('java', 'Getting Started', 2, 'Which statement prints text to standard output in Java?', '["System.out.println(\"Hello\");", "console.log(\"Hello\");", "print(\"Hello\");", "echo(\"Hello\");"]'::jsonb, 0, 'System.out.println prints the text and then ends the line.'),
    ('java', 'Getting Started', 3, 'Which file extension is used for Java source code?', '[".java", ".class", ".jar", ".jav"]'::jsonb, 0, 'Java source code is saved in files with the .java extension.'),
    ('java', 'Getting Started', 4, 'What does the Java compiler typically produce from a source file?', '["Bytecode for the Java Virtual Machine", "A SQL table", "A web page", "A Python module"]'::jsonb, 0, 'The Java compiler translates source code into bytecode that runs on a Java Virtual Machine.'),
    ('java', 'Getting Started', 5, 'Which character normally ends a Java statement?', '[";", ":", ".", ","]'::jsonb, 0, 'Java statements are normally terminated with a semicolon.'),

    ('c', 'Getting Started', 1, 'Which header provides the declaration for printf in standard C?', '["<stdio.h>", "<iostream>", "<stdlib.hpp>", "<print.h>"]'::jsonb, 0, 'The standard input/output header stdio.h declares printf.'),
    ('c', 'Getting Started', 2, 'Which function is the conventional entry point of a hosted C program?', '["main", "start", "init", "run"]'::jsonb, 0, 'Execution of a hosted C program begins in main.'),
    ('c', 'Getting Started', 3, 'Which printf format specifier is used for an int value?', '["%d", "%s", "%f", "%c"]'::jsonb, 0, '%d is the printf conversion specifier for a signed decimal integer.'),
    ('c', 'Getting Started', 4, 'Which file extension is commonly used for a C source file?', '[".c", ".cpp", ".java", ".py"]'::jsonb, 0, 'C source files conventionally use the .c extension.'),
    ('c', 'Getting Started', 5, 'What does the statement return 0; in main conventionally indicate?', '["The program finished successfully", "The program should repeat", "The program printed zero", "The compiler should stop"]'::jsonb, 0, 'Returning zero from main conventionally signals successful program termination.'),

    ('cpp', 'Getting Started', 1, 'Which standard header is commonly used for std::cout?', '["<iostream>", "<stdio.h>", "<string.h>", "<output>"]'::jsonb, 0, 'The iostream header provides the standard input and output stream objects, including std::cout.'),
    ('cpp', 'Getting Started', 2, 'Which expression writes Hello to standard output in C++?', '["std::cout << \"Hello\";", "System.out.println(\"Hello\");", "printf << \"Hello\";", "console.log(\"Hello\");"]'::jsonb, 0, 'The insertion operator << sends text to the std::cout output stream.'),
    ('cpp', 'Getting Started', 3, 'Which file extension is commonly used for a C++ source file?', '[".cpp", ".c", ".java", ".py"]'::jsonb, 0, 'C++ source files conventionally use the .cpp extension.'),
    ('cpp', 'Getting Started', 4, 'Which function is the conventional entry point of a C++ program?', '["main", "start", "execute", "program"]'::jsonb, 0, 'Execution of a standard C++ program begins in main.'),
    ('cpp', 'Getting Started', 5, 'What is the purpose of #include <iostream> in a C++ source file?', '["Make standard stream declarations available", "Create the main function", "Run the compiler", "Declare every variable"]'::jsonb, 0, 'The include directive makes declarations from the iostream header available to the source file.'),

    ('web', 'HTML Foundations', 1, 'Which HTML element represents the main heading on a page?', '["<h1>", "<head>", "<title>", "<header1>"]'::jsonb, 0, 'The h1 element represents the highest-level heading in the page content.'),
    ('web', 'HTML Foundations', 2, 'Which HTML element creates a hyperlink?', '["<a>", "<link>", "<href>", "<url>"]'::jsonb, 0, 'The a element creates a hyperlink, usually with its destination in the href attribute.'),
    ('web', 'HTML Foundations', 3, 'Which attribute provides the destination URL for a hyperlink?', '["href", "src", "action", "target"]'::jsonb, 0, 'The href attribute on an a element specifies the linked resource.'),
    ('web', 'HTML Foundations', 4, 'Which element is used to embed an image in an HTML page?', '["<img>", "<image>", "<picture-src>", "<figure-img>"]'::jsonb, 0, 'The img element embeds an image and uses src to identify its resource.'),
    ('web', 'HTML Foundations', 5, 'What is the purpose of the <!DOCTYPE html> declaration?', '["Declare the document as modern HTML for the browser", "Create the page title", "Load a CSS file", "Add a visible heading"]'::jsonb, 0, 'The doctype declaration tells the browser to parse the document using HTML standards mode.'),

    ('sql', 'Databases', 1, 'In a relational database, where is a single record usually stored?', '["In a row of a table", "In a database name", "In a column heading", "In an index page"]'::jsonb, 0, 'Each row in a relational table represents one record.'),
    ('sql', 'Databases', 2, 'What does a column in a relational table represent?', '["A field or attribute shared by the rows", "A complete database", "A saved query result only", "A relationship between servers"]'::jsonb, 0, 'A column defines one field, with values for that field stored across the table rows.'),
    ('sql', 'Databases', 3, 'What is the usual purpose of a primary key?', '["Uniquely identify each row in a table", "Sort every table automatically", "Encrypt the database", "Store multiple tables in one cell"]'::jsonb, 0, 'A primary key uniquely identifies each row in its table.'),
    ('sql', 'Databases', 4, 'Which SQL command is commonly used to retrieve rows from a table?', '["SELECT", "FETCH TABLE", "READ DATABASE", "OPEN ROWS"]'::jsonb, 0, 'SELECT queries and returns data from one or more tables.'),
    ('sql', 'Databases', 5, 'What does a foreign key usually represent?', '["A reference to a key in another or the same table", "A password for database access", "A copy of the entire database", "A required column heading"]'::jsonb, 0, 'A foreign key relates rows by referencing a key, commonly the primary key of another table.')
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
  reordered.options,
  to_jsonb((q.challenge_number - 1) % 4),
  q.explanation,
  10
from quiz_seed as q
join public.worlds as w
  on w.id = q.world_id
 and w.is_active = true
join public.levels as l
  on l.world_id = w.id
 and l.level_number = 1
 and l.topic = q.topic
 and l.is_active = true
cross join lateral (
  select jsonb_agg(q.options -> choice.source_index order by choice.display_index) as options
  from (
    select display_index,
           case
             when display_index = (q.challenge_number - 1) % 4 then q.answer
             when display_index < (q.challenge_number - 1) % 4 then display_index + 1
             else display_index
           end as source_index
    from generate_series(0, 3) as positions(display_index)
  ) as choice
) as reordered
on conflict (level_id, challenge_number) do update
set type = excluded.type,
    prompt = excluded.prompt,
    options = excluded.options,
    answer = excluded.answer,
    explanation = excluded.explanation,
    xp_reward = excluded.xp_reward;
