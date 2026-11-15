// UI copy shared by the home screen and individual games. Dynamic names and private
// words are kept separate by localization.mjs. Long phrases take precedence.
const lines = `
শীতলপাটি|Shitolpati
প্রোফাইল|Profile
আমার প্রোফাইল|My profile
নাম ও ছবি|Name & photo
আমার নাম ও ছবি|My name & photo
বন্ধ করুন|Close
বন্ধ করো|Close
ছবি বদলান|Change photo
আপনার নাম|Your name
সেভ করুন|Save
সেভ করো|Save
নাম|Name
৫ মেগাবাইটের কম|Under 5 MB
ছবি দিন।|Choose an image.
হারিকেন নিভিয়ে দিন|Turn off the lantern
হারিকেন জ্বালান|Light the lantern
খেলোয়াড়, সঙ্গে ১ জন হোস্ট|players, plus 1 host
খেলোয়াড়|Player
অনলাইন|Online
অফলাইন|Offline
শুধু অফলাইনে|Offline only
শুধু অনলাইনে|Online only
র‍্যাঙ্কিং|Rankings
র‌্যাঙ্কিং|Rankings
এই ফোনের অ্যাকাউন্ট|Accounts on this phone
শব্দ: চালু|Sound: on
শব্দ: বন্ধ|Sound: off
শব্দ|Sound
চালু|On
বন্ধ|Off
অ্যাপ নামান|Download app
এসো, বসো আমার উঠানে...|Come, sit in my courtyard…
বুক ভরে নাও শ্বাস।|Breathe in the evening air.
শীতল পাটি বিছিয়ে দিবো-|A woven mat is waiting,
তালপাখার বাতাস।|a palm-leaf fan to share.
কীভাবে খেলবেন|How to play
এক ফোনে সবাই|Everyone on one phone
যার যার ফোনে, কোড দিয়ে|Separate phones, one room code
খেলার আসর|Choose your game
আপনার পছন্দের খেলা বেছে নিন|Pick a game for your gathering
খেলা বেছে নিন|Choose a game
কহেন কবি কালিদাস|Kalidas Riddles
একা বা সর্বোচ্চ ২০ জনের নাম দিয়ে খেলুন|Play solo or add up to 20 players
পেন ফাইট|Pen Fight
চতুরঙ্গ|Chess
চোর ডাকাত পুলিশ বাবু|Thief, Robber, Police & Babu
লুডু|Ludo
ক্যারম|Carrom
জায়গা দখল|Dots & Boxes
তিন গুটি|Three Stones
অফলাইনে|Offline
একা কম্পিউটারের সঙ্গেও খেলতে পারবেন|You can also play solo against the computer
ঠিক ৪ জন খেলোয়াড়|Exactly 4 players
ভাষা|Language
ভাষা বেছে নিন|Choose language
সব খেলা আপনার পছন্দের ভাষায় দেখাবে। Colour Rush সবসময় ইংরেজিতে থাকবে।|Your choice applies to every game. Colour Rush stays in English.
তথ্য সেভ করা যায়নি। ফোনে কিছু জায়গা খালি করুন।|Could not save. Free up some space on your phone.
তথ্য সেভ করা যায়নি।|Could not save your game.
নং|No.
গোয়েন্দা|Detective
গুপ্তচর|Spy
সবাই গোয়েন্দা।|Everyone is a detective.
একজন গুপ্তচর।|One is a spy.
সবার নোটবুকে একই গোপন শব্দ। শুধু গুপ্তচরের পাতা ফাঁকা, তবু সে এমন ভাব করবে যেন সব জানে। সূত্র মিলিয়ে তাকে ধরুন।|Everyone gets the same secret word, except the spy. The spy must bluff. Compare clues and find the odd one out.
খেলোয়াড় দেখুন|View players
খেলোয়াড় যোগ করুন|Add players
বাংলাদেশি চায়ের দোকানে আতশকাচ হাতে গোয়েন্দা আর গোপন চিরকুট হাতে গুপ্তচরের কার্টুন|Cartoon detectives and a spy at a Bangladeshi tea stall
চরিত্রগুলো দেখুন|Meet the characters
শব্দ জানেন · বাকি সবাই|Knows the word · everyone else
আতশকাচ হাতে সূত্র মেলান, অসঙ্গতি খোঁজেন।|Compare clues and spot what does not fit.
শব্দ জানে না · একজন|Does not know the word · one player
কালো চশমা, তোলা কলার। শব্দ জানে না, জানার ভান করে।|Dark glasses, raised collar. Does not know the word, but pretends to.
কারা খেলছেন?|Who is playing?
খেলোয়াড়ের নাম|Player name
যোগ করুন|Add player
সরান|Remove
প্রথম নামটি লিখুন|Enter the first name
৩ থেকে ২০ জন। কোনো হোস্ট লাগবে না।|3–20 players. No host needed.
আলোচনার সময়|Discussion time
মিনিট|minutes
স্তর|Difficulty
সহজ|Easy
মাঝারি|Medium
কঠিন|Hard
গতবার গুপ্তচর ছিলেন|Last spy:
এবার ফোন শুরু হবে তাঁর হাত থেকে।|The next game starts with that player.
কমপক্ষে ৩ জন লাগবে|At least 3 players needed
সবাই এসে গেছেন?|Everyone ready?
কেস শুরু করুন|Start case
শব্দ বণ্টন|Deal the word
ফোন একে একে ঘুরবে। কার্ড ছুঁয়ে নিজের পাতা দেখুন। সবাই গোয়েন্দা, একই শব্দ পাবেন; একজন গুপ্তচর, তার পাতা ফাঁকা।|Pass the phone in order. Tap your card privately. Detectives share one word; the spy gets a blank page.
সূত্র|Clues
শব্দটা সরাসরি বলবেন না। ছোট সূত্র দিন। খুব সহজ সূত্র দিলে গুপ্তচর শব্দটা ধরে ফেলবে।|Give a short clue without saying the word. An obvious clue may help the spy guess it.
যুক্তি|Reasoning
কার সূত্র বেমানান? আলোচনার সময় শেষে সবাই মিলে একজনকে বাদ দিন।|Whose clue does not fit? When discussion ends, agree on a player to vote out.
রায়|Verdict
গুপ্তচর বাদ পড়লে কেস সমাধান। ফল দেখিয়ে পাঁচ সেকেন্ড পরে নতুন কেস শুরু হবে, ফোন যাবে আগের গুপ্তচরের হাতে। দুজন বাকি থাকতে গুপ্তচর টিকে থাকলে সে পালিয়ে যায়, জিতে যায়।|Catch the spy to solve the case. After five seconds, a new case starts with the previous spy. If the spy survives until only two remain, the spy wins.
পয়েন্ট|points
গুপ্তচরের জয়ে ৩। গোয়েন্দাদের জয়ে প্রত্যেকে ১। খেলা ছেড়ে গেলে পয়েন্ট নেই।|The spy earns 3 for a win. Winning detectives earn 1 each. Players who quit earn no points.
খেলার নিয়ম|Game rules
গোয়েন্দা বনাম গুপ্তচর|Detectives versus spy
এক ফোন, কোনো হোস্ট নেই। ৩ থেকে ২০ জন।|One phone, no host. 3–20 players.
শব্দতালিকা|Word list
আপনি গুপ্তচর|You are the spy
আপনার পাতা ফাঁকা। মুখ শান্ত রাখুন; অন্যদের সূত্র শুনে শব্দটা আন্দাজ করুন, ধরা পড়বেন না।|Your page is blank. Keep a straight face, listen to clues and guess the word without getting caught.
গোয়েন্দা · গোপন শব্দ|Detective · secret word
শব্দটা সরাসরি বলবেন না। ছোট সূত্র দিন, অসঙ্গতি খুঁজুন।|Do not say the word. Give a short clue and look for inconsistencies.
আপনি|you are
আবার ছুঁয়ে ঢেকে দিন|Tap again to hide
ছুঁয়ে নোটবুক খুলুন|Tap to open your notebook
অন্যরা চোখ সরিয়ে রাখুন। শুধু|Everyone else, look away. Only
দেখবেন।|may look.
কার্ডে ট্যাপ করুন|Tap the card
কেস|Case
আপনার পালা|Your turn
ফোনটি শুধু আপনার হাতে রাখুন।|Keep the phone to yourself.
কার্ড ছুঁয়ে পরিচয় দেখুন|Tap to see your identity
কার্ড ঢেকে দিন|Hide card
পরের খেলোয়াড়|Next player
আলোচনা শুরু করুন|Start discussion
ঢেকে দিয়ে ফোনটি এগিয়ে দিন।|Hide the card, then pass the phone.
কার্ড দেখার পর বোতামটি চালু হবে।|View your card to enable the button.
রাউন্ড|Round
আলোচনা শেষ|Discussion ended
বাকি সময়|Time remaining
এবার সবাই মিলে একজনকে বেছে নিন।|Choose a player together.
সূত্র দিন, প্রশ্ন করুন, অসঙ্গতি খুঁজুন।|Share clues, ask questions and spot inconsistencies.
বিরতি চলছে। প্রস্তুত হলে আবার শুরু করুন।|Paused. Resume when everyone is ready.
বিরতি|Pause
এখনই ভোট|Vote now
কে গুপ্তচর?|Who is the spy?
এবার কথা হোক।|Time to discuss.
জন খেলায় আছেন · পরিচয় গোপন রাখুন|players remain · keep your identity secret
খেলা ছেড়েছেন।|left the game.
গোয়েন্দাই ছিলেন। গুপ্তচর এখনও আপনাদের মধ্যেই আছে।|was a detective. The spy is still among you.
সবাই মিলে একজনকে বাদ দিন|Choose one player to eliminate
ভোট চূড়ান্ত করুন|Confirm vote
খেলোয়াড়দের অবস্থা|Player status
খেলা ছেড়েছেন|Quit
বাদ পড়েছেন|Eliminated
ছেড়ে যান|Quit
ছেড়ে গেছেন|Quit
জয়|Win
পরাজয়|Loss
খেলোয়াড় · শেষ পাঁচ খেলা|Player · last five games
সবুজ ফ্রেম জয়|Green border: win
লাল ফ্রেম পরাজয়|Red border: loss
নতুন খেলা বাঁ দিকে|Newest game on the left
এখনও কোনো কেস শেষ হয়নি।|No cases completed yet.
এখনও খেলেননি|Not played yet
টি ম্যাচ|matches
ম্যাচে প্রথম|First in match
প্রথম নয়|Not first
শেষ হওয়া প্রতিটি ম্যাচের মোট পয়েন্ট।|Total points from completed matches.
সব ম্যাচ মিলিয়ে|Across all matches
এখনও কোনো ম্যাচ শেষ হয়নি।|No matches completed yet.
সব খেলার র‍্যাঙ্কিং|All-game rankings
সমাধান|Solved
অমীমাংসিত|Unsolved
গুপ্তচর ধরা পড়েছে!|The spy is caught!
গুপ্তচর পালিয়ে গেল!|The spy escaped!
ছিলেন গুপ্তচর।|was the spy.
গোয়েন্দাদের সূত্র মিলে গেল।|The detectives connected the clues.
কেউ তাকে ধরতে পারেনি।|Nobody caught the spy.
পরের কেস শুরু হবে|Next case starts in
সেকেন্ডে। ফোন যাবে|seconds. Pass the phone to
এর হাতে।|.
ফল দেখে থাকুন|View the result
গোপন শব্দটি ছিল|The secret word was
নাম বা সময় বদলান|Change names or time
এর শুরুর পাতা|home
নিয়ম|Rules
সব খেলা|All games
মেনু|Menu
খেলার অংশ|Game sections
খেলা|Play
সর্বোচ্চ ২০ জন খেলতে পারেন।|Up to 20 players can join.
খেলা চলাকালে নাম যোগ করা যাবে না।|You cannot add players during a game.
একটি আলাদা নাম দিন, সর্বোচ্চ ২০ অক্ষরে।|Enter a unique name of up to 20 characters.
এই ভোটই চূড়ান্ত?|Confirm this vote?
কে বাদ দেওয়া হবে।|will be eliminated.
আলোচনা শেষ করবেন?|End discussion?
এখন সবাই মিলে ভোট দিতে পারবেন।|Everyone can now vote together.
এই খেলা ছেড়ে যাবেন?|Quit this game?
এই খেলার ফল যোগ হবে না। নাম রেখে নতুন খেলা শুরু করতে পারবেন।|This game will not count. Keep the names and start again.
সব পয়েন্ট মুছবেন?|Clear all points?
নাম থাকবে, কিন্তু পয়েন্ট আর শেষ পাঁচ খেলার ইতিহাস মুছে যাবে।|Names stay, but points and the last five games will be cleared.
পয়েন্ট মুছে নতুন খাতা খোলা হলো।|Points cleared. A fresh start.
খেলা ছেড়ে যাবেন?|Quit the game?
এই খেলায় আর অংশ নেবেন না।|You will no longer take part in this game.
কাজটি করা যায়নি। আবার চেষ্টা করুন।|Could not complete that action. Try again.
হ্যাঁ, নিশ্চিত|Yes, confirm
থাক|Cancel
এই খেলা ছেড়ে নতুন খেলা|Quit and start again
নতুন খেলা|New game
সব খেলায় ফিরে যান|Back to all games
ম্যাচ · খেলা|Match · game
ম্যাচের পয়েন্ট|Match points
এই ম্যাচের সব খেলার পয়েন্ট যোগ করে।|Points from every game in this match.
নতুন ম্যাচ|New match
পরের খেলা|Next game
আরও একটি খেলা যোগ করুন|Add another game
ম্যাচ শেষ করুন ও ফল সেভ করুন|End match and save results
হল অব ফেম|Hall of fame
শেষ ১০০টি ম্যাচে এক ম্যাচে সবচেয়ে বেশি পয়েন্ট।|Highest points in a single match from the last 100 matches.
এখনও কেউ হল অব ফেমে ওঠেননি।|Nobody in the hall of fame yet.
টি খেলা|games
ম্যাচ শেষ করবেন?|End the match?
ম্যাচের ফল র‍্যাঙ্কিংয়ে সেভ হবে, তারপর নতুন করে শুরু।|Match results will be saved to rankings, then you can start again.
ম্যাচের ফল সেভ হয়েছে|Match results saved
অ্যাকাউন্ট থেকে যোগ করুন|Add from accounts
বাংলা ধাঁধার আসর|A gathering of riddles
কহেন কবি|The poet asks
কালিদাস|Kalidas
উত্তর দেখুন|See answer
ধাঁধা শুরু|Start riddles
তালপাতার পুঁথি ও লেখনী হাতে হাস্যোজ্জ্বল কবি কালিদাসের কারিকেচার|Cartoon poet Kalidas holding a palm-leaf manuscript and pen
ধাঁধা কতটা কঠিন হবে?|How challenging?
ধাঁধা কতটা কঠিন|Riddle difficulty
ঠিক উত্তরে|For a correct answer
নাম না দিলে সবাই মিলে এক দল হয়ে খেলবেন। নাম দিলে অ্যাকাউন্ট খুলে যায়, পয়েন্ট র‍্যাঙ্কিংয়ে জমে।|Leave names blank to play as one team, or add names to save individual scores.
প্রতি ধাঁধার সময়|Time per riddle
সেকেন্ড|seconds
সবাই প্রস্তুত?|Everyone ready?
একা বা দলে|Solo or as a team
কবি কালিদাস কে?|Who was Kalidas?
সংস্কৃত ভাষার কবি ও নাট্যকার|Sanskrit poet and playwright
মেঘদূত, অভিজ্ঞানশকুন্তলম্|Meghaduta, Abhijnanashakuntalam
রঘুবংশ আর কুমারসম্ভব তাঁর লেখা। মেঘদূতে নির্বাসিত এক যক্ষ বর্ষার মেঘকে দূত করে প্রিয়ার কাছে খবর পাঠায়। বাংলার লোকধাঁধার শেষে প্রায়ই জুড়ে দেওয়া হয় “কহেন কবি কালিদাস”, যেন ধাঁধাটা কবিরই ছুড়ে দেওয়া।|Kalidas wrote Raghuvamsha and Kumarasambhava. In Meghaduta, an exiled spirit sends a message through a cloud. Bengali folk riddles often end with “the poet Kalidas asks.”
কেউ পারেনি|Nobody got it
আমরা পেরেছি|We got it
কে ঠিক বলল?|Who answered correctly?
পেরেছেন?|Did you solve it?
ধাঁধা|Riddle
যে আগে বলবে, পয়েন্ট তার|First correct answer earns the points
সময় শেষ! উত্তর|Time is up! Answer
উত্তর দেখাও|Reveal answer
উত্তর|Answer
পরের ধাঁধা|Next riddle
ঠিক করা হয়েছে। পরের ধাঁধায় যান।|Recorded. Continue to the next riddle.
যে ঠিক বলল তাকে বেছে নিন, তারপর পরের ধাঁধা।|Choose who answered correctly, then continue.
খেলা শেষ|Game over
ঠিক উত্তর|Correct answer
পারেননি|Not solved
সবাই মিলে|Together
খেলার ফল|Game results
খেলোয়াড় · শেষ পাঁচ ধাঁধা|Player · last five riddles
সবুজ ফ্রেম ঠিক উত্তর|Green border: correct answer
লাল ফ্রেম পারেননি|Red border: not solved
নতুনটি বাঁ দিকে|Newest on the left
এখনও কোনো ধাঁধা খেলা হয়নি।|No riddles played yet.
টি ধাঁধা|riddles
খেলা শেষ!|Game over!
সমানে সমান!|A tie!
জিতলেন!|wins!
টি ধাঁধা ভাঙলেন!|riddles solved!
পয়েন্ট নিয়ে সবার আগে।|points to lead the table.
কবি মুচকি হাসছেন। পরের খেলায় নতুন ধাঁধা আসবে।|The poet smiles. More riddles await next time.
ফলাফল|Results
সহজ ধাঁধায় ১, মাঝারিতে ২, কঠিনে ৩ পয়েন্ট।|Easy: 1 point. Medium: 2. Hard: 3.
আবার খেলুন|Play again
কালিদাসের শুরুর পাতা|Kalidas home
শেষ ১০০টি খেলায় এক খেলায় সবচেয়ে বেশি ধাঁধা ভাঙা।|Most riddles solved in a single game from the last 100 games.
নাম ও সময়|Names and time
খেলোয়াড়দের নাম লিখুন বা অ্যাকাউন্ট থেকে বেছে নিন, প্রতিটি ধাঁধার সময় বেছে নিন। নাম না দিলে সবাই মিলে এক দল।|Enter names or choose accounts, then set the time per riddle. Leave names blank to play as one team.
কতটা কঠিন|Difficulty
সহজ, মাঝারি বা কঠিন বেছে নিন। সহজ ধাঁধা ছোট, কঠিনগুলোতে অক্ষরের খেলা আর লম্বা ছড়া। ঠিক উত্তরে সহজে ১, মাঝারিতে ২, কঠিনে ৩ পয়েন্ট।|Choose easy, medium or hard. Correct answers earn 1, 2 or 3 points respectively.
কবি কালিদাসের নামে একের পর এক বাংলা ধাঁধা আসবে। কোনো নির্দিষ্ট সংখ্যা নেই; থামাতে চাইলে “খেলা শেষ”।|Solve one riddle after another. There is no fixed limit; select End game whenever you want to stop.
কে পারল|Who solved it
যে আগে ঠিক উত্তর বলবে, তার নামের পাশে টিক দিন। কেউ না পারলে “কেউ পারেনি”।|Select whoever answers correctly first. Choose Nobody got it if no one solves it.
সময়ের আগেই “উত্তর দেখাও” চাপতে পারেন। সময় শেষ হলে উত্তর নিজে থেকে দেখাবে।|Reveal the answer early, or wait for it to appear when time runs out.
ফল|Result
এক ফোনে বাংলা ধাঁধার খেলা।|A riddle game on one phone.
চলমান খেলা|Current game
শেষ খেলা|Last game
সহজ ধাঁধায় ১, মাঝারিতে ২, কঠিনে ৩ পয়েন্ট। নতুন খেলা শুরু করলে পয়েন্ট শূন্য থেকে গোনা হয়।|Easy: 1 point. Medium: 2. Hard: 3. A new game starts scores at zero.
বাংলা ধাঁধা|Riddles
কালিদাসের ধাঁধা|Kalidas riddles
সর্বোচ্চ ২০ জন।|Up to 20 players.
খেলা শেষ করবেন?|End this game?
এই ধাঁধার ফলও যোগ হবে, তারপর ফলাফল দেখাবে।|This riddle will count before the results appear.
এই ধাঁধাটি গোনা হবে না। ফলাফলের টেবিল দেখাবে।|Skip this riddle and show the results.
হ্যাঁ, শেষ করুন|Yes, end game
খেলা চলুক|Keep playing
খেলা শেষ করুন|End game
সময়ের খেলা|Timed mode
ঠিক +১ · ভুল −১|Correct +1 · wrong −1
অসীম খেলা|Endless mode
৩টা প্রাণ · ঠিক +১|3 lives · correct +1
টা প্রাণ বাকি|lives left
আগের অ্যাকাউন্ট|Existing accounts
অঙ্কের দ্রুত প্রশ্ন, চার স্তরে|Quick maths questions, four levels
ধরন|Mode
খেলার ধরন|Game mode
কত সেকেন্ড|Time in seconds
নাম লিখুন|Enter a name
যোগ|Add
বাদ দিন|Remove
শুরু করুন|Start
আগে একটা নাম দিন|Add a name first
এর পালা|is up
ঠিক +১|Correct +1
শুরু!|Start!
এ পর্যন্ত|So far
প্রশ্ন|Question
ঠিক! +১|Correct! +1
ভুল|Wrong
একটা প্রাণ গেল|One life lost
দফা শেষ|Turn complete
পরের প্রশ্ন|Next question
দফা শেষ করুন|End turn
খেলোয়াড় · শেষ পাঁচ প্রশ্ন|Player · last five questions
সবুজ: ঠিক|Green: correct
লাল: ভুল|Red: wrong
এখনও কেউ খেলেননি।|Nobody has played yet.
পয়েন্ট!|points!
টা ঠিক|correct
টা ভুল।|wrong.
আরেক দফা হয়ে যাক।|Try another turn.
ধরন, স্তর বা নাম বদলান|Change mode, level or names
সময় শেষের আগে যত পারেন। ঠিক +১, ভুল −১।|Answer as many as you can before time runs out. Correct +1, wrong −1.
৩টা প্রাণ। ঠিক +১, ভুলে একটা প্রাণ যায়।|3 lives. Correct answers earn 1; wrong answers cost a life.
কয়েকজন খেললে একে একে নিজের দফা খেলুন।|With several players, take turns on the phone.
স্তর ১ (৯–১২ বছর) থেকে স্তর ৪ (স্নাতক)।|Level 1 (ages 9–12) through level 4 (undergraduate).
শেষ হওয়া প্রতিটা খেলার মোট পয়েন্ট।|Total points from completed games.
এই খেলা|This game
সব খেলা মিলিয়ে|Across all games
শেষ ১০০টি খেলায় এক খেলায় সবচেয়ে বেশি পয়েন্ট।|Highest score in a single game from the last 100 games.
টি প্রশ্ন|questions
র‍্যাঙ্কিং ও অ্যাকাউন্ট|Rankings & accounts
অঙ্কের খেলা|Maths game
খেলা সাজান|Game setup
সর্বোচ্চ ৮ জন।|Up to 8 players.
এই নাম আগেই আছে।|That name is already in use.
ঠিক|Correct
এই দফা শেষ করবেন?|End this turn?
এ পর্যন্ত যা পয়েন্ট হয়েছে তা থাকবে।|Points earned so far will stay.
হ্যাঁ, শেষ|Yes, end
পুরো খেলা থামাবেন?|Stop the whole game?
যাঁরা খেলেছেন তাঁদের পয়েন্ট র‍্যাঙ্কিংয়ে সেভ হবে।|Players' points will be saved to rankings.
হ্যাঁ, থামান|Yes, stop
পুরো খেলা থামান|Stop the whole game
সময় শেষ!|Time is up!
`;
export const UI_PAIRS = lines.trim().split('\n').map(line=>line.split('|'));
const boardLines = `
পড়ে গেল!|fell off!
বেঞ্চ থেকে পড়ে গেছে।|fell off the desk.
কয়েন।|coins.
রাউন্ড জয়|Round win
পড়ে গেছে|Fell off
জোর|Power
এর কলম ধরে টেনে ছাড়ুন।|: pull your pen back and release.
৫-এর মধ্যে|out of 5
ওজন|Weight
গ্রিপ|Grip
নাগাল|Reach
প্রতিপক্ষ|Opponent
কয়েন|coins
টি জিনিস লাগানো|items equipped
আগের কলম|Previous pen
পরের কলম|Next pen
কলম|Pen
কম্পিউটার কতটা কঠিন|Computer difficulty
দোকান: গ্রিপার, ভারী মাথা…|Shop: grips, weighted caps…
অনলাইন: ২–৪ জন, যার যার ফোনে|Online: 2–4 players on separate phones
আপনার কলম|Your pen
পেন ফাইট · অনলাইন ঘর|Pen Fight · online room
বেঞ্চে কলম টোকা দিয়ে অন্যের কলম ফেলে দিন। শেষ পর্যন্ত যার কলম টিকে থাকে, রাউন্ড তার।|Flick your pen to knock others off the desk. The last pen standing wins the round.
কার সাথে খেলবেন?|Who will you play with?
কার সাথে খেলবেন|Play against
কম্পিউটারের সাথে|Computer
বন্ধুদেরও যোগ করতে পারেন|Friends can join too
বন্ধুদের সাথে|Friends
২–৪ জন, এক ফোনে পালা করে|2–4 players, taking turns on one phone
খেলোয়াড়দের নাম|Player names
নাম দিলেই অ্যাকাউন্ট খুলে যায়। জেতা পয়েন্ট কয়েন হয়ে জমে।|Adding a name creates an account. Winning points earn coins.
খেলছেন। অন্য কাউকে নিতে নিচের কার্ডে|are playing. To change players, use
চাপুন।|below.
কলম বাছুন|Choose your pens
ওপরে নাম দিলে এখানে কলম বাছাই দেখা যাবে।|Add a name above to choose a pen here.
কত রাউন্ড|Number of rounds
এক ম্যাচে|Per match
খেলা শুরু|Start game
আগে আপনার নাম দিন|Enter your name first
আরও|Another
জনের নাম দিন|player names needed
রাউন্ডের ম্যাচ|round match
দোকান|Shop
কলমের জিনিসপত্র|Pen accessories
আগে খেলা ট্যাবে নাম দিয়ে অ্যাকাউন্ট খুলুন, তারপর লড়াই জিতে কয়েন জমান।|Add your name in Play, then win battles to earn coins.
খেলায় ফিরুন|Back to game
লড়াইয়ে জেতা প্রতিটা পয়েন্ট এক কয়েন। কেনা জিনিস যেকোনো সময় খুলে রাখা বা আবার লাগানো যায়।|Every point earned is a coin. Equip or remove purchased accessories whenever you like.
কার জন্য কিনবেন?|Who are you shopping for?
কার জন্য কিনবেন|Shopping for
এর কলম, লাগানো জিনিসসহ|: pen with equipped accessories
মোট জেতা|Total earned
পুরোটা কেনা|Fully owned
খুলে রাখুন|Unequip
লাগান|Equip
শীঘ্রই আসছে|Coming soon
লক করা|Locked
সংস্করণে আসবে|in a future version
এর চাল|to play
কলম চলছে…|Pens are moving…
কম্পিউটার নিশানা ঠিক করছে…|Computer is aiming…
নিজের কলম ধরে পেছনে টেনে ছেড়ে দিন|Pull your pen back and release
বেঞ্চ|Desk
এর কলম আছে|has a pen remaining
ম্যাচ শেষ করুন|End match
ম্যাচের ফল|Match results
খেলোয়াড় · শেষ পাঁচ রাউন্ড|Player · last five rounds
সবুজ: রাউন্ড জয়|Green: round win
লাল: কলম পড়ে গেছে|Red: pen fell off
এখনও কোনো রাউন্ড শেষ হয়নি।|No rounds completed yet.
ম্যাচ শেষ|Match over
এর কলম টিকে গেছে|has the last pen standing
সব কলম পড়ে গেছে|All pens fell off
বেঞ্চে শেষ পর্যন্ত ছিল। +২ পয়েন্ট|stayed on the desk. +2 points
২ কয়েন|2 coins
এই রাউন্ডে কেউ জেতেনি।|Nobody won this round.
ঘর ছেড়ে দিন|Leave room
ঘর যিনি খুলেছেন তিনি পরের রাউন্ড শুরু করবেন।|The room host starts the next round.
আরও এক রাউন্ড|One more round
পরের রাউন্ড|Next round
প্রত্যেকে নাম দিয়ে খেলায় ঢোকেন; নামটাই অ্যাকাউন্ট। একটা ফোনে অনেক অ্যাকাউন্ট রাখা যায়, র‍্যাঙ্কিং পাতা থেকে মোছা যায়।|Join with a name to create an account. Store several accounts on one phone and manage them in Rankings.
প্রত্যেকে একটা কলম বেছে নিন। কলমের ওজন, গ্রিপ আর দৈর্ঘ্য আলাদা।|Choose a pen. Each has a different weight, grip and length.
যার চাল, সে নিজের কলমে আঙুল রেখে পেছনে টেনে ছেড়ে দেবে। যত বেশি টানবেন, তত জোরে যাবে।|On your turn, pull your pen back and release. A longer pull gives more power.
বেঞ্চ খসখসে কাঠের: স্থির কলম হালকা ধাক্কায় নড়ে না, জোরে লাগাতে হয়।|The wooden desk has friction: resting pens need a firm hit to move.
কলমের মাঝখান বেঞ্চের কিনারা পার হলে কলম পড়ে গেছে।|A pen falls when its midpoint passes the edge of the desk.
অন্যের কলম ফেললে +১, রাউন্ডে শেষ পর্যন্ত টিকে থাকলে +২। নিজের কলম নিজে ফেলে দিলে কিছু নেই।|Knock another pen off for +1. Stay until the end for +2. Knocking yourself off earns nothing.
প্রতিটা পয়েন্ট অ্যাকাউন্টে এক কয়েন। কয়েন দিয়ে দোকান থেকে গ্রিপার, ভারী মাথা, পেছনে বাড়তি মাথা, টেপ, ইরেজার বাম্পার, ক্লিপ কেনা যায়।|Each point earns one coin. Spend coins in the shop on grips, weighted caps, extensions, tape, eraser bumpers and clips.
রাউন্ড (খেলার আগে বদলানো যায়)। মোট পয়েন্টে ম্যাচের র‍্যাঙ্কিং।|rounds, adjustable before play. Total points decide the match ranking.
চলমান ম্যাচ|Current match
টি রাউন্ড|rounds
পেন ফাইটের শুরুর পাতা|Pen Fight home
বেঞ্চের খেলা|The desk battle
কলম বাছাই|Choose pens
মানুষ ও কম্পিউটার মিলিয়ে সর্বোচ্চ ৪ জন।|Up to 4 people and computers in total.
এই ফোনে আর অ্যাকাউন্ট খোলা যাবে না। পুরোনো কোনোটা মুছুন।|This phone has reached its account limit. Remove an old account first.
একটা নাম দিন।|Enter a name.
কম্পিউটারের জন্য একটি আসন খালি করুন।|Leave a seat for the computer.
কম্পিউটার|Computer
প্রথম চাল|First turn
এই দামি কলমগুলো|These premium pens
সংস্করণে খোলা হবে।|will unlock in a future version.
লাগানো হয়েছে।|equipped.
কয়েন কম। আরও লড়াই জিতে আসুন।|Not enough coins. Win more battles first.
এটা আর কেনা যাবে না।|You cannot buy any more of this.
সবার ফোনে ফল দেখাবে।|Results will appear on every phone.
র‍্যাঙ্কিংয়ে সেভ হবে, তারপর নতুন খেলা শুরু করা যাবে।|will be saved to rankings, then you can start again.
সংযোগে সমস্যা।|Connection problem.
সংযোগে সমস্যা, আবার চেষ্টা করুন।|Connection problem. Try again.
ঘরটা আর নেই।|This room no longer exists.
ঘর ছেড়ে দেবেন?|Leave the room?
কিস্তিমাত!|Checkmate!
অচল: ড্র|Stalemate: draw
৫০ চালে কেউ কিছু খায়নি: ড্র|Fifty-move rule: draw
একই অবস্থা তিনবার: ড্র|Threefold repetition: draw
মাত করার মতো ঘুঁটি নেই: ড্র|Insufficient material: draw
হার মেনে নিলেন|Resigned
দুজনে মিলে ড্র|Draw by agreement
অ্যাকাউন্ট থেকে|From accounts
অনলাইন: বন্ধু নিজের ফোন থেকে খেলবে। যিনি ঘর খোলেন তিনি সাদা।|Online: each friend uses their phone. The room host plays white.
দাবা খেলা শেষে রাজা এবং সৈন্য—সবাইকে কিন্তু একই বাক্সেই ফিরে যেতে হয়।|After the game, the king and the pawn go back into the same box.
ইতালীয় প্রবাদ|Italian proverb
কার সাথে|Opponent
একা খেলুন, তিন স্তর|Play solo, three difficulty levels
বন্ধুর সাথে|With a friend
এক ফোনে মুখোমুখি|Face to face on one phone
আপনি কোন রং নেবেন|Choose your colour
আপনার ঘুঁটি|Your pieces
সাদা|White
আগে চাল|Moves first
কালো|Black
পরে চাল|Moves second
যেকোনো|Random
ভাগ্যে যা|Let chance decide
কম্পিউটার কেমন খেলবে|Computer difficulty
সাদা ঘুঁটির খেলোয়াড়|White player
কালো ঘুঁটির খেলোয়াড়|Black player
দান শুরু|Start game
ভাবছে…|Thinking…
চতুরঙ্গের ছক|Chess board
জিতলেন।|wins.
কিস্তি!|Check!
আবার খেলি|Play again
ঘর যিনি খুলেছেন তিনি আবার শুরু করতে পারবেন।|The room host can start again.
হার মানি|Resign
চতুরঙ্গের শুরুর পাতা|Chess home
চাল ফেরত|Undo move
ড্র|Draw
রাজা|King
এক ঘর যেকোনো দিকে।|One square in any direction.
মন্ত্রী|Queen
সোজা বা কোনাকুনি যত ঘর খুশি।|Any distance along a rank, file or diagonal.
নৌকা|Rook
সোজা।|Along ranks and files.
হাতি|Bishop
কোনাকুনি।|Along diagonals.
ঘোড়া|Knight
আড়াই ঘর, ডিঙিয়ে যায়।|Moves in an L shape and jumps over pieces.
বোড়ে|Pawn
সামনে এক ঘর (প্রথমবার দুই), খায় কোনাকুনি।|One square forward, or two on its first move. Captures diagonally.
রাজার ওপর আক্রমণ হলে|An attack on the king is
কিস্তি|check
বাঁচার পথ না থাকলে|with no escape it is
কিস্তিমাত|checkmate
খেলা শেষ।|Game over.
বোড়ে শেষ সারিতে পৌঁছালে মন্ত্রী, নৌকা, হাতি বা ঘোড়া হয়ে যায়।|A pawn on the last rank promotes to a queen, rook, bishop or knight.
রাজা আর নৌকা না নড়লে এক চালে দুজনে জায়গা বদলাতে পারে (দুর্গ)। পাশ কাটানো বোড়েকে ঠিক পরের চালে খাওয়া যায়।|An unmoved king and rook may castle if the path is safe. An en passant capture must be made on the next move.
চাল না থাকলে কিন্তু কিস্তি নেই, তবে ড্র। জয়ে ৩, ড্রয়ে ১ পয়েন্ট।|No legal move without check is a draw. Win: 3 points. Draw: 1.
খেলোয়াড় · শেষ পাঁচ দান|Player · last five games
সবুজ: জয়|Green: win
লাল: হার বা ড্র|Red: loss or draw
এখনও কোনো দান শেষ হয়নি।|No games completed yet.
টি দান|games
টিতে জয়|wins
জয়ে ৩, ড্রয়ে ১।|Win: 3. Draw: 1.
এখনও কেউ নেই।|Nobody here yet.
চতুরঙ্গ · অনলাইন ঘর|Chess · online room
দাদুর ছক|Grandpa's chessboard
দান শেষ|Game over
দান চলছে|Game in progress
ছোট দুর্গ|Kingside castle
বড় দুর্গ|Queenside castle
বোড়ে কী হবে?|Promote the pawn to?
হার|Loss
দান বাতিল করে নতুন করে সাজান|Cancel and set up again
আগে নাম লিখুন।|Enter names first.
দুজনের নাম আলাদা হতে হবে।|The two names must be different.
হার মেনে নেবেন?|Resign this game?
হ্যাঁ, হার মানি|Yes, resign
দুজনেই ড্র চান?|Agree to a draw?
হ্যাঁ, ড্র|Yes, draw
এই দান বাতিল করবেন?|Cancel this game?
র‍্যাঙ্কিংয়ে কিছু যোগ হবে না।|Nothing will be added to rankings.
হ্যাঁ, বাতিল|Yes, cancel
হ্যাঁ|Yes
বাবু|Babu
পুলিশ|Police
চোর|Thief
ডাকাত|Robber
চারটা কাগজ ভাঁজ করা। পুলিশ এক দানে চোর, পরের দানে ডাকাত খোঁজেন।|Four folded chits. Police search for the thief and robber in alternating rounds.
চারজন|Four players
কত দান|Number of rounds
দান|Round
কাগজ ভাঁজ করুন|Fold the chits
একটা কাগজ তুলুন|Pick a chit
অন্যরা চোখ সরান।|Everyone else, look away.
ভাঁজ করা কাগজ|Folded chit
চুপ!|Shh!
আপনি বাবু। পরে নিজেই বলবেন।|You are Babu. Reveal yourself later.
আপনি পুলিশ। চোর ধরতে হবে।|You are Police. Find the thief.
কাউকে বুঝতে দেবেন না।|Do not give yourself away.
ভাঁজ করে পরের জনকে দিন|Fold and pass to the next player
ভাঁজ করে রাখুন|Fold it away
আমি বাবু!|I am Babu!
আমি পুলিশ!|I am Police!
কে?|Who?
এই দানে|This round
ধরা পড়েছে!|Caught!
ভুল ধরেছে!|Wrong guess!
পালিয়েছে।|escaped.
ঠিক ধরেছেন।|guessed correctly.
পেলেন ০।|earns 0.
পেলেন ০|earns 0
রাখলেন|keeps
শেষ ফল|Final result
মোট|Total
চোর ডাকাতের শুরুর পাতা|Thief & Robber home
পরের দান|Next round
চারজন খেলবেন। প্রতি দানে চারটা ভাঁজ করা কাগজ: বাবু, পুলিশ, ডাকাত, চোর।|Four players, four folded chits per round: Babu, Police, Robber and Thief.
একে একে ফোন হাতে নিয়ে একটা কাগজ তুলুন, একা দেখুন, ভাঁজ করে পরের জনকে দিন।|Take the phone in turn, view a chit privately, fold it and pass it on.
বাবু আর পুলিশ নিজেদের পরিচয় দেন। পুলিশ পালা করে খোঁজেন: এক দানে চোর, পরের দানে ডাকাত।|Babu and Police reveal themselves. Police alternate between finding the thief and the robber.
বাবু ১০০০, পুলিশ ৮০০, ডাকাত ৬০০, চোর ৪০০। যাকে খোঁজা হচ্ছে সে ধরা পড়লে শুধু সে পায় ০, পুলিশ রাখেন ৮০০। ভুল ধরলে পুলিশ পায় ০, বাকিরা নিজের পয়েন্ট রাখে।|Babu: 1000, Police: 800, Robber: 600, Thief: 400. A caught target earns 0 and Police keep 800. With a wrong guess, Police earn 0 and everyone else keeps their points.
সব দান শেষে যার মোট বেশি সে জিতল। র‍্যাঙ্কিংয়ে মোটের একশো ভাগের এক ভাগ যোগ হয়।|The highest total wins after all rounds. One hundredth of the total is added to rankings.
সবুজ: ভালো দান|Green: good round
লাল: খারাপ দান|Red: bad round
প্রতিটা খেলার মোট|Each game's total
কাগজ ভাঁজের খেলা|The folded-chit game
খেলা থামিয়ে নতুন করে সাজান|Stop and set up again
চারজনের নামই লাগবে।|Enter all four names.
নামগুলো আলাদা হতে হবে।|Names must be different.
খেলা থামাবেন?|Stop the game?
এই খেলার পয়েন্ট র‍্যাঙ্কিংয়ে যাবে না।|This game's points will not count towards rankings.
সাপ লুডু|Snakes & Ladders
এক ফোনে|One phone
এই কোডের কোনো ঘর নেই।|No room found with that code.
ঘরে চারজন হয়ে গেছে।|The room already has four players.
খেলা শুরু হয়ে গেছে।|The game has already started.
এই নাম ঘরে আছে, অন্য নাম দিন।|That name is taken in this room. Choose another.
নাম লিখুন।|Enter a name.
এখন আপনার চাল নয়।|It is not your turn.
অন্তত দুজন লাগবে।|At least two players are needed.
একটু পরে আবার চেষ্টা করুন।|Try again in a moment.
অনলাইন: বন্ধুরা নিজের ফোন থেকে|Online: friends play on their own phones
কোন লুডু|Choose your board
ছক্কা উঠলে ঘুঁটি বের হবে।|Roll a six to bring a token out.
কয়জন|Player count
কেমন খেলবে|Difficulty
অনলাইন ঘর|Online room
ঘুঁটি|Token
পরপর তিন ছক্কা, চাল বাতিল|Three sixes in a row: turn skipped
পেলেন, চালার মতো ঘুঁটি নেই|rolled, but no token can move
ঘুঁটি কেটে দিলেন! আবার চাল|Token captured! Play again
মই বেয়ে|Ladder up
থেকে|from
সাপে কাটল!|Snake bite!
এর একটা ঘুঁটি ঘরে পৌঁছাল|got a token home
চাললেন|moved
পেলেন|rolled
ঘুঁটি বাছুন|Choose a token
ছক্কা চালুন|Roll the dice
চালের অপেক্ষা…|Waiting for a move…
আপনার চাল|Your turn
৪ ঘরে|4 home
ঘর|Home
লুডুর শুরুর পাতা|Ludo home
২–৪ জন। ছক্কা (৬) উঠলে ঘুঁটি ঘর থেকে বের হয়।|2–4 players. Roll a six to bring a token out.
ছক্কা উঠলে, কারও ঘুঁটি কাটলে বা ঘুঁটি ঘরে পৌঁছালে আবার চাল। পরপর তিন ছক্কায় চাল বাতিল।|Roll a six, capture a token or reach home for another turn. Three sixes in a row skip your turn.
অন্যের ঘুঁটির ঘরে পড়লে সেটা কেটে নিজের ঘরে ফেরত যায়। তারা-চিহ্ন আর রঙিন শুরুর ঘর নিরাপদ।|Land on an opponent to send their token back. Stars and coloured starting squares are safe.
চারটা ঘুঁটি আগে মাঝের ঘরে তুললে জয়। ঘরে ঢুকতে ঠিক সংখ্যা লাগে।|Get all four tokens to the centre first. You need the exact roll to finish.
১ থেকে ১০০। মইয়ের গোড়ায় পড়লে ওপরে, সাপের মুখে পড়লে লেজে।|Race from 1 to 100. Ladders take you up; snakes take you down.
ছক্কায় আবার চাল। ঠিক ১০০-তে পৌঁছালে জয়।|Six gives another turn. Reach exactly 100 to win.
সাপ লুডুতে সব দানই ভাগ্য, তাই কম্পিউটারের স্তরে পার্থক্য নেই।|Snakes & Ladders is a game of chance, so computer difficulty makes no difference.
জয়ী ৩, দ্বিতীয় ২, তৃতীয় ১ পয়েন্ট পান।|First place: 3 points. Second: 2. Third: 1.
লাল: হার|Red: loss
এখনও কোনো খেলা শেষ হয়নি।|No games completed yet.
জয়ী ৩, দ্বিতীয় ২, তৃতীয় ১।|First: 3. Second: 2. Third: 1.
ছক্কার খেলা|Roll the dice
সবার নাম লিখুন।|Enter every player's name.
আপনার নাম লিখুন।|Enter your name.
খেলা ছেড়ে নতুন করে সাজান|Quit and set up again
শীতলপাটিতে লুডু খেলি! কোড|Join my Ludo game on Shitolpati! Code
কোড কপি হয়েছে।|Code copied.
খেলা ছেড়ে দেবেন?|Quit the game?
`;
UI_PAIRS.push(...boardLines.trim().split('\n').map(line=>line.split('|')));
const extras = `
ক্যারম · অনলাইন ঘর|Carrom · online room
স্ট্রাইকার টেনে ছাড়ুন, নিজের গুটি পকেটে ফেলুন।|Pull the striker back and release to pocket your pieces.
আপনার গুটি|Your pieces
সাদা (আগে)|White (first)
কালো (পরে)|Black (second)
সাদা গুটি (নিচে বসবেন)|White pieces (sit below)
কালো গুটি (উল্টো দিকে বসবেন)|Black pieces (sit opposite)
আপনার শট|Your shot
শটের অপেক্ষা…|Waiting for a shot…
নিশানা ঠিক করছে…|Aiming…
স্ট্রাইকার সরিয়ে টেনে ছাড়ুন|Position the striker, pull back and release
৯ গুটি|9 pieces
লাল্টু|Queen
রানী|Queen
প্রথম শট|First shot
বোর্ডে বোরিক পাউডার ছিটালেন, এখন গুটি বেশি পিছলাবে|Powder added. Pieces now slide more easily.
এর স্ট্রাইকার পকেটে! একটা গুটি মাঝে ফেরত|pocketed the striker! One piece returns to the centre.
লাল্টু তুলে নিলেন!|Queen covered!
লাল্টু পকেটে! এবার নিজের একটা গুটি ফেলে ঢেকে দিতে হবে|Queen pocketed! Cover it by pocketing one of your own pieces.
লাল্টু ঢাকা হয়নি, মাঝে ফেরত গেল|Queen not covered; returned to the centre.
টা গুটি ফেললেন, আবার শট|pieces pocketed. Shoot again.
প্রতিপক্ষের গুটি ফেলে দিলেন|Pocketed an opponent's piece
এর শটে কিছু পড়েনি|pocketed nothing
স্ট্রাইকার সরান|Move striker
স্ট্রাইকারের জায়গা|Striker position
মসৃণ|Smooth
ঠিকঠাক|Normal
খসখসে|Rough
আটকে যাচ্ছে|Sticky
বোর্ডের ঘর্ষণ|Board friction
বোরিক পাউডার ছিটান|Add board powder
বোর্ড এখনও মসৃণ|Board is still smooth
পাউডার শেষ|No powder left
১ বার|Once
ক্যারম বোর্ড|Carrom board
ক্যারমের শুরুর পাতা|Carrom home
খেলা ছেড়ে দিন|Quit game
দুজন খেলেন, মুখোমুখি বসে। একজনের সাদা গুটি, অন্যজনের কালো। মাঝে লাল্টু।|Two players sit opposite. One plays white, the other black. The queen starts in the centre.
নিজের লাইনে স্ট্রাইকার সরিয়ে রাখুন, তারপর স্ট্রাইকার থেকে আঙুল পেছনে টেনে ছেড়ে দিন। যত লম্বা টান, তত জোর।|Place the striker on your baseline. Pull back and release. A longer pull gives more power.
নিজের গুটি পকেটে পড়লে আবার শট। প্রতিপক্ষের গুটি ফেললে সেটা তার হিসাবে যায়।|Pocket your own piece for another shot. An opponent's piece counts for them.
লাল্টু ফেললে পরের শটে (বা একই শটে) নিজের একটা গুটি ফেলে ঢাকতে হয়, তবেই লাল্টুর|Cover the queen with your own piece on the same or next shot to earn its
পয়েন্ট। না পারলে লাল্টু মাঝে ফেরে।|points. Otherwise it returns to the centre.
স্ট্রাইকার পকেটে পড়লে ফাউল: চাল যায়, আর নিজের একটা পকেটের গুটি মাঝে ফেরত।|Pocketing the striker is a foul: lose your turn and return one of your pocketed pieces.
প্রতি শটে বোর্ডের পাউডার একটু উঠে যায়, বোর্ড খসখসে হয়। মিটারে দেখা যায়। খেলার মাঝে প্রত্যেকে একবার বোরিক পাউডার ছিটাতে পারেন (বোর্ড যখন আর মসৃণ নেই)।|Every shot wears away powder and increases friction. Each player can add powder once when the board is no longer smooth.
যে আগে নয়টা গুটি ফেলে, খেলা শেষ। বেশি পয়েন্ট যার (লাল্টুসহ) সে জেতে। র‍্যাঙ্কিংয়ে জয়ে ৩ পয়েন্ট।|The game ends when a player pockets all nine pieces. The highest score, including the queen, wins. A win earns 3 ranking points.
জয়ে ৩ পয়েন্ট।|Win: 3 points.
নিজের লাইনে স্ট্রাইকার ধরে পেছনে টানুন।|Pull the striker back from your baseline.
স্ট্রাইকার কোনো গুটির ওপর। একটু সরান।|The striker overlaps a piece. Move it slightly.
বোর্ডের খেলা|The board game
খেলা চলছে|Game in progress
ঘরের মাপ (প্রতি দিকে কটা বাক্স)|Board size (boxes per side)
দুটো বিন্দু জুড়ে দাগ টানুন। বাক্সের চার দিক যে বন্ধ করে, বাক্স তার।|Connect two dots. Close the fourth side to claim a box.
দাগ টানুন|Draw a line
জায়গা দখলের বোর্ড|Dots & Boxes board
এর চালের অপেক্ষা…|is about to play…
টা বাক্স দখল করলেন! আবার চাল|boxes claimed! Play again
জায়গা দখলের শুরুর পাতা|Dots & Boxes home
পালা করে পাশাপাশি দুটো বিন্দু জুড়ে একটা করে দাগ টানুন (খাড়া বা আড়াআড়ি)।|Take turns joining adjacent dots with a horizontal or vertical line.
কোনো বাক্সের চতুর্থ দিকটা যে টানে, বাক্সটা তার। তখন সে আবার দাগ টানে।|Draw a box's fourth side to claim it and take another turn.
সাবধান: কোনো বাক্সের তৃতীয় দিক টানলে পরের জন সেটা নিয়ে নিতে পারে।|Be careful: drawing a third side may give the next player a box.
সব বাক্স ভরে গেলে যার বাক্স বেশি সে জেতে। র‍্যাঙ্কিংয়ে প্রথম ৩, দ্বিতীয় ২, তৃতীয় ১।|The most boxes wins. Ranking points: first 3, second 2, third 1.
প্রথম ৩, দ্বিতীয় ২, তৃতীয় ১।|First: 3. Second: 2. Third: 1.
বিন্দু আর বাক্স|Dots and boxes
বাক্স|boxes
সাদা নুড়ি|White pebble
তেঁতুল বিচি|Tamarind seed
তিন গুটি · অনলাইন ঘর|Three Stones · online room
অনলাইন: বন্ধু নিজের ফোন থেকে খেলবে।|Online: friends play on their own phones.
উঠোনের মাটিতে দাগ কাটা ঘর, তিনটা করে গুটি। এক লাইনে তিনটা মেলালেই জয়।|Three stones each on a courtyard grid. Make a line of three to win.
সাদা নুড়ি (আগে)|White pebbles (first)
তেঁতুল বিচি (পরে)|Tamarind seeds (second)
সাদা নুড়ির খেলোয়াড়|White pebble player
তেঁতুল বিচির খেলোয়াড়|Tamarind seed player
তিন গুটির ঘর|Three Stones board
একটা ঘরে গুটি রাখুন|Place a stone on a spot
নিজের গুটি ছুঁয়ে পাশের ঘরে সরান|Select your stone, then move to an adjacent spot
হাতে|In hand
টা গুটি|stones
ড্র! কেউ মেলাতে পারেননি।|Draw! Nobody made a line.
প্রতিপক্ষ আটকে গেছেন|Opponent has no moves
তিন গুটির শুরুর পাতা|Three Stones home
দুজন খেলেন, প্রত্যেকের তিনটা গুটি। ঘর হলো তিন সারি তিন কলামের নয়টা বিন্দু, কোনাকুনি দাগও আছে।|Two players, three stones each. The board has nine connected spots in three rows, including diagonals.
প্রথমে পালা করে একটা একটা গুটি খালি বিন্দুতে রাখুন।|First, take turns placing stones on empty spots.
ছয়টা গুটি বসে গেলে পালা করে নিজের একটা গুটি দাগ ধরে পাশের খালি বিন্দুতে সরান।|Once all six stones are placed, move one stone along a line to an adjacent empty spot each turn.
নিজের তিনটা গুটি এক সোজা লাইনে (আড়াআড়ি, খাড়া বা কোনাকুনি) মেলালেই জয়। যে আর সরাতে পারে না, সে হারে।|Make a horizontal, vertical or diagonal line of three to win. A player with no legal move loses.
একই অবস্থা তিনবার এলে বা অনেকক্ষণ কেউ না জিতলে ড্র। র‍্যাঙ্কিংয়ে জয়ে ৩, ড্রয়ে ১।|Threefold repetition or too many moves without a winner is a draw. Win: 3 points. Draw: 1.
উঠোনের খেলা|The courtyard game
আগে নিজের একটা গুটি ছুঁয়ে বাছুন।|Select one of your stones first.
টিতে প্রথম|first-place finishes
প্রথম|First
সামগ্রিক র‍্যাঙ্কিং|Overall rankings
মোট পয়েন্ট|Total points
এখনও কোনো ম্যাচ শেষ হয়নি। খেলা শেষ হলে এখানে দেখা যাবে।|No matches completed yet. Finished games will appear here.
সব ম্যাচ|All matches
তারিখ অনুযায়ী, নতুনটি আগে।|Newest first, ordered by date.
অ্যাকাউন্ট|Account
শুধু নাম দিলেই অ্যাকাউন্ট। এক ফোনে অনেকগুলো রাখা যায়; প্রতিটা খেলায় এই নাম বেছে নিলে পয়েন্ট এখানেই জমে। কয়েন জেতা যায় পেন ফাইটের লড়াইয়ে।|A name creates an account. Keep several on this phone and choose your name in each game to collect points. Earn coins in Pen Fight.
নতুন অ্যাকাউন্টের নাম|New account name
খুলুন|Create
এর কলমের দোকান|: pen shop
অ্যাকাউন্ট মুছুন|Delete account
এখনও কোনো অ্যাকাউন্ট নেই।|No accounts yet.
প্রতিটি ম্যাচ (খেলার সেট) শেষ হলে পয়েন্ট এখানে জমা হয়।|Points are saved here when each match ends.
ইতিহাস মুছুন|Clear history
অঙ্ক|Maths
এই ফোনে আর অ্যাকাউন্ট খোলা যাবে না।|This phone has reached its account limit.
অ্যাকাউন্ট মুছবেন? কয়েন, কেনা জিনিস আর র‍্যাঙ্কিংয়ের সব পয়েন্ট মুছে যাবে।|Delete this account? Coins, purchases and all ranking points will be removed.
ইতিহাস মুছবেন? এটা ফেরত আনা যাবে না।|Clear history? This cannot be undone.
অংশ|Sections
আপনি খেলবেন এই নামে|You will play as
বদলান|Change
প্রথমবার: আপনার নাম দিন, সব অনলাইন খেলায় এটাই থাকবে|Enter a name for all your online games
নতুন ঘর খুলুন|Create room
অথবা বন্ধুর কোড দিন|Or enter a friend's code
ঘরের কোড|Room code
কোডের|Code
নম্বর অক্ষর|letter
যোগ দিন|Join
নতুন নাম (সব অনলাইন খেলায় এটাই থাকবে)|New name for all online games
কোড শেয়ার করুন|Share code
ঘর খুলেছেন|Room host
অপেক্ষা…|Waiting…
আরেকজনের অপেক্ষা…|Waiting for another player…
ঘর যিনি খুলেছেন তিনি শুরু করবেন।|The room host will start the game.
শীতলপাটিতে|On Shitolpati
খেলি! কোড|Join my game! Code
ঘর ভরে গেছে।|The room is full.
এই নাম ঘরে আছে। প্রোফাইলের নাম বদলে আবার চেষ্টা করুন।|That name is taken in this room. Change your profile name and try again.
আরও খেলোয়াড় লাগবে।|More players needed.
এই কোড অন্য খেলার ঘরের।|This code belongs to another game.
অনলাইন খেলা এখন চালু নেই।|Online play is unavailable right now.
খেলা এগিয়ে গেছে, আবার চেষ্টা করুন।|The game has moved on. Try again.
জন খেলোয়াড়|players
কম্পিউটার · সর্বোচ্চ|computers · maximum
অন্য|Other
নিজে লিখুন|Enter your own
বাতিল|Cancel
চালিয়ে যান|Continue
পুনরায় শুরু|Restart
স্বাগতম|Welcome
ঘাতক|Mafia
রাজবৈদ্য|Royal physician
সেনাপতি|Commander
প্রজা|Villager
বিশ্বাসঘাতক|Betrayer
গণক|Seer
রক্ষক|Guardian
হোস্ট|Host
পলাশী|Polashi
সিসিলি|Sicily
ক্লাসিক|Classic
ভূমিকা|Role
পরিচয়|Identity
ডাক্তার|Doctor
গ্রামবাসী|Villager
মাফিয়া|Mafia
ছোট ধাঁধা, এক কথায় উত্তর|Short riddles, a one-word answer
একটু লম্বা, একটু প্যাঁচ|A little longer, a little trickier
অক্ষরের খেলা আর লম্বা ছড়া|Word puzzles and longer riddles
অঙ্কুর|Seedling
পাতা|Leaf
শাখা|Branch
মহীরুহ|Great tree
৯–১২ বছর|Ages 9–12
স্কুল · ৭ম–১০ম|School · years 7–10
কলেজ · একাদশ–দ্বাদশ|College · years 11–12
স্নাতক · STEM|Undergraduate · STEM
যোগ-বিয়োগ, নামতা, ভাগ, সহজ ভগ্নাংশ|Addition, subtraction, tables, division and simple fractions
শতকরা, বর্গমূল, ল.সা.গু, সমীকরণ|Percentages, square roots, LCM and equations
লগ, ত্রিকোণমিতি, বিন্যাস, অন্তরীকরণ|Logarithms, trigonometry, permutations and derivatives
ক্যালকুলাস, ম্যাট্রিক্স, সম্ভাবনা, বাইনারি|Calculus, matrices, probability and binary
ক|A
খ|B
গ|C
ঘ|D
`;
UI_PAIRS.push(...extras.trim().split('\n').map(line=>line.split('|')));
const finishing = `
জন|players
বা|or
ও|and
সঙ্গে|plus
সব|All
শেষ|Last
এর|of
র শুরুর পাতা|home
এই খেলার শুরুর পাতা|Game home
ভোট · কেস|Vote · case
রনি + মিতু|Roni + Mitu
পরীক্ষা কবে?|When is the exam?
৯ম শ্রেণি খ শাখা|Class 9, section B
আমি পাস করবই|I will pass
বাংলা ১ম পত্র|Bangla Paper 1
টিফিনে মাঠে|Meet at break
স্যার আসছে!!|Teacher is coming!!
রোল ৩৭|Roll 37
পিনপয়েন্ট|Pinpoint
হাই-স্কুল|Hi-School
আই-টিন|i-Teen
ইকোনো|Econo
মাঝারি ওজন, সোজা চলে|Medium weight, straight motion
লম্বা আর ভারী, সহজে পড়ে না|Long and heavy, hard to knock off
হালকা, জোরে ছোটে|Light and fast
ঘুরে গিয়ে ধাক্কা দেয়|Spins into the opponent
ফাউন্টেন পেন · সোনার নিব|Fountain pen · gold nib
ফাউন্টেন পেন · স্টিলের ক্লিপ|Fountain pen · steel clip
ফাউন্টেন পেন · সবুজ ডোরা|Fountain pen · green stripes
ফাউন্টেন পেন · মাকরোলন বডি|Fountain pen · Makrolon body
ফাউন্টেন পেন · ঝকঝকে বার্নিশ|Fountain pen · glossy lacquer
রাবার গ্রিপার|Rubber grip
প্রতিটা গ্রিপারে বেঞ্চ আঁকড়ে ধরে বেশি, কলমও একটু ভারী হয়।|Each grip adds friction and a little weight.
ভারী পিতলের মাথা|Weighted brass cap
সামনে ধাতুর মাথা: ধাক্কা জোরালো, নিজে সহজে সরে না।|A metal front cap adds impact and stability.
পেছনে বাড়তি মাথা|Rear extension
কলমের পেছনেও একটা মাথা: কলম লম্বা হয়, নাগাল বাড়ে।|An extra rear cap increases length and reach.
স্কচটেপ মোড়ানো|Tape wrap
টেপের খসখসে গা: ধাক্কা খেয়ে কলম কম ঘোরে।|Rough tape reduces spin after an impact.
ইরেজার বাম্পার|Eraser bumper
মাথায় ইরেজার: লাগলে অন্য কলম ছিটকে যায় বেশি।|An eraser cap gives other pens a stronger knock.
স্টিলের ক্লিপ|Steel clip
ক্লিপের ওজন আর একটু বাড়তি গ্রিপ।|Extra weight and grip from a steel clip.
খেলা শেষ” চাপলে টেবিলে সবার পয়েন্ট আর শেষ পাঁচ ধাঁধার ফল দেখা যাবে।|Select End game to see everyone's points and last five riddles.
বাংলার পুরোনো ধাঁধার শেষে বলা হয় “কহেন কবি কালিদাস”; খেলার নাম সেখান থেকে। ছবিগুলো এই অ্যাপের জন্য আঁকা। ধাঁধার বেশিরভাগ|The game's name comes from a traditional Bengali riddle refrain. Illustrations were made for this app. The Bangla riddle collection mostly comes from
লাইসেন্স) থেকে, যা বাংলা ধাঁধার বই থেকে সংকলিত; বাকিগুলো বিভিন্ন বাংলা ধাঁধার ওয়েবপাতা থেকে বাছাই করা প্রচলিত ধাঁধা।|licence), compiled from Bengali riddle books, alongside traditional riddles from Bengali websites. English mode uses its own collection of English riddles.
`;
UI_PAIRS.push(...finishing.trim().split('\n').map(line=>line.split('|')));
const datesAndLabels=`
জানুয়ারি|January
ফেব্রুয়ারি|February
মার্চ|March
এপ্রিল|April
মে|May
জুন|June
জুলাই|July
আগস্ট|August
সেপ্টেম্বর|September
অক্টোবর|October
নভেম্বর|November
ডিসেম্বর|December
রবিবার|Sunday
সোমবার|Monday
মঙ্গলবার|Tuesday
বুধবার|Wednesday
বৃহস্পতিবার|Thursday
শুক্রবার|Friday
শনিবার|Saturday
উৎস|Source
ছোট ধাঁধা|Short riddles
গল্পের উৎস|Story source
`;
UI_PAIRS.push(...datesAndLabels.trim().split('\n').map(line=>line.split('|')));
