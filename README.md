# Puppeteer Akinator Revival – Why the Browser Route Is Cursed

ok so this is the second postmortem: the **“let’s just use Puppeteer and talk to real Akinator”** arc.  
spoiler: also scuffed, also dead.

## the dream: revive the OG genie

context: I wasn’t trying to make some mid clone this time.  
goal was:

- use **real Akinator’s website**
- drive it with **Puppeteer** (or any browser automation)
- have my own LLM sit “behind” it, reading the questions, steering the answers, maybe even farming nostalgia

basic fantasy:

1. spin up a Chromium via Puppeteer [web:187][web:190]
2. open akinator.com
3. read whatever question DOM spits out
4. decide “yes / no / don’t know / probably / probably not”
5. click the proper answer button
6. repeat until it guesses

no wrappers, no unofficial APIs, no jank clones. just remote-driving the original game.

## the setup: browser puppetry

high-level flow looked like:

- `puppeteer.launch(...)`
- `page.goto('https://akinator.com/...')`
- wait for question text element
- grab text via `page.$eval(...)`
- feed that into LLM, get classification
- simulate human click on the right answer button  
  (not even fast, trying to be “human-ish” with delays) [web:171][web:176]

in theory this is the kind of thing Puppeteer is literally made for:  
click buttons, fill stuff, read DOM, loop. [web:171][web:174][web:187]

in practice, it turned into a giant “lol no”.

## how it fell apart

### 1. Akinator isn’t dumb, the web changed

old-school web games didn’t care *who* was clicking their buttons.  
now:

- sites track **timing patterns, mouse movement, scrolls**, all that behavior analysis stuff
- headless / automated browsers leak a ton of fingerprints by default: `navigator.webdriver`, weird user agent combos, missing fonts, etc. [web:177][web:183][web:186]
- anti-bot stacks (Cloudflare, Akamai, custom scripts, whatever) are built exactly to kill this kind of automation [web:177][web:180][web:189]

so even if the script “works” for a bit, you’re basically fighting a moving wall of detection:

- random 403s
- weird redirects
- captchas mid-game
- layout / selector changes just enough to break your DOM logic

it’s like trying to play Jenga on a treadmill.

### 2. wrappers, stealth, all that – still cope

yes, there’s:

- stealth plugins
- patched Chromium
- “real browser” modes
- wrapper services that claim “undetectable Puppeteer” [web:177][web:180][web:189]

tried that direction mentally and from docs, but for **interactive games**, not just scraping or form-filling, you get smacked by:

- continuous behavior analysis (not just one login page) [web:177][web:181]
- UI changes that nukes your selectors
- extra challenges mid-session

you can patch fingerprints all day, but the **behavior** still looks like a robot because… it is. [web:177][web:181]

Akinator is literally a long chain of rapid, same-pattern clicks on 5 buttons. it screams “bot”.

### 3. the architecture itself is cursed

even ignoring detection, the whole setup sucks from a system-design POV:

- latency hell  
  LLM call → browser click → game render → read DOM → repeat. every round-trip stacks delay.
- race conditions  
  sometimes Akinator animations / ads / popups block the question, DOM isn’t ready, selectors time out, etc. [web:176][web:187]
- extreme fragility  
  any minor frontend change on their side = your script silently breaks.

and worst part: **you don’t control the game**. it’s someone else’s UI, rules, pacing, and anti-bot stack. you’re duct-taping a brain onto a black box it can’t really own.

## why “ANY browser instance” is a dead end here

this isn’t just “Puppeteer bad, try Playwright / Selenium / whatever” – they’re all the same class of solution:

- a remote-controlled browser trying to mimic a real player
- on a site that has every incentive to filter out exactly that pattern [web:172][web:177][web:183]
- with an LLM backend that adds even more randomness, latency, and jank

you can:

- rotate fingerprints & IPs
- randomize timing
- throw in fake mouse wiggles [web:177][web:180][web:189]

and maybe you dodge detection for a bit. but for a *long interactive session* like Akinator, the combo of:

- behavioral analysis
- DOM churn
- network tricks

means the approach is fundamentally brittle. it’s not “tune it more”, it’s “this layer is the wrong place to attach the brain”.

## the actual lesson (aka avoid this bhangbhsoda)

if the goal is “LLM + Akinator-like experience”, then:

- don’t wrap the **real site** with Puppeteer and hope it behaves
- don’t rely on fragile browser bots trying to out-human anti-bot systems
- don’t build a whole project on top of someone else’s constantly changing front-end

better options:

- **clone the mechanic**, not the website: implement your own Akinator-style engine, with your own DB / inference / UI, where you control everything [web:164][web:179][web:182]
- let the LLM help with:
  - generating questions
  - mapping human answers
  - maybe describing characters
- keep actual game logic + state on your side, not buried behind some external, anti-bot-protected web UI.

Puppeteer and friends are amazing for testing, scraping, and small automations. [web:171][web:174][web:187]  
using them as a life-support system to puppeteer an online game for an LLM-driven meta-game? that’s just asking for pain.

tldr: **reviving Akinator via browser automation is cursed**.  
if you wanna build Akinator 2.0, build it. don’t try to remote-control the original like a zombie.
