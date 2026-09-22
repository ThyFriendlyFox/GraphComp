# Style

<!-- The writing rules for every user-facing text: docs, UI copy, error
     messages, release notes. Based on Simplified Technical English.
     AGENTS.md house style governs code; this file governs words. -->

GraphComp uses one voice for every text.
The rules keep the text short, clear and easy to translate.

## Rules

1. Write one instruction in one sentence.
2. Keep an instruction under 20 words.
3. Keep a descriptive sentence under 25 words.
4. Use the active voice.
5. Use the simple present tense.
6. Use one word for one idea. Do not use synonyms.
7. Do not use contractions.
8. Do not use marketing words.
9. Start an instruction with the verb.
10. Use a list for a sequence of steps.
11. Use a table for a set of values.
12. Write numbers as digits.

## User interface

The user interface holds no explanatory text.
State the thing; never reassure about it.
Do not add a tooltip, a hint or a help line unless a human asks for one.
An icon-only control has an `aria-label` of 1 or 2 words: "Expand", "Zoom in".

## Terms

| Use | Do not use |
|---|---|
| canvas | board, stage, workspace |
| node | box, block (in UI copy), card (in UI copy) |
| edge | wire, link, connection line |
| port | handle (in docs; `Handle` is the React Flow API name), socket, pin |
| widget | control (in docs), input (in docs) |
| body | content, panel (for the collapsible part of a node) |
| panel | inset, section (for `NodePanel`) |
| grip | handle, drag bar |
| registry item | package, module |
| block | template, example (for `registry:block` items) |
| token | theme variable, CSS var |
| open / close (a node) | expand / collapse in docs; the `aria-label` values stay "Expand" / "Collapse" |
