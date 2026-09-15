apostrophe.

# PROMPTS.md - [SGBusNow]
**Student:** [Ayumi Liow] · **Course:** MGMT 6110 · **Problem Set 1**
**User sentence:** A [Singapore commuter using public buses] opens this screen to [check when the next buses will arrive at one selected bus stop], and knows it worked when [screen shows bus arrival timings].
**Live link:** [https://sgbusnow.vercel.app/]

---

## Prompt 1 - the master prompt
ROLE: You are a senior front-end developer building a React web app.

GOAL: Build the front end of **BusNow**, a web product for Singapore commuters using public buses. Their job on this product is: **check when the next buses will arrive at one selected bus stop**.

Screens:

1. **Bus Arrival Screen:** Show one bus stop, its bus stop code and name, and all bus services serving it. For each service, show the next two arrival times in minutes. Show **“Arriving”** when under 1 minute. The user selects a bus stop and sees updated arrival information.
2. No other screens.

OUTPUT: A running app. Keep every invented value in ONE data file of its own, with at least 12 rows, so the screen looks real. One component per section. Readable on a phone at arm's length. When you are done, list the files you created and what each one holds.

GUARDRAILS: Screens and invented data only. Do NOT call the Gemini API or any other model. Do NOT call any outside service or fetch from any URL. No database, no login, no user accounts, no analytics. No features I did not list. No real company's name, logo, or trademark. Invented bus stop names, service numbers, and arrival times only.

CONTEXT: Individual Problem Set 1 for MGMT 6110 Human-AI Collaboration at SMU. Built in Google AI Studio, shared as a link, and opened on a phone by classmates in Week 3. I am not a programmer: when you make a choice I did not specify, say so in one line rather than burying it.

**What came back:** A running app, 7 files, preview loaded. It also added a
settings page I never asked for.
**What I changed next and why:** Added "no settings page" to the Guardrails, because
a missing guardrail is why it appeared.

---

## Prompt 2 - fix the empty state
```
When the list has no rows, show "Nothing due today" instead of an empty table.
Change nothing else.
```
**What came back:** Correct, one file touched.
**What I changed next and why:** Nothing. Moved to the next item on the Goal list.

---

## Prompt 3 - [and so on, one entry per prompt, in order]
Copy
