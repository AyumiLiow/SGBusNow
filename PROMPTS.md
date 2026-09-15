
# prompts.md - [SGBusNow]
**Student:** Ayumi Liow · **Course:** MGMT 6110 · **Problem Set 1**
**User sentence:** A Singapore commuter using public buses opens this screen to check when the next buses will arrive at one selected bus stop, and knows it worked when screen shows accurate live bus arrival timings.
**Live link:** https://sgbusnow.vercel.app/

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

**What came back:** A running app, 12 files, preview loaded.
**What I changed next and why:** nothing. app preview. 

---

## Prompt 2 - visual edits
```
make sure that all the sub-elements eg. bus number, are within this section. change nothing else.

```
**What came back:** Correct, edited 1 file.
**What I changed next and why:** visual elements, sub-elements were all over the place.

---

## Prompt 3 - new prompt for problem set 2
```
``ROLE: You are a senior full-stack developer working in my existing project. Do not
rewrite what is already there; add to it.
GOAL: My screen currently shows [live bus arrival timings] as a hard-coded value. Replace it with
real data from [https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04121], fetched through a serverless function of my own.
api/[LTA_ACCOUNT_KEY].js—calls [https://sgbusnow.vercel.app/], returns only the fields my screen
needs, and nothing else.
api/health.js—reports whether the credential is configured (keyConfigured) and
whether the upstream answered, including the HTTP status it returned. It must
never print the credential or any part of it.
On the screen, replace the hard-coded value with the live one, and decide what
the user sees in each of these four cases: the data is loading, the data is
empty, the upstream refused, and the upstream is unreachable. I want four
different sentences, not one spinner.
OUTPUT: Both functions at api/ in the PROJECT ROOT, siblings of package.json, never
inside src/. If this project has a server entry file, register the same two routes there too,
because that is the shape the preview can answer. If it has no server file, skip
that and tell me so rather than inventing one.
Make sure package.json contains "type": "module".
BEFORE the fetch, if the credential is missing or empty, return 503 with a message
naming the variable, and do not call the upstream at all. A missing variable is sent
as the word "undefined" and looks exactly like a wrong credential, so stop it early.
AFTER the fetch, check response.ok before reading the body. A refusal often has an
empty body, so calling .json() on it throws and my function dies with a 500 instead
of telling me what happened. On a non-2xx reply, return the upstream status and a
one-line reason in your own JSON.
Cache the response for [HOW LONG] with Cache-Control: s-maxage=[N],
stale-while-revalidate=[2N], matching how often the source actually changes.
In the footer, credit the source in the exact form the provider's licence asks for.
GUARDRAILS: Never write the credential into any file, comment or README. Never create
a variable whose name starts with VITE_. Never call the upstream from browser code;
every call happens inside api/. Never print the credential, or any part of it, in a
response or a log. No new npm packages. No database, no login. Leave every screen I
already have working exactly as it is.
CONTEXT: Deployed on Vercel from GitHub. The credential lives only in a Vercel
environment variable named [VARIABLE_NAME]. A real response from the endpoint,
called by hand just now, looks like this:
[Build the front end of BusNow, a web product for Singapore commuters using public buses. Their job on this product is: check when the next buses will arrive at one selected bus stop.]
```
**What came back:** An updated app, 12 files, preview loaded. failed to reach live bus time arrivals. 
**What I changed next and why:** replaced fictitious data with live data, from LTA data mall. 
