# adversarial_collaboration.md
Ayumi, Group 1
predictions.md committed at 27 September 2026, 1pm ; first comment for this set on my
board at 27 September 2026, 11pm

## The four-way table
### 1. Found by both
- have to retype the same stop on every visit. | raised by AWK | my severity [3], theirs
  [3]
### 2. Found by them, missed by me
- unrecognised bus stop needs clearer feedback | raised by MM, AWK | theirs [3, NONE] | arbiter [3]
- search only works with LTA's abbreviations | raised by AWK | theirs [3] | arbiter [2]
### 3. Found by me, not by them
- bus type not shown on home screen (double/single decker) | my severity [2]
### 4. Found by both, rated differently
- no shortcut for favourite buses | raised by AWK, TTS, MM | my severity [2], theirs [2,2, NONE] |
  arbiter [NOT TAKEN, issues raised by reviewers are different]

## My predictions, checked
- Expected finding 1: cannot tell with the severity i expected, because there was no comment on it. 
- Expected finding 2: broke! i expected comments on the usability of the app, in terms of having a feature of "favourite bus stops" due to the app's nature. i learnt that it is possible to pre-empt this, before sharing the app w users. 
- Expected finding 3: almost broke, pointed out by 1 reviewer because the issue of "long list of buses" was raised in tangent with my expectations.
- The heuristic I named as my product's worst: 9 — Help Users Recognize, Diagnose, and Recover from Errors
  because this problem is critical to the app's credibility. 
- The finding that would show my evaluation was wrong: raised
  because multiple users raised the concern of an unrecognised stop code needing clearer feedback, or the app giving a false response given an invalid bus stop. this affects users directly. 

## Q1. Where was confirmation bias in my own evaluation? 
- from above, i said that heuristic 9 was my worst - but i never tested it. when testing, i only typed bus stop codes that i knew would work, rather than finding falsifiable information - of invalid bus stop codes.
  
## Q2. Which prediction broke, and what did it teach me? 
- the above. 2 of my reviewers found an invalid stop code, that got no clear feedback. i expected comments about this feature, but did not expect failures instead. this taught me that i could have easily catch this error, by trying a few wrong bus stop inputs before sharing the app.
  
## Q3. Which groupmate finding did I nearly dismiss, and what did the evidence say?
- the invalid bus stop code. i tested the finding that one of my reviewers brought up, in which "unrecognisable bus codes require clearer feedback" and this holds true. for instance, when i type in bus stop code "99999" and click search, the response is "No matching bus stops found for “99999”.
  
## Q4. What did I revise, which heuristic does it serve, and how do I know it worked? 
- the above. heuristic 9. i know it'll work when an invalid bus code shows "bus stop code not found. please check 5-digit code again."
  
## Q5. What did my users give me that I could not have found myself? 
- extra perspective! a useful finding was that when a reviewer keyed "north bridge", the app was not able to provide an output. on the flipside, keying "Nth Bridge" gives 8 bus stop options. the search only understands LTA's abbreviations - something to keep in mind to improve usability. 
## Q6. Did the AI help me confirm, or help me falsify? 
- mostly falsify. intially, i thought that model gave rather optimistic arbiter responses that aligned with my severity ratings, so i had to do a double take on its explanation on the severity rating. subsequently, my experience with claude: it was able to give interesting responses such as "if...., the claim holds and the rating should rise to 3. if only..., rating stays at 2" - which was rather helpful criticism.
