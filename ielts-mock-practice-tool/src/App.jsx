import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  Headphones, BookOpen, PenLine, Mic, BarChart3, Play, Pause, Square, RotateCcw,
  Check, X, Eye, EyeOff, Volume2, Gauge, ChevronRight, Circle, TrendingUp, AlertCircle,
  Sun, Moon,
} from "lucide-react";

/* Small localStorage helpers (safe if storage is unavailable) */
const loadLS = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const saveLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

/* ============================== BAND TABLES (official) ============================== */
function listeningBand(r) {
  if (r >= 39) return 9; if (r >= 37) return 8.5; if (r >= 35) return 8; if (r >= 32) return 7.5;
  if (r >= 30) return 7; if (r >= 26) return 6.5; if (r >= 23) return 6; if (r >= 18) return 5.5;
  if (r >= 16) return 5; if (r >= 13) return 4.5; if (r >= 11) return 4; if (r >= 8) return 3.5;
  if (r >= 6) return 3; return 2.5;
}
function readingBand(r) {
  if (r >= 39) return 9; if (r >= 37) return 8.5; if (r >= 35) return 8; if (r >= 33) return 7.5;
  if (r >= 30) return 7; if (r >= 27) return 6.5; if (r >= 23) return 6; if (r >= 19) return 5.5;
  if (r >= 15) return 5; if (r >= 13) return 4.5; if (r >= 10) return 4; if (r >= 8) return 3.5;
  if (r >= 6) return 3; return 2.5;
}

/* ============================== CONTENT: LISTENING (40) ============================== */
const LISTENING = [
  {
    id: "S1", part: "Part 1", title: "Booking a holiday cottage",
    setting: "A conversation between a customer and the owner of a holiday cottage business.",
    instruction: "Questions 1–10. Complete the form. Write ONE WORD AND/OR A NUMBER for each answer.",
    qtype: "Form completion",
    transcript: [
      { who: "Owner", t: "Good morning, Lakeside Holiday Cottages, Emma speaking." },
      { who: "Customer", t: "Hello, I'd like to book a cottage for a short break." },
      { who: "Owner", t: "Of course. Can I take your name?" },
      { who: "Customer", t: "It's Peter Hancock. That's H, A, N, C, O, C, K." },
      { who: "Owner", t: "Thank you, Mr Hancock. Which cottage were you interested in?" },
      { who: "Customer", t: "I was looking at the one called Willow. Is that free in August?" },
      { who: "Owner", t: "Let me check. Willow is booked, but we have Heron free from the twelfth of August." },
      { who: "Customer", t: "That works. How many nights can we stay?" },
      { who: "Owner", t: "It's a minimum of three nights. How many people will there be?" },
      { who: "Customer", t: "There'll be five of us, two adults and three children." },
      { who: "Owner", t: "Heron sleeps six, so that's fine. The price is one hundred and forty pounds per night." },
      { who: "Customer", t: "And is breakfast included?" },
      { who: "Owner", t: "No, but the cottage has a fully equipped kitchen, free parking and wifi." },
      { who: "Customer", t: "Is there anything we need to bring ourselves?" },
      { who: "Owner", t: "Towels aren't provided, so please bring your own. Bed linen is included." },
      { who: "Owner", t: "We also ask for a deposit of fifty pounds to confirm the booking." },
      { who: "Customer", t: "No problem. How do I pay that?" },
      { who: "Owner", t: "By card over the phone, or by bank transfer." },
      { who: "Customer", t: "I'll do a transfer. Is the lake safe for swimming?" },
      { who: "Owner", t: "Swimming's fine, but please avoid the north end, where it's very deep." },
      { who: "Customer", t: "Good to know. Thank you very much." },
    ],
    form: { heading: "LAKESIDE HOLIDAY COTTAGES — Booking form", rows: [
      { id: 1, label: "Customer surname", pre: "Peter ", post: "", accept: ["hancock"] },
      { id: 2, label: "Cottage booked", pre: "", post: "", accept: ["heron"] },
      { id: 3, label: "Available from", pre: "12th ", post: "", accept: ["august"] },
      { id: 4, label: "Minimum stay", pre: "", post: " nights", accept: ["3", "three"] },
      { id: 5, label: "Number of guests", pre: "", post: "", accept: ["5", "five"] },
      { id: 6, label: "Price per night", pre: "£", post: "", accept: ["140"] },
      { id: 7, label: "Guests must bring their own", pre: "", post: "", accept: ["towels", "towel"] },
      { id: 8, label: "Deposit", pre: "£", post: "", accept: ["50", "fifty"] },
      { id: 9, label: "Payment method", pre: "bank ", post: "", accept: ["transfer"] },
      { id: 10, label: "Avoid swimming at the", pre: "", post: " end", accept: ["north"] },
    ]},
  },
  {
    id: "S2", part: "Part 2", title: "Brackenwood Nature Reserve",
    setting: "A guide gives a welcome talk to visitors at a nature reserve.",
    instruction: "Questions 11–15: choose the correct letter, A, B or C. Questions 16–20: label the map. Choose your answer from the lettered points A–H.",
    qtype: "Multiple choice + Map labelling",
    transcript: [
      { who: "Guide", t: "Good morning everyone, and welcome to Brackenwood Nature Reserve. I'm Sophie and I'll give you a quick introduction." },
      { who: "Guide", t: "A few practical points. The reserve is open every day except Mondays, when our staff carry out maintenance." },
      { who: "Guide", t: "Entry is free, though we do welcome donations. Dogs are allowed, but they must be kept on a lead at all times, to protect the ground-nesting birds." },
      { who: "Guide", t: "Photography is encouraged, but please don't use flash near the bird hide, as it disturbs the wildlife." },
      { who: "Guide", t: "If you'd like refreshments, the café is open until four. I'd particularly recommend the homemade soup." },
      { who: "Guide", t: "Now let me explain the layout. As you leave this visitor centre, the main path runs straight ahead." },
      { who: "Guide", t: "Where the path forks, take the left branch and you'll reach the bird hide, which overlooks the lake." },
      { who: "Guide", t: "If instead you take the right branch at the fork, it leads up to the viewpoint on the hill, which gives the best photographs of the valley." },
      { who: "Guide", t: "The café is the building just behind this visitor centre. The wildflower meadow is in the far corner, beyond the lake." },
      { who: "Guide", t: "And the children's play area is tucked between the car park and the café, so you can keep an eye on things while having a coffee. Enjoy your visit." },
    ],
    mcq: [
      { id: 11, p: "The reserve is closed on", o: ["weekends", "Mondays", "public holidays"], a: 1 },
      { id: 12, p: "Entry to the reserve is", o: ["free", "ten pounds", "free for children only"], a: 0 },
      { id: 13, p: "Dogs must", o: ["be left outside", "be kept on a lead", "wear a muzzle"], a: 1 },
      { id: 14, p: "Near the bird hide, visitors should not", o: ["take photographs", "use flash", "speak"], a: 1 },
      { id: 15, p: "The guide especially recommends the café's", o: ["soup", "cakes", "coffee"], a: 0 },
    ],
    map: [
      { id: 16, label: "Bird hide", a: "D" },
      { id: 17, label: "Viewpoint", a: "F" },
      { id: 18, label: "Café", a: "A" },
      { id: 19, label: "Wildflower meadow", a: "G" },
      { id: 20, label: "Children's play area", a: "C" },
    ],
  },
  {
    id: "S3", part: "Part 3", title: "Campus recycling project tutorial",
    setting: "Two students, Lucas and Priya, discuss a group project with their tutor.",
    instruction: "Questions 21–25: choose the correct letter, A, B or C. Questions 26–30: who will do each task? A) Lucas  B) Priya  C) Both.",
    qtype: "Multiple choice + Matching",
    transcript: [
      { who: "Tutor", t: "So, how's the project on the campus recycling campaign going?" },
      { who: "Priya", t: "Quite well. We've finished the survey, but analysing the results is taking time." },
      { who: "Lucas", t: "We got over two hundred responses, which is more than we expected." },
      { who: "Tutor", t: "That's a good sample. What was the main finding?" },
      { who: "Priya", t: "The surprising thing was that most students wanted to recycle, but found the bins too hard to locate." },
      { who: "Lucas", t: "So it's not really about attitude, it's about convenience." },
      { who: "Tutor", t: "An important distinction. What are your recommendations?" },
      { who: "Lucas", t: "More bins and clearer signs. We considered an app too, but decided it was too expensive." },
      { who: "Tutor", t: "Sensible. For the presentation, who's doing what?" },
      { who: "Priya", t: "I'll handle the introduction and the survey design section." },
      { who: "Lucas", t: "And I'll present the data analysis, since I did most of the statistics." },
      { who: "Priya", t: "The recommendations we'll present together, as we both worked on those." },
      { who: "Lucas", t: "I'll also make the slides." },
      { who: "Priya", t: "And I'll prepare the handout for the audience." },
      { who: "Tutor", t: "Good division. Make sure you reference the council's recycling report, it's very relevant. And the deadline is firm, the thirtieth." },
    ],
    mcq: [
      { id: 21, p: "The part of the project taking longest is", o: ["collecting responses", "analysing the results", "writing the survey"], a: 1 },
      { id: 22, p: "The number of survey responses was", o: ["about a hundred", "over two hundred", "under fifty"], a: 1 },
      { id: 23, p: "The main finding was that students", o: ["don't want to recycle", "want to recycle but can't find bins", "prefer an app"], a: 1 },
      { id: 24, p: "They rejected the app idea because it was", o: ["too expensive", "too complicated", "unpopular"], a: 0 },
      { id: 25, p: "The tutor reminds them to reference the", o: ["university policy", "council's recycling report", "raw survey data"], a: 1 },
    ],
    match: { legend: ["A — Lucas", "B — Priya", "C — Both"], options: ["Lucas", "Priya", "Both"], items: [
      { id: 26, label: "Introduction", a: 1 },
      { id: 27, label: "Data analysis", a: 0 },
      { id: 28, label: "Recommendations", a: 2 },
      { id: 29, label: "Presentation slides", a: 0 },
      { id: 30, label: "Audience handout", a: 1 },
    ]},
  },
  {
    id: "S4", part: "Part 4", title: "Lecture: the history of lighthouses",
    setting: "A university lecturer talks about lighthouses through history.",
    instruction: "Questions 31–40. Complete the notes. Write ONE WORD ONLY for each answer.",
    qtype: "Note completion",
    transcript: [
      { who: "Lecturer", t: "Today I'll talk about lighthouses, structures that have guided sailors for thousands of years." },
      { who: "Lecturer", t: "The earliest famous one was the Pharos of Alexandria, built in Egypt around two hundred and eighty BC. It used a fire and polished bronze mirrors to reflect light out to sea, and stood until it was destroyed by a series of earthquakes." },
      { who: "Lecturer", t: "For most of history, lighthouses simply burned wood or coal. A breakthrough came in the eighteenth century with oil lamps, which were far more reliable." },
      { who: "Lecturer", t: "But the real revolution was optical. In eighteen twenty-two a French physicist named Fresnel invented a special lens. It used rings of glass to bend light into a single powerful beam, making a weak lamp visible from many kilometres away." },
      { who: "Lecturer", t: "Building at sea was dangerous. The famous Eddystone lighthouse off the English coast was rebuilt many times. The engineer John Smeaton shaped his tower like an oak tree, wide at the base, and used cement that could set underwater." },
      { who: "Lecturer", t: "Life as a keeper was lonely. They kept the light burning all night and cleaned the lens daily. In the twentieth century electricity replaced oil, and lighthouses were gradually automated, removing the need for keepers." },
    ],
    notes: { sections: [
      { h: "The Pharos of Alexandria", rows: [
        { id: 31, pre: "Built around 280 ", post: "", accept: ["bc"] },
        { id: 32, pre: "Used fire and polished ", post: " mirrors", accept: ["bronze"] },
        { id: 33, pre: "Destroyed by a series of ", post: "", accept: ["earthquakes", "earthquake"] },
      ]},
      { h: "Key developments", rows: [
        { id: 34, pre: "18th century: more reliable ", post: " lamps", accept: ["oil"] },
        { id: 35, pre: "1822: Fresnel invented a special ", post: "", accept: ["lens"] },
        { id: 36, pre: "Made a weak lamp visible many ", post: " away", accept: ["kilometres", "kilometers", "km"] },
      ]},
      { h: "Building at sea", rows: [
        { id: 37, pre: "The ", post: " lighthouse was rebuilt many times", accept: ["eddystone"] },
        { id: 38, pre: "Smeaton shaped the tower like an ", post: " tree", accept: ["oak"] },
        { id: 39, pre: "Used cement that could set ", post: "", accept: ["underwater"] },
      ]},
      { h: "The modern era", rows: [
        { id: 40, pre: "Lighthouses were gradually ", post: ", removing keepers", accept: ["automated"] },
      ]},
    ]},
  },
];

/* ============================== CONTENT: READING (40) ============================== */
const READING = [
  {
    id: "P1", title: "Reading Passage 1", heading: "The bowerbird's remarkable art", q: "Questions 1–13",
    paras: [
      ["A", "Among the many extraordinary behaviours found in the animal kingdom, few are as striking as that of the bowerbird. Native to Australia and New Guinea, the male is famous not for its plumage, which in many species is rather plain, but for the elaborate structures it builds to attract a mate. These structures, known as bowers, are not nests; they are used purely for courtship, and once mating is over they serve no further purpose."],
      ["B", "A bower can take many forms depending on the species. The most common type, the avenue bower, consists of two parallel walls of carefully arranged twigs, forming a corridor through which the female walks. Other species build maypole bowers, towers of sticks around a central sapling. What unites them all is the astonishing care the male takes in decoration. He collects coloured objects, berries, flowers, shells, beetle wings and, increasingly, human litter such as bottle caps and pieces of plastic, and arranges them with apparent deliberation."],
      ["C", "Colour plays a central role. Many bowerbirds show a strong preference for a particular colour, and the satin bowerbird is especially known for its obsession with blue. Researchers have watched males travelling long distances to find blue objects, stealing them from rival bowers, and rejecting items of other colours. Some scientists believe this preference is linked to the rarity of blue in the birds' natural environment, which would make a blue display particularly impressive."],
      ["D", "Perhaps the most sophisticated trick is performed by the great bowerbird, which creates an optical illusion. The male arranges objects on the floor of his avenue so that they increase in size as they get further from the entrance. To a female standing at the entrance, this makes the court appear a uniform size, an effect known to humans as forced perspective. Experiments have shown that males whose illusions are most convincing are more successful in attracting mates."],
      ["E", "Why such effort should have evolved has long fascinated biologists. The leading explanation is that the bower acts as a signal of the male's fitness. Building and maintaining a high-quality bower, and defending its decorations from thieves, requires intelligence, good health and persistence, exactly the qualities a female might wish to pass on to her offspring. In this view, the bower is a kind of advertisement, allowing the female to assess the male without the risk of choosing a poor partner."],
    ],
    groups: [
      { type: "True/False/Not Given", kind: "tfng", instr: "Questions 1–6. Do the following statements agree with the information in the passage? Write TRUE, FALSE or NOT GIVEN.", items: [
        { id: 1, text: "Bowerbirds use their bowers both to attract mates and to raise their young.", a: "FALSE" },
        { id: 2, text: "All species of bowerbird build the same type of bower.", a: "FALSE" },
        { id: 3, text: "Some bowerbirds include man-made objects in their decorations.", a: "TRUE" },
        { id: 4, text: "The satin bowerbird prefers blue objects to objects of other colours.", a: "TRUE" },
        { id: 5, text: "Blue is a common colour in the bowerbird's natural habitat.", a: "FALSE" },
        { id: 6, text: "The great bowerbird's optical illusion was first discovered by accident.", a: "NOT GIVEN" },
      ]},
      { type: "Sentence completion", kind: "gap", instr: "Questions 7–10. Complete each sentence with ONE WORD ONLY from the passage.", items: [
        { id: 7, pre: "An avenue bower is made of two parallel ", post: " of twigs.", accept: ["walls"] },
        { id: 8, pre: "The great bowerbird makes objects appear to grow in ", post: " further from the entrance.", accept: ["size"] },
        { id: 9, pre: "The visual effect this creates is called forced ", post: ".", accept: ["perspective"] },
        { id: 10, pre: "Scientists think the bower works as an ", post: " of the male's quality.", accept: ["advertisement"] },
      ]},
      { type: "Multiple choice", kind: "mcq", instr: "Questions 11–13. Choose the correct letter, A, B, C or D.", items: [
        { id: 11, p: "The passage says the male bowerbird's feathers are often", o: ["brightly coloured", "plain", "blue", "larger than the female's"], a: 1 },
        { id: 12, p: "Satin bowerbirds have been observed", o: ["sharing decorations", "stealing blue objects from rivals", "avoiding bright colours", "building maypole bowers"], a: 1 },
        { id: 13, p: "The leading explanation for the bower is that it", o: ["protects the female", "signals the male's fitness", "stores food", "marks territory"], a: 1 },
      ]},
    ],
  },
  {
    id: "P2", title: "Reading Passage 2", heading: "The story of tea", q: "Questions 14–26",
    paras: [
      ["A", "Tea is, after water, the most widely consumed drink in the world, yet its origins lie in a single region of south-west China. According to legend, the beverage was discovered by the emperor Shen Nong in 2737 BC, when leaves drifted into his pot of boiling water. Whatever the truth of the story, tea was certainly being drunk in China thousands of years ago, first as a medicine and only later as an everyday pleasure."],
      ["B", "For centuries, tea remained almost unknown outside East Asia. It was Portuguese and Dutch traders who first brought it to Europe in the seventeenth century, where it was treated as an exotic and expensive luxury. In Britain it was at first so costly that it was kept in locked boxes, and a single pound could cost an ordinary worker's wages for many weeks."],
      ["C", "The popularity of tea in Britain grew with remarkable speed. By the eighteenth century it had spread from the wealthy to almost every level of society, helped by falling prices and the rise of fashionable tea gardens. This transformation had unexpected consequences: the government imposed heavy taxes, which in turn encouraged a vast and dangerous trade in smuggled tea."],
      ["D", "Tea also reshaped global trade and politics. To pay for the quantities it imported from China, Britain came to rely on selling opium, a trade that eventually led to war. In its American colonies, resentment at tea taxes produced the famous Boston Tea Party of 1773, when protesters threw chests of tea into the harbour, an event that helped trigger the American Revolution."],
      ["E", "Determined to break China's monopoly, the British sought to grow tea elsewhere. In the nineteenth century they established huge plantations in India, particularly in Assam and Darjeeling, where a native variety of the tea plant was found to thrive. These plantations depended on the labour of thousands of workers, often in harsh conditions, and turned India into the world's leading producer."],
      ["F", "The way tea is processed determines its type. All true tea comes from the same plant, Camellia sinensis; the difference between green, black and oolong tea lies in how the leaves are treated after picking. Green tea is heated quickly to prevent oxidation, while black tea is allowed to oxidise fully, which darkens the leaves and produces a stronger flavour. This surprises many drinkers, who assume the colours come from different plants."],
      ["G", "Today tea is grown in dozens of countries and drunk in countless ways, from the sweet, milky chai of India to the delicate ceremonies of Japan. It has become so deeply woven into daily life that it is easy to forget its long and often turbulent history. Few products have done more to connect, and at times divide, the nations of the world."],
    ],
    groups: [
      { type: "Matching headings", kind: "headings", instr: "Questions 14–20. Choose the correct heading for each paragraph from the list of headings below.",
        headings: [
          ["i", "A drink that changed world politics"],
          ["ii", "From medicine to daily habit"],
          ["iii", "How processing creates different teas"],
          ["iv", "The proven health benefits of tea"],
          ["v", "Tea arrives in Europe"],
          ["vi", "Breaking China's control of supply"],
          ["vii", "Rapid spread through British society"],
          ["viii", "A global drink with a complex past"],
          ["ix", "The decline of tea drinking"],
          ["x", "Growing tea in the garden"],
        ],
        items: [
          { id: 14, label: "Paragraph A", a: "ii" },
          { id: 15, label: "Paragraph B", a: "v" },
          { id: 16, label: "Paragraph C", a: "vii" },
          { id: 17, label: "Paragraph D", a: "i" },
          { id: 18, label: "Paragraph E", a: "vi" },
          { id: 19, label: "Paragraph F", a: "iii" },
          { id: 20, label: "Paragraph G", a: "viii" },
        ],
      },
      { type: "Matching information", kind: "letters", instr: "Questions 21–23. Which paragraph contains the following information? Write the correct letter, A–G.",
        letters: ["A", "B", "C", "D", "E", "F", "G"], items: [
          { id: 21, label: "a reference to an event linked to a revolution", a: "D" },
          { id: 22, label: "an explanation of why all types of tea come from one plant", a: "F" },
          { id: 23, label: "a description of tea being stored securely because of its value", a: "B" },
        ],
      },
      { type: "Sentence completion", kind: "gap", instr: "Questions 24–26. Complete each sentence with ONE WORD ONLY from the passage.", items: [
        { id: 24, pre: "Tea was first used in China as a ", post: " before becoming a daily drink.", accept: ["medicine"] },
        { id: 25, pre: "Heavy taxes in Britain encouraged the ", post: " of tea.", accept: ["smuggling"] },
        { id: 26, pre: "British plantations grew after a native ", post: " of the tea plant was found in India.", accept: ["variety"] },
      ]},
    ],
  },
  {
    id: "P3", title: "Reading Passage 3", heading: "De-extinction: should we bring species back?", q: "Questions 27–40",
    paras: [
      ["", "De-extinction, the idea of bringing vanished species back to life, has moved in a few decades from science fiction to serious scientific proposal. Advances in genetics, particularly the ability to read and edit DNA, have led some researchers to argue that animals such as the woolly mammoth or the passenger pigeon could one day walk the earth again. Yet the prospect raises difficult scientific, ethical and ecological questions, and the scientific community remains deeply divided."],
      ["", "The techniques under discussion vary. One approach is cloning, which requires intact living cells and is therefore impossible for species that died out long ago. A second, more realistic method is genetic engineering: scientists would take a living relative of the extinct animal, the Asian elephant in the case of the mammoth, and edit its genome to insert characteristics of the lost species. The result would not be a true mammoth but a hybrid, an elephant modified to survive in cold climates."],
      ["", "Supporters present several arguments. Dr Helena Ross, a geneticist, contends that de-extinction is fundamentally an act of repair. Humans, she points out, drove many of these species to extinction, and we therefore have a moral duty to undo the damage where we can. She also argues that the technologies developed along the way will have valuable applications in conserving species that are endangered but not yet extinct."],
      ["", "Others see ecological benefits. The mammoth once helped maintain the grasslands of the Arctic tundra, and some scientists suggest that reintroducing a mammoth-like animal could slow the thawing of the permafrost and thus help combat climate change. For these researchers, de-extinction is not nostalgia but a practical tool for restoring damaged ecosystems."],
      ["", "Critics, however, are unconvinced. Professor Daniel Okafor, an ecologist, warns that the money and attention devoted to resurrecting lost species would be far better spent protecting those that still survive. Conservation budgets are limited, he argues, and every dollar spent on the mammoth is a dollar not spent saving the thousands of species currently sliding towards extinction. There is also a danger, he adds, that the promise of de-extinction could weaken the will to prevent extinctions in the first place."],
      ["", "Animal-welfare campaigners raise further concerns. The process would involve many failed attempts and animals born into a world for which they are no longer suited. The ecologist Maria Vasquez questions whether it is even meaningful to call the result the same species at all, given that a revived animal would lack the learned behaviours and social environment of its ancestors. An elephant engineered to look like a mammoth, she notes, would have no other mammoths to teach it how to be one."],
      ["", "Ecological risks are perhaps the most serious objection. A species returning after thousands of years would re-enter an environment that has changed beyond recognition. It might fail to find a niche, or it might thrive too well and become a pest, much as introduced species have done across the world. For now, no extinct animal has been brought back, and societies will increasingly have to decide not simply whether de-extinction can be done, but whether it should be."],
    ],
    groups: [
      { type: "Yes/No/Not Given", kind: "ynng", instr: "Questions 27–32. Do the following statements agree with the information in the passage? Write YES, NO or NOT GIVEN.", items: [
        { id: 27, text: "Cloning is a suitable method for species that became extinct long ago.", a: "NO" },
        { id: 28, text: "A genetically engineered mammoth would be identical to the original animal.", a: "NO" },
        { id: 29, text: "The technologies used could help protect species that are still alive.", a: "YES" },
        { id: 30, text: "Reintroducing a mammoth-like animal might help reduce climate change.", a: "YES" },
        { id: 31, text: "Most scientists now agree that de-extinction should go ahead.", a: "NO" },
        { id: 32, text: "The first de-extinction attempts will focus on the passenger pigeon.", a: "NOT GIVEN" },
      ]},
      { type: "Matching features", kind: "letters", instr: "Questions 33–36. Match each statement to the correct person, A, B or C. You may use any letter more than once.",
        legend: ["A — Dr Helena Ross", "B — Professor Daniel Okafor", "C — Maria Vasquez"], letters: ["A", "B", "C"], items: [
          { id: 33, label: "De-extinction is a way of repairing harm that humans have caused.", a: "A" },
          { id: 34, label: "Money would be better spent protecting species that still exist.", a: "B" },
          { id: 35, label: "A revived animal could not truly be the same species as the original.", a: "C" },
          { id: 36, label: "The hope of reviving species might reduce efforts to prevent extinction.", a: "B" },
        ],
      },
      { type: "Summary completion", kind: "bank", instr: "Questions 37–40. Complete the summary using the list of words, A–G, below.",
        bank: [["A", "niche"], ["B", "engineering"], ["C", "pest"], ["D", "outcome"], ["E", "climate"], ["F", "relative"], ["G", "behaviour"]],
        summary: [
          "Because cloning needs living cells, the more likely method is genetic ", { id: 37, a: "B" },
          ", in which a close relative's genome is altered. Critics warn that a returning species could fail to find a ", { id: 38, a: "A" },
          ", or might multiply and become a ", { id: 39, a: "C" },
          ". Because the environment has changed so much, the final ", { id: 40, a: "D" },
          " of any attempt is very hard to predict.",
        ],
      },
    ],
  },
];

/* ============================== CONTENT: WRITING ============================== */
const WRITING = {
  task1: {
    prompt: "The graph below shows the number of visitors (in millions) to three types of tourist attraction in one country between 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
    data: [
      { year: "2000", Museums: 12, "Theme parks": 8, "Historic sites": 20 },
      { year: "2005", Museums: 14, "Theme parks": 11, "Historic sites": 18 },
      { year: "2010", Museums: 15, "Theme parks": 14, "Historic sites": 17 },
      { year: "2015", Museums: 18, "Theme parks": 16, "Historic sites": 15 },
      { year: "2020", Museums: 22, "Theme parks": 17, "Historic sites": 13 },
    ],
    model: "The line graph illustrates how many people, in millions, visited museums, theme parks and historic sites in a particular country over a twenty-year period from 2000 to 2020.\n\nOverall, visitor numbers to museums and theme parks rose steadily across the period, whereas visits to historic sites declined. By the end, museums had become the most popular of the three attractions, having started in second place.\n\nIn 2000, historic sites were by far the most visited, attracting 20 million people, compared with 12 million for museums and just 8 million for theme parks. From that point, however, the position of historic sites weakened, falling gradually to 13 million by 2020.\n\nMeanwhile, museum visits climbed consistently, reaching 22 million in 2020. Theme parks showed the sharpest early growth, more than doubling from 8 to 17 million, although their rise slowed after 2015. Thus, over two decades, the established appeal of historic sites was overtaken by both other attractions.",
  },
  task2: {
    prompt: "Some people believe that children should begin learning a foreign language as soon as they start primary school, while others think it is better to wait until they are older. Discuss both views and give your own opinion. Write at least 250 words.",
    model: "Opinions differ on the right age for children to start learning a foreign language. While some argue it should begin in the first years of primary school, others believe it is wiser to wait. In my view, although there are advantages to delaying, the benefits of an early start are stronger.\n\nThose who favour waiting make a reasonable case. Very young children are still mastering their own language, and adding a second one may, they argue, cause confusion or place too much pressure on them. Older students, moreover, can study a language more efficiently because they understand grammar consciously and can be taught through explanation rather than repetition. A teenager may therefore make faster progress in the classroom than a five-year-old.\n\nNevertheless, the arguments for starting early are, to my mind, more convincing. Research consistently shows that young children acquire accents and natural pronunciation far more easily than adults, a skill that becomes much harder to develop after a certain age. Children also tend to be unselfconscious, so they experiment and make mistakes without the fear of embarrassment that often holds older learners back. Beginning early simply gives them more years of exposure, which is the single most important factor in achieving fluency.\n\nIn conclusion, while older learners enjoy certain practical advantages and delaying is not without merit, I believe the long-term gains in pronunciation and confidence mean that children benefit most from beginning a foreign language as soon as they start school.",
  },
  criteria: [
    ["Task Response", "Answer every part of the prompt, take a clear position, and develop ideas fully with examples."],
    ["Coherence & Cohesion", "Logical paragraphs, one clear idea each, with natural linking. Don't overuse 'firstly, secondly'."],
    ["Lexical Resource", "Range of precise vocabulary and some less common words used correctly. Avoid repetition."],
    ["Grammatical Range & Accuracy", "Mix simple and complex sentences. Most sentences error-free."],
  ],
};

/* ============================== CONTENT: SPEAKING ============================== */
const SPEAKING = {
  part1: { title: "Part 1 — Introduction and interview", note: "General questions about you. Keep answers to 2–4 sentences and add a reason.", items: [
    { q: "Do you work or are you a student?", s: "I'm a postgraduate student at the moment, and I also work part time. I quite enjoy the mix, because studying keeps me curious while work keeps me grounded." },
    { q: "What do you like about the area where you live?", s: "What I appreciate most is how convenient it is. Shops, transport and a park are all within walking distance, so I rarely need to travel far for everyday things." },
    { q: "How do you usually spend your weekends?", s: "I try to balance rest and activity. I'll often read or write on a Saturday morning, then meet friends later, which helps me switch off after a busy week." },
    { q: "Has the way you use technology changed recently?", s: "Definitely. I rely far more on my phone for organising my life than I used to, from notes to reminders. It's efficient, though I do try to take screen breaks." },
  ]},
  part2: { title: "Part 2 — Long turn (cue card)", cue: "Describe a place you enjoy visiting in your free time.",
    bullets: ["what the place is", "how often you go there", "what you do there", "and explain why you enjoy visiting it"],
    prep: 60, speak: 120,
    s: "I'd like to talk about a small botanical garden near where I live, which has become my favourite escape.\n\nI go there fairly regularly, usually once a week, often on a quiet weekday morning when it isn't crowded. It only takes about fifteen minutes to walk there, which makes it easy to fit into my routine.\n\nWhen I'm there, I tend to wander slowly along the paths, sit by the pond, and sometimes bring a book or my notebook to write. There's a small glasshouse with tropical plants that I particularly like in winter.\n\nThe main reason I enjoy it is that it's calm and green in the middle of a busy city. Being surrounded by plants genuinely lowers my stress, and it gives me space to think clearly. After an hour there I always feel refreshed and ready to get back to work." },
  part3: { title: "Part 3 — Discussion", note: "More abstract questions linked to the topic. Develop each answer with reasons and examples.", items: [
    { q: "Why do you think green spaces are important in cities?", s: "I'd say they're essential for wellbeing. Cities can feel crowded and stressful, and parks give people somewhere to relax, exercise and meet others. They also help the environment by cooling the air and supporting wildlife." },
    { q: "Are people spending less time outdoors than in the past?", s: "On the whole, yes, particularly younger people, largely because so much entertainment is now on screens. That said, there's also been a growing interest in activities like hiking, so it may be balancing out somewhat." },
    { q: "How could cities encourage people to use public spaces more?", s: "A lot comes down to design and events. Well-maintained, safe spaces with seating and cafés naturally attract people, and putting on free events, like markets or concerts, gives them a reason to come and return." },
  ]},
};

/* ============================== HELPERS ============================== */
const norm = (s) => (s || "").toString().toLowerCase().replace(/[\s.'’,:-]/g, "").trim();
const matches = (v, accept) => accept.some((a) => norm(a) === norm(v));
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const isCorrect = (q, ans) => (q.accept ? matches(ans, q.accept) : ans === q.a);

/* ============================== SPEECH ENGINE ============================== */
function useSpeech() {
  const [supported] = useState(typeof window !== "undefined" && "speechSynthesis" in window);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [idx, setIdx] = useState(-1);
  const voices = useRef([]);
  const keep = useRef(null);
  useEffect(() => {
    if (!supported) return;
    const load = () => { voices.current = window.speechSynthesis.getVoices(); };
    load(); window.speechSynthesis.onvoiceschanged = load;
    return () => { try { window.speechSynthesis.cancel(); } catch (e) {} clearInterval(keep.current); };
  }, [supported]);
  const pick = () => {
    const v = voices.current;
    const gb = v.filter((x) => /en-GB/i.test(x.lang));
    const en = v.filter((x) => /^en/i.test(x.lang));
    const pool = gb.length ? gb : en.length ? en : v;
    return [pool[0] || null, pool[1] || pool[0] || null, pool[2] || pool[0] || null];
  };
  const speak = useCallback((lines, rate = 1) => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const vs = pick();
    const speakers = [...new Set(lines.map((l) => l.who))];
    setPlaying(true); setPaused(false); setIdx(-1);
    lines.forEach((l, i) => {
      const u = new SpeechSynthesisUtterance(l.t);
      u.rate = rate;
      const si = speakers.indexOf(l.who);
      u.voice = vs[si % vs.length]; u.pitch = si % 2 ? 0.92 : 1.04;
      u.onstart = () => setIdx(i);
      if (i === lines.length - 1) u.onend = () => { setPlaying(false); setIdx(-1); clearInterval(keep.current); };
      window.speechSynthesis.speak(u);
    });
    clearInterval(keep.current);
    keep.current = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) { window.speechSynthesis.pause(); window.speechSynthesis.resume(); }
    }, 9000);
  }, [supported]);
  const pause = () => { window.speechSynthesis.pause(); setPaused(true); };
  const resume = () => { window.speechSynthesis.resume(); setPaused(false); };
  const stop = () => { window.speechSynthesis.cancel(); clearInterval(keep.current); setPlaying(false); setPaused(false); setIdx(-1); };
  return { supported, playing, paused, idx, speak, pause, resume, stop };
}

/* ============================== UI PIECES ============================== */
function Timer({ minutes }) {
  const total = minutes * 60;
  const [left, setLeft] = useState(total);
  const [run, setRun] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (run) ref.current = setInterval(() => setLeft((s) => (s <= 0 ? (clearInterval(ref.current), 0) : s - 1)), 1000);
    return () => clearInterval(ref.current);
  }, [run]);
  return (
    <div className="timer">
      <span className="timer-clock" style={{ color: left <= 60 ? "var(--accent)" : "var(--ink)" }}>{fmt(left)}</span>
      <button className="ic-btn" onClick={() => setRun((r) => !r)}>{run ? <Pause size={15} /> : <Play size={15} />}</button>
      <button className="ic-btn" onClick={() => { setRun(false); setLeft(total); }}><RotateCcw size={15} /></button>
    </div>
  );
}

function Gap({ value, onChange, status, correct }) {
  return (
    <span className="gap">
      <input className={`gap-input ${status || ""}`} value={value || ""} onChange={(e) => onChange(e.target.value)} spellCheck={false} placeholder="…" />
      {status === "wrong" && <span className="gap-correct">{correct}</span>}
    </span>
  );
}

function MCQ({ q, value, onPick, checked }) {
  return (
    <div className="q-block">
      <p className="q-prompt"><span className="qn">{q.id}</span>{q.p}</p>
      <div className="choices">
        {q.o.map((opt, i) => {
          let cls = "choice";
          if (checked) { if (i === q.a) cls += " choice-right"; else if (value === i) cls += " choice-wrong"; }
          else if (value === i) cls += " choice-sel";
          return (
            <button key={i} className={cls} disabled={checked} onClick={() => onPick(i)}>
              <span className="choice-mark">{String.fromCharCode(65 + i)}</span><span>{opt}</span>
              {checked && i === q.a && <Check size={15} className="choice-ico" />}
              {checked && value === i && i !== q.a && <X size={15} className="choice-ico" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LetterRow({ id, label, letters, value, onPick, checked, a }) {
  return (
    <div className="lr">
      <p className="q-prompt"><span className="qn">{id}</span>{label}</p>
      <div className="lr-opts">
        {letters.map((L) => {
          let cls = "lp";
          if (checked) { if (L === a) cls += " lp-right"; else if (value === L) cls += " lp-wrong"; }
          else if (value === L) cls += " lp-sel";
          return <button key={L} className={cls} disabled={checked} onClick={() => onPick(L)}>{L}</button>;
        })}
        {checked && value !== a && <span className="lr-ans">Ans: {a}</span>}
      </div>
    </div>
  );
}

function Pills({ id, text, options, value, onPick, checked, a }) {
  return (
    <div className="q-block">
      <p className="q-prompt"><span className="qn">{id}</span>{text}</p>
      <div className="tfng">
        {options.map((opt) => {
          let cls = "pill";
          if (checked) { if (opt === a) cls += " pill-right"; else if (value === opt) cls += " pill-wrong"; }
          else if (value === opt) cls += " pill-sel";
          return <button key={opt} className={cls} disabled={checked} onClick={() => onPick(opt)}>{opt}</button>;
        })}
      </div>
    </div>
  );
}

function BandRuler({ band, label }) {
  return (
    <div className="ruler-wrap">
      <div className="ruler-head"><span className="ruler-label">{label}</span><span className="ruler-band">{band.toFixed(1)}</span></div>
      <div className="ruler">
        <div className="ruler-fill" style={{ width: `${(band / 9) * 100}%` }} />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="ruler-tick" style={{ left: `${(i / 9) * 100}%` }}><span>{i}</span></div>
        ))}
      </div>
    </div>
  );
}

/* ============================== RESERVE MAP (Section 2) ============================== */
function ReserveMap() {
  const dots = [
    { L: "A", x: 250, y: 282 }, { L: "H", x: 305, y: 286 }, { L: "C", x: 360, y: 268 },
    { L: "B", x: 410, y: 322 }, { L: "E", x: 285, y: 196 }, { L: "D", x: 120, y: 132 },
    { L: "F", x: 452, y: 96 }, { L: "G", x: 86, y: 70 },
  ];
  return (
    <svg viewBox="0 0 520 360" className="map-svg" role="img" aria-label="Schematic map of the nature reserve">
      <rect x="0" y="0" width="520" height="360" fill="var(--paper)" />
      {/* lake */}
      <ellipse cx="150" cy="180" rx="78" ry="48" fill="#D6E6EC" stroke="#A9C7D2" />
      <text x="150" y="184" textAnchor="middle" className="map-lbl">Lake</text>
      {/* hill */}
      <path d="M400 150 L452 70 L500 150 Z" fill="#E3E7DC" stroke="#C5CDB6" />
      <text x="452" y="140" textAnchor="middle" className="map-lbl">Hill</text>
      {/* paths */}
      <path d="M270 340 L270 150 M270 150 L120 132 M270 150 L452 96" stroke="#C9A36B" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="2 9" />
      {/* start */}
      <rect x="232" y="330" width="76" height="24" rx="4" fill="var(--ink)" />
      <text x="270" y="346" textAnchor="middle" className="map-start">START</text>
      {dots.map((d) => (
        <g key={d.L}>
          <circle cx={d.x} cy={d.y} r="13" fill="#fff" stroke="var(--accent)" strokeWidth="2" />
          <text x={d.x} y={d.y + 4} textAnchor="middle" className="map-dot">{d.L}</text>
        </g>
      ))}
    </svg>
  );
}

/* ============================== AUDIO BAR ============================== */
function AudioBar({ speech, lines, label }) {
  const [rate, setRate] = useState(1);
  const live = speech.playing;
  return (
    <div className="audio">
      <div className="audio-left">
        <div className="audio-disc"><Volume2 size={18} /></div>
        <div>
          <div className="audio-title">{label}</div>
          <div className="audio-sub">{live ? `Playing · line ${speech.idx + 1}/${lines.length}` : speech.supported ? "Ready" : "Audio unavailable in this browser"}</div>
        </div>
      </div>
      <div className="audio-ctrls">
        <div className="rate">{[0.8, 1].map((r) => <button key={r} className={`rate-btn ${rate === r ? "on" : ""}`} onClick={() => setRate(r)}>{r}×</button>)}</div>
        {!live && <button className="play-btn" disabled={!speech.supported} onClick={() => speech.speak(lines, rate)}><Play size={16} /> Play</button>}
        {live && !speech.paused && <button className="play-btn" onClick={speech.pause}><Pause size={16} /> Pause</button>}
        {live && speech.paused && <button className="play-btn" onClick={speech.resume}><Play size={16} /> Resume</button>}
        <button className="ic-btn dk" onClick={speech.stop}><Square size={15} /></button>
      </div>
    </div>
  );
}

/* ============================== LISTENING MODULE ============================== */
function flattenListening(ans) {
  const out = [];
  LISTENING.forEach((s) => {
    if (s.form) s.form.rows.forEach((r) => out.push({ id: r.id, type: s.qtype === "Form completion" ? "Form completion" : "Form completion", accept: r.accept, ok: matches(ans[r.id], r.accept) }));
    if (s.mcq) s.mcq.forEach((q) => out.push({ id: q.id, type: "Multiple choice", a: q.a, ok: ans[q.id] === q.a }));
    if (s.map) s.map.forEach((q) => out.push({ id: q.id, type: "Map labelling", a: q.a, ok: ans[q.id] === q.a }));
    if (s.match) s.match.items.forEach((q) => out.push({ id: q.id, type: "Matching", a: q.a, ok: ans[q.id] === q.a }));
    if (s.notes) s.notes.sections.forEach((sec) => sec.rows.forEach((r) => out.push({ id: r.id, type: "Note completion", accept: r.accept, ok: matches(ans[r.id], r.accept) })));
  });
  return out;
}

function ListeningModule({ onScored }) {
  const speech = useSpeech();
  const [ans, setAns] = useState({});
  const [checked, setChecked] = useState(false);
  const [script, setScript] = useState(false);
  const set = (id, v) => setAns((a) => ({ ...a, [id]: v }));

  const submit = () => {
    setChecked(true);
    const flat = flattenListening(ans);
    const raw = flat.filter((f) => f.ok).length;
    const byType = {};
    flat.forEach((f) => { byType[f.type] = byType[f.type] || { c: 0, t: 0 }; byType[f.type].t++; if (f.ok) byType[f.type].c++; });
    onScored({ raw, total: 40, band: listeningBand(raw), byType });
  };

  return (
    <div className="module">
      <header className="mod-head">
        <div>
          <p className="eyebrow"><Headphones size={13} /> Listening · 4 parts · 40 questions · plays once · ~30 min</p>
          <h2>Listening</h2>
          <p className="lead">Play each recording and answer as you listen. In the real test you hear it once and the answers come in order.</p>
        </div>
        <Timer minutes={30} />
      </header>

      {LISTENING.map((s) => (
        <section key={s.id} className="card">
          <div className="sec-bar"><h3>{s.part} — {s.title}</h3><span className="qrange">{s.qtype}</span></div>
          <p className="muted">{s.setting}</p>
          <AudioBar speech={speech} lines={s.transcript} label={`${s.part} recording`} />
          <p className="instruction">{s.instruction}</p>

          {s.form && (
            <div className="form-sheet">
              <div className="form-title">{s.form.heading}</div>
              {s.form.rows.map((r) => {
                const st = checked ? (matches(ans[r.id], r.accept) ? "right" : "wrong") : null;
                return (
                  <div key={r.id} className="form-row">
                    <span className="qn">{r.id}</span><span className="form-label">{r.label}</span>
                    <span className="form-fill">{r.pre}<Gap value={ans[r.id]} onChange={(v) => set(r.id, v)} status={st} correct={r.accept[0]} />{r.post}</span>
                  </div>
                );
              })}
            </div>
          )}

          {s.mcq && s.mcq.map((q) => <MCQ key={q.id} q={q} value={ans[q.id]} onPick={(i) => set(q.id, i)} checked={checked} />)}

          {s.map && (
            <>
              <ReserveMap />
              <p className="hint">Choose the correct letter A–H for each place.</p>
              {s.map.map((q) => <LetterRow key={q.id} id={q.id} label={q.label} letters={["A","B","C","D","E","F","G","H"]} value={ans[q.id]} onPick={(L) => set(q.id, L)} checked={checked} a={q.a} />)}
            </>
          )}

          {s.match && (
            <>
              <div className="legend">{s.match.legend.map((l) => <span key={l}>{l}</span>)}</div>
              {s.match.items.map((q) => (
                <div key={q.id} className="q-block">
                  <p className="q-prompt"><span className="qn">{q.id}</span>{q.label}</p>
                  <div className="choices row">
                    {s.match.options.map((opt, i) => {
                      let cls = "choice sm";
                      if (checked) { if (i === q.a) cls += " choice-right"; else if (ans[q.id] === i) cls += " choice-wrong"; }
                      else if (ans[q.id] === i) cls += " choice-sel";
                      return <button key={i} className={cls} disabled={checked} onClick={() => set(q.id, i)}><span className="choice-mark">{String.fromCharCode(65 + i)}</span>{opt}</button>;
                    })}
                  </div>
                </div>
              ))}
            </>
          )}

          {s.notes && (
            <div className="notes">
              {s.notes.sections.map((sec, si) => (
                <div key={si} className="note-sec">
                  <div className="note-h">{sec.h}</div>
                  {sec.rows.map((r) => {
                    const st = checked ? (matches(ans[r.id], r.accept) ? "right" : "wrong") : null;
                    return <p key={r.id} className="note-row"><span className="qn">{r.id}</span>{r.pre}<Gap value={ans[r.id]} onChange={(v) => set(r.id, v)} status={st} correct={r.accept[0]} />{r.post}</p>;
                  })}
                </div>
              ))}
            </div>
          )}
        </section>
      ))}

      <div className="action-row">
        {!checked ? <button className="primary" onClick={submit}>Check answers &amp; score</button>
          : <button className="ghost" onClick={() => { setChecked(false); setAns({}); setScript(false); }}>Reset</button>}
        <button className="ghost" onClick={() => setScript((x) => !x)}>{script ? <EyeOff size={15} /> : <Eye size={15} />} {script ? "Hide" : "Show"} transcripts</button>
      </div>

      {checked && <ScoreCard raw={flattenListening(ans).filter((f) => f.ok).length} band={listeningBand(flattenListening(ans).filter((f) => f.ok).length)} which="Listening" />}

      {script && (
        <section className="card script">
          <h3>Transcripts &amp; answer key</h3>
          {LISTENING.map((s) => (
            <div key={s.id}>
              <h4>{s.part} — {s.title}</h4>
              {s.transcript.map((l, i) => <p key={i} className="script-line"><span className="who">{l.who}:</span> {l.t}</p>)}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

/* ============================== READING MODULE ============================== */
function flattenReading(ans) {
  const out = [];
  READING.forEach((p) => p.groups.forEach((g) => {
    if (g.kind === "tfng" || g.kind === "ynng") g.items.forEach((q) => out.push({ id: q.id, type: g.type, a: q.a, ok: ans[q.id] === q.a }));
    else if (g.kind === "gap") g.items.forEach((q) => out.push({ id: q.id, type: g.type, accept: q.accept, ok: matches(ans[q.id], q.accept) }));
    else if (g.kind === "mcq") g.items.forEach((q) => out.push({ id: q.id, type: g.type, a: q.a, ok: ans[q.id] === q.a }));
    else if (g.kind === "headings") g.items.forEach((q) => out.push({ id: q.id, type: g.type, a: q.a, ok: ans[q.id] === q.a }));
    else if (g.kind === "letters") g.items.forEach((q) => out.push({ id: q.id, type: g.type, a: q.a, ok: ans[q.id] === q.a }));
    else if (g.kind === "bank") g.summary.forEach((seg) => { if (typeof seg === "object") out.push({ id: seg.id, type: g.type, a: seg.a, ok: ans[seg.id] === seg.a }); });
  }));
  return out;
}

function ReadingModule({ onScored }) {
  const [ans, setAns] = useState({});
  const [checked, setChecked] = useState(false);
  const [active, setActive] = useState(0);
  const set = (id, v) => setAns((a) => ({ ...a, [id]: v }));

  const submit = () => {
    setChecked(true);
    const flat = flattenReading(ans);
    const raw = flat.filter((f) => f.ok).length;
    const byType = {};
    flat.forEach((f) => { byType[f.type] = byType[f.type] || { c: 0, t: 0 }; byType[f.type].t++; if (f.ok) byType[f.type].c++; });
    onScored({ raw, total: 40, band: readingBand(raw), byType });
  };

  const p = READING[active];
  return (
    <div className="module">
      <header className="mod-head">
        <div>
          <p className="eyebrow"><BookOpen size={13} /> Academic Reading · 3 passages · 40 questions · 60 min</p>
          <h2>Reading</h2>
          <p className="lead">Passages get harder from 1 to 3. No extra transfer time in the real test, so watch the clock.</p>
        </div>
        <Timer minutes={60} />
      </header>

      <div className="passage-tabs">
        {READING.map((pp, i) => (
          <button key={pp.id} className={`ptab ${active === i ? "on" : ""}`} onClick={() => setActive(i)}>{pp.title} <span>· {pp.q}</span></button>
        ))}
      </div>

      <div className="read-grid">
        <article className="card passage">
          <h3>{p.heading}</h3>
          {p.paras.map((para, i) => <p key={i}>{para[0] && <span className="para-no">{para[0]}</span>}{para[1]}</p>)}
        </article>

        <div className="read-q">
          {p.groups.map((g, gi) => (
            <section key={gi} className="card">
              <div className="sec-bar"><h3>{g.type}</h3></div>
              <p className="instruction">{g.instr}</p>

              {g.headings && (
                <div className="headings-list">
                  <div className="hl-title">List of headings</div>
                  {g.headings.map((h) => <div key={h[0]} className="hl-row"><b>{h[0]}</b> {h[1]}</div>)}
                </div>
              )}
              {g.legend && <div className="legend">{g.legend.map((l) => <span key={l}>{l}</span>)}</div>}

              {(g.kind === "tfng" || g.kind === "ynng") && g.items.map((q) =>
                <Pills key={q.id} id={q.id} text={q.text} options={g.kind === "tfng" ? ["TRUE", "FALSE", "NOT GIVEN"] : ["YES", "NO", "NOT GIVEN"]} value={ans[q.id]} onPick={(o) => set(q.id, o)} checked={checked} a={q.a} />
              )}

              {g.kind === "gap" && g.items.map((q) => {
                const st = checked ? (matches(ans[q.id], q.accept) ? "right" : "wrong") : null;
                return <p key={q.id} className="q-prompt gapline"><span className="qn">{q.id}</span>{q.pre}<Gap value={ans[q.id]} onChange={(v) => set(q.id, v)} status={st} correct={q.accept[0]} />{q.post}</p>;
              })}

              {g.kind === "mcq" && g.items.map((q) => <MCQ key={q.id} q={q} value={ans[q.id]} onPick={(i) => set(q.id, i)} checked={checked} />)}

              {g.kind === "headings" && g.items.map((q) => {
                const st = checked ? (ans[q.id] === q.a ? "right" : "wrong") : "";
                return (
                  <div key={q.id} className="hsel">
                    <span className="qn">{q.id}</span><span className="hsel-label">{q.label}</span>
                    <select className={`sel ${st}`} value={ans[q.id] || ""} disabled={checked} onChange={(e) => set(q.id, e.target.value)}>
                      <option value="">— choose —</option>
                      {g.headings.map((h) => <option key={h[0]} value={h[0]}>{h[0]}</option>)}
                    </select>
                    {checked && ans[q.id] !== q.a && <span className="lr-ans">Ans: {q.a}</span>}
                  </div>
                );
              })}

              {g.kind === "letters" && g.items.map((q) =>
                <LetterRow key={q.id} id={q.id} label={q.label} letters={g.letters} value={ans[q.id]} onPick={(L) => set(q.id, L)} checked={checked} a={q.a} />
              )}

              {g.kind === "bank" && (
                <>
                  <div className="bank">{g.bank.map((b) => <span key={b[0]}><b>{b[0]}</b> {b[1]}</span>)}</div>
                  <p className="summary">
                    {g.summary.map((seg, i) => {
                      if (typeof seg === "string") return <span key={i}>{seg}</span>;
                      const st = checked ? (ans[seg.id] === seg.a ? "right" : "wrong") : "";
                      return (
                        <span key={i} className="inline-sel">
                          <b>{seg.id}</b>
                          <select className={`sel ${st}`} value={ans[seg.id] || ""} disabled={checked} onChange={(e) => set(seg.id, e.target.value)}>
                            <option value="">—</option>
                            {g.bank.map((b) => <option key={b[0]} value={b[0]}>{b[0]}</option>)}
                          </select>
                          {checked && ans[seg.id] !== seg.a && <i className="lr-ans">{seg.a}</i>}
                        </span>
                      );
                    })}
                  </p>
                </>
              )}
            </section>
          ))}
        </div>
      </div>

      <div className="action-row">
        {!checked ? <button className="primary" onClick={submit}>Check answers &amp; score</button>
          : <button className="ghost" onClick={() => { setChecked(false); setAns({}); }}>Reset</button>}
      </div>
      {checked && <ScoreCard raw={flattenReading(ans).filter((f) => f.ok).length} band={readingBand(flattenReading(ans).filter((f) => f.ok).length)} which="Reading" />}
    </div>
  );
}

function ScoreCard({ raw, band, which }) {
  return (
    <div className="verdict">
      <div className="verdict-score"><strong>{raw}</strong><span>/ 40 correct</span></div>
      <BandRuler band={band} label={`${which} band score`} />
      <p className="fine">Scored with the official {which} raw-to-band table. See the Feedback tab for a breakdown by question type.</p>
    </div>
  );
}

/* ============================== WRITING ============================== */
function WriteTask({ task, label, min, chart }) {
  const [text, setText] = useState("");
  const [show, setShow] = useState(false);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return (
    <section className="card">
      <div className="sec-bar"><h3>{label}</h3><span className="qrange">≥ {min} words</span></div>
      <p className="prompt-box">{task.prompt}</p>
      {chart && (
        <div className="chart">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={task.data} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="year" tick={{ fontSize: 12, fill: "var(--graphite)" }} />
              <YAxis tick={{ fontSize: 12, fill: "var(--graphite)" }} unit="m" />
              <Tooltip /><Legend />
              <Line type="monotone" dataKey="Museums" stroke="var(--ink)" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Theme parks" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="Historic sites" stroke="#2F8559" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="write-tools">
        <Timer minutes={chart ? 20 : 40} />
        <span className={`wc ${words >= min ? "wc-ok" : ""}`}>{words} words {words >= min ? "· length met" : `· ${min - words} to go`}</span>
      </div>
      <textarea className="writepad" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write your response here…" />
      <button className="ghost" onClick={() => setShow((x) => !x)}>{show ? <EyeOff size={15} /> : <Eye size={15} />} {show ? "Hide" : "Show"} band 9 model answer</button>
      {show && <div className="model">{task.model.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}</div>}
    </section>
  );
}

function WritingModule() {
  return (
    <div className="module">
      <header className="mod-head"><div>
        <p className="eyebrow"><PenLine size={13} /> Academic Writing · 2 tasks · 60 min</p>
        <h2>Writing</h2>
        <p className="lead">Task 1 in ~20 minutes, Task 2 in ~40. Task 2 carries twice the weight, so leave more time for it.</p>
      </div></header>
      <WriteTask task={WRITING.task1} label="Task 1 — Report (150+ words)" min={150} chart />
      <WriteTask task={WRITING.task2} label="Task 2 — Essay (250+ words)" min={250} />
      <section className="card">
        <div className="sec-bar"><h3>Mark your own writing</h3><span className="qrange">4 official criteria</span></div>
        <p className="muted">Examiners score each task on these four equally weighted criteria. Check your draft against each.</p>
        {WRITING.criteria.map((c) => <div key={c[0]} className="crit"><b>{c[0]}</b><span>{c[1]}</span></div>)}
      </section>
    </div>
  );
}

/* ============================== SPEAKING ============================== */
function Countdown({ title, seconds, accent }) {
  const [left, setLeft] = useState(seconds);
  const [run, setRun] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (run) ref.current = setInterval(() => setLeft((s) => (s <= 1 ? (clearInterval(ref.current), setRun(false), 0) : s - 1)), 1000);
    return () => clearInterval(ref.current);
  }, [run]);
  return (
    <div className="cd">
      <div><div className="cd-title">{title}</div><div className="cd-clock" style={{ color: accent ? "var(--accent)" : "var(--ink)" }}>{fmt(left)}</div></div>
      <div className="cd-btns">
        <button className="ic-btn dk2" onClick={() => setRun((r) => !r)}>{run ? <Pause size={15} /> : <Play size={15} />}</button>
        <button className="ic-btn dk2" onClick={() => { setRun(false); setLeft(seconds); }}><RotateCcw size={15} /></button>
      </div>
    </div>
  );
}

function Recorder() {
  const [st, setSt] = useState("idle");
  const [url, setUrl] = useState(null);
  const mr = useRef(null); const ch = useRef([]);
  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      ch.current = []; mr.current = new MediaRecorder(stream);
      mr.current.ondataavailable = (e) => ch.current.push(e.data);
      mr.current.onstop = () => { setUrl(URL.createObjectURL(new Blob(ch.current, { type: "audio/webm" }))); stream.getTracks().forEach((t) => t.stop()); setSt("done"); };
      mr.current.start(); setSt("rec");
    } catch (e) { setSt("blocked"); }
  };
  return (
    <div className="rec">
      {st === "idle" && <button className="rec-btn" onClick={start}><Mic size={15} /> Record yourself</button>}
      {st === "rec" && <button className="rec-btn live" onClick={() => mr.current.stop()}><Square size={14} /> Stop</button>}
      {st === "done" && <div className="rec-done"><audio controls src={url} /><button className="ghost sm" onClick={() => { setSt("idle"); setUrl(null); }}>Again</button></div>}
      {st === "blocked" && <span className="fine">Mic blocked here, use the timers and practise aloud. It works in a full browser tab.</span>}
    </div>
  );
}

function SpeakingModule() {
  const [open, setOpen] = useState({});
  const tg = (k) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  return (
    <div className="module">
      <header className="mod-head"><div>
        <p className="eyebrow"><Mic size={13} /> Speaking · 3 parts · 11–14 min</p>
        <h2>Speaking</h2>
        <p className="lead">Answer aloud and record yourself. Reveal a model answer only after you've had a go.</p>
      </div></header>

      <section className="card">
        <div className="sec-bar"><h3>{SPEAKING.part1.title}</h3><span className="qrange">4–5 min</span></div>
        <p className="muted">{SPEAKING.part1.note}</p>
        {SPEAKING.part1.items.map((it, i) => (
          <div key={i} className="q-block">
            <p className="q-prompt"><span className="qn">Q</span>{it.q}</p>
            <button className="reveal" onClick={() => tg(`a${i}`)}>{open[`a${i}`] ? <EyeOff size={14} /> : <Eye size={14} />} Sample</button>
            {open[`a${i}`] && <p className="sample">{it.s}</p>}
          </div>
        ))}
        <Recorder />
      </section>

      <section className="card cue-card">
        <div className="sec-bar"><h3>{SPEAKING.part2.title}</h3><span className="qrange">1 min prep · 2 min talk</span></div>
        <div className="cue">
          <p className="cue-main">{SPEAKING.part2.cue}</p>
          <p className="cue-sub">You should say:</p>
          <ul>{SPEAKING.part2.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
        </div>
        <div className="cd-row"><Countdown title="Preparation" seconds={SPEAKING.part2.prep} /><Countdown title="Speaking" seconds={SPEAKING.part2.speak} accent /></div>
        <Recorder />
        <button className="reveal" onClick={() => tg("p2")}>{open.p2 ? <EyeOff size={14} /> : <Eye size={14} />} Sample answer</button>
        {open.p2 && <div className="sample">{SPEAKING.part2.s.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}</div>}
      </section>

      <section className="card">
        <div className="sec-bar"><h3>{SPEAKING.part3.title}</h3><span className="qrange">4–5 min</span></div>
        <p className="muted">{SPEAKING.part3.note}</p>
        {SPEAKING.part3.items.map((it, i) => (
          <div key={i} className="q-block">
            <p className="q-prompt"><span className="qn">Q</span>{it.q}</p>
            <button className="reveal" onClick={() => tg(`b${i}`)}>{open[`b${i}`] ? <EyeOff size={14} /> : <Eye size={14} />} Sample</button>
            {open[`b${i}`] && <p className="sample">{it.s}</p>}
          </div>
        ))}
      </section>
    </div>
  );
}

/* ============================== FEEDBACK ============================== */
const TIPS = {
  "Form completion": "Watch spelling, the word limit and singular/plural, a right word spelt wrong scores zero. Answers follow the audio order.",
  "Note completion": "Predict the word type (noun, number) before it's said. Capital letters are safe and avoid punctuation traps.",
  "Multiple choice": "Listen and read for paraphrase, not matching words. Beware options that are said then corrected, that's the trap.",
  "Map labelling": "Anchor on START and track direction words: left, right, behind, beyond, opposite. Mark them as you hear them.",
  "Matching": "Read all options before listening. Answers rarely come in the same order as the options.",
  "True/False/Not Given": "FALSE means the text contradicts it; NOT GIVEN means the text is simply silent. Never use outside knowledge.",
  "Yes/No/Not Given": "This is about the writer's opinion or claim, not facts. NO = the writer would disagree.",
  "Sentence completion": "Copy the exact word from the text and check it fits the grammar. Mind the word limit.",
  "Summary completion": "Read the whole summary first for meaning, then pick words that fit both sense and grammar.",
  "Matching headings": "Find each paragraph's main idea, not one detail. Do the easy paragraphs first and eliminate used headings.",
  "Matching information": "Scan for the specific fact. A paragraph can be used more than once and some aren't used at all.",
  "Matching features": "Link each statement to the right name. One name can be used more than once, so don't assume one each.",
};

function Feedback({ results }) {
  const { listening, reading } = results;
  const done = listening || reading;
  if (!done) {
    return (
      <div className="module">
        <header className="mod-head"><div>
          <p className="eyebrow"><BarChart3 size={13} /> Feedback</p>
          <h2>Your feedback</h2>
          <p className="lead">Finish the Listening and Reading tests and hit “Check answers”. Your strengths and the exact question types to fix will appear here.</p>
        </div></header>
        <div className="card empty"><AlertCircle size={20} /><p>No scored sections yet. Go to Listening or Reading, answer, and press <b>Check answers &amp; score</b>.</p></div>
      </div>
    );
  }

  const merged = {};
  [listening, reading].forEach((r) => { if (!r) return; Object.entries(r.byType).forEach(([k, v]) => { merged[k] = merged[k] || { c: 0, t: 0 }; merged[k].c += v.c; merged[k].t += v.t; }); });
  const rows = Object.entries(merged).map(([type, v]) => ({ type, ...v, pct: Math.round((v.c / v.t) * 100) })).sort((a, b) => b.pct - a.pct);
  const strengths = rows.filter((r) => r.pct >= 75);
  const improve = rows.filter((r) => r.pct < 60);
  const mid = rows.filter((r) => r.pct >= 60 && r.pct < 75);

  const bands = [];
  if (listening) bands.push(["Listening", listening.raw, listening.band]);
  if (reading) bands.push(["Reading", reading.raw, reading.band]);
  const avg = bands.length ? Math.round((bands.reduce((s, b) => s + b[2], 0) / bands.length) * 2) / 2 : 0;

  return (
    <div className="module">
      <header className="mod-head"><div>
        <p className="eyebrow"><BarChart3 size={13} /> Feedback</p>
        <h2>Your feedback</h2>
        <p className="lead">Based on the sections you've scored. Target band for most courses is 7.0 (30/40 reading, 30/40 listening).</p>
      </div></header>

      <div className="band-cards">
        {bands.map((b) => (
          <div key={b[0]} className="band-card">
            <div className="bc-label">{b[0]}</div>
            <div className="bc-band">{b[2].toFixed(1)}</div>
            <div className="bc-raw">{b[1]}/40 correct</div>
          </div>
        ))}
        <div className="band-card hero">
          <div className="bc-label">Avg (L+R)</div>
          <div className="bc-band">{avg.toFixed(1)}</div>
          <div className="bc-raw">{avg >= 7 ? "On target" : `${(7 - avg).toFixed(1)} band to 7.0`}</div>
        </div>
      </div>

      <div className="fb-grid">
        <section className="card fb-strong">
          <div className="fb-head"><TrendingUp size={17} /><h3>Strengths</h3></div>
          {strengths.length ? strengths.map((r) => (
            <div key={r.type} className="fb-row"><span className="fb-type">{r.type}</span><span className="fb-bar"><i className="ok" style={{ width: `${r.pct}%` }} /></span><span className="fb-pct">{r.c}/{r.t}</span></div>
          )) : <p className="muted">No category above 75% yet, keep practising.</p>}
        </section>

        <section className="card fb-weak">
          <div className="fb-head"><AlertCircle size={17} /><h3>Areas to improve</h3></div>
          {improve.length ? improve.map((r) => (
            <div key={r.type} className="fb-block">
              <div className="fb-row"><span className="fb-type">{r.type}</span><span className="fb-bar"><i className="bad" style={{ width: `${Math.max(r.pct, 4)}%` }} /></span><span className="fb-pct">{r.c}/{r.t}</span></div>
              <p className="fb-tip">{TIPS[r.type]}</p>
            </div>
          )) : <p className="muted">Nothing below 60%, solid. Push the mid-range types below to lock in band 7+.</p>}
        </section>
      </div>

      {mid.length > 0 && (
        <section className="card">
          <div className="sec-bar"><h3>Almost there (60–74%)</h3></div>
          {mid.map((r) => <div key={r.type} className="fb-block"><div className="fb-row"><span className="fb-type">{r.type}</span><span className="fb-bar"><i className="mid" style={{ width: `${r.pct}%` }} /></span><span className="fb-pct">{r.c}/{r.t}</span></div><p className="fb-tip">{TIPS[r.type]}</p></div>)}
        </section>
      )}

      <section className="card">
        <div className="sec-bar"><h3>Writing &amp; Speaking</h3></div>
        <p className="muted">These aren't auto-scored. Use the model answers and the four criteria in each tab, or get an examiner / teacher to mark a few. Quick self-checks: Did I answer every part? Are paragraphs one-idea each? Did I use varied, accurate grammar? Did I speak for the full 2 minutes in Part 2 without long pauses?</p>
      </section>
    </div>
  );
}

/* ============================== APP ============================== */
const TABS = [
  { id: "listening", label: "Listening", icon: Headphones },
  { id: "reading", label: "Reading", icon: BookOpen },
  { id: "writing", label: "Writing", icon: PenLine },
  { id: "speaking", label: "Speaking", icon: Mic },
  { id: "feedback", label: "Feedback", icon: BarChart3 },
];

export default function App() {
  const [tab, setTab] = useState("listening");
  const [results, setResults] = useState(() => loadLS("bandlab_results", { listening: null, reading: null }));
  const [dark, setDark] = useState(() => loadLS("bandlab_theme", false));
  useEffect(() => { saveLS("bandlab_results", results); }, [results]);
  useEffect(() => { saveLS("bandlab_theme", dark); }, [dark]);
  return (
    <div className={`root ${dark ? "dark" : ""}`}>
      <style>{CSS}</style>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><Gauge size={18} /></div>
          <div><div className="brand-name">Band Lab</div><div className="brand-tag">IELTS Academic · full official format</div></div>
        </div>
        <div className="top-right">
          <div className="band-strip">{[0,1,2,3,4,5,6,7,8,9].map((n) => <span key={n} className="band-tick">{n}</span>)}</div>
          <button className="theme-btn" onClick={() => setDark((d) => !d)} title="Toggle dark mode" aria-label="Toggle dark mode">{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
        </div>
      </header>

      <nav className="tabs">
        {TABS.map((t) => {
          const I = t.icon;
          const flag = (t.id === "feedback") && (results.listening || results.reading);
          return (
            <button key={t.id} className={`tab ${tab === t.id ? "tab-on" : ""}`} onClick={() => setTab(t.id)}>
              <I size={16} /> {t.label}{flag && <span className="dot" />}
              {tab === t.id && <ChevronRight size={14} className="tab-chev" />}
            </button>
          );
        })}
      </nav>

      <main className="main">
        {tab === "listening" && <ListeningModule onScored={(r) => setResults((p) => ({ ...p, listening: r }))} />}
        {tab === "reading" && <ReadingModule onScored={(r) => setResults((p) => ({ ...p, reading: r }))} />}
        {tab === "writing" && <WritingModule />}
        {tab === "speaking" && <SpeakingModule />}
        {tab === "feedback" && <Feedback results={results} />}
      </main>

      <footer className="foot">Original practice material built to the official IELTS Academic format (40 listening + 40 reading questions, scored on the published raw-to-band tables). Not affiliated with the IELTS partners.</footer>
    </div>
  );
}

/* ============================== STYLES ============================== */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
:root{--paper:#F6F7F9;--card:#FFFFFF;--ink:#16202E;--graphite:#5A6473;--accent:#E14434;--accent-soft:#FCEAE7;--green:#2F8559;--green-soft:#E6F2EB;--line:#E6E8EC;--line2:#EEF0F3;--serif:'Fraunces',Georgia,serif;--sans:'Inter',system-ui,sans-serif;--mono:'JetBrains Mono',monospace}
.top-right{display:flex;align-items:center;gap:10px}
.theme-btn{background:#2B3848;border:none;color:#fff;width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.theme-btn:hover{background:#37485B}
.root.dark{--paper:#0E141B;--card:#161D26;--ink:#E7ECF1;--graphite:#94A2B0;--line:#26303B;--line2:#1C242E;--accent-soft:#3A211E;--green-soft:#15281E;--soft:#161D26}
.root.dark .passage p,.root.dark .hl-row{color:#C5CFD9}
.root.dark .instruction,.root.dark .prompt-box,.root.dark .chart,.root.dark .headings-list,.root.dark .bank,.root.dark .legend,.root.dark .model,.root.dark .sample,.root.dark .verdict,.root.dark .notes,.root.dark .form-sheet,.root.dark .band-card,.root.dark .cd,.root.dark .empty{background:var(--card)}
.root.dark .choice,.root.dark .ptab,.root.dark .pill,.root.dark .lp,.root.dark .sel,.root.dark .writepad,.root.dark .ghost,.root.dark .timer,.root.dark .reveal,.root.dark .form-row:nth-child(even){background:var(--card);color:var(--ink)}
.root.dark .gap-input{color:var(--ink)}
.root.dark .choice-mark,.root.dark .qrange,.root.dark .wc{background:var(--line2);color:var(--graphite)}
*{box-sizing:border-box}
.root{font-family:var(--sans);background:var(--paper);color:var(--ink);min-height:100vh;line-height:1.55;-webkit-font-smoothing:antialiased}
.root button{font-family:inherit;cursor:pointer}
.topbar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:15px 22px;background:var(--ink);color:#fff;flex-wrap:wrap}
.brand{display:flex;align-items:center;gap:12px}
.brand-mark{width:38px;height:38px;border-radius:9px;background:var(--accent);display:flex;align-items:center;justify-content:center}
.brand-name{font-family:var(--serif);font-size:20px;font-weight:600}
.brand-tag{font-size:12px;color:#A9B2BF}
.band-strip{display:flex;border:1px solid #2B3848;border-radius:7px;overflow:hidden}
.band-tick{font-family:var(--mono);font-size:11px;color:#8A95A3;padding:5px 9px;border-right:1px solid #2B3848}
.band-tick:last-child{border-right:none;color:var(--accent)}
.tabs{display:flex;gap:4px;padding:10px 18px 0;background:var(--paper);border-bottom:1px solid var(--line);position:sticky;top:0;z-index:20;flex-wrap:wrap}
.tab{display:flex;align-items:center;gap:7px;background:transparent;border:1px solid transparent;border-bottom:none;padding:10px 15px;border-radius:9px 9px 0 0;color:var(--graphite);font-size:14px;font-weight:500;position:relative;top:1px}
.tab:hover{color:var(--ink)}
.tab-on{background:var(--card);border-color:var(--line);color:var(--ink)}
.tab-chev{opacity:.5}
.dot{width:7px;height:7px;border-radius:50%;background:var(--accent)}
.main{max-width:1080px;margin:0 auto;padding:24px 18px 10px}
.module{display:flex;flex-direction:column;gap:18px}
.mod-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap}
.eyebrow{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:var(--accent);margin:0 0 6px}
.mod-head h2{font-family:var(--serif);font-size:30px;font-weight:600;margin:0;letter-spacing:-.5px}
.lead{color:var(--graphite);margin:6px 0 0;max-width:60ch;font-size:14.5px}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px 22px}
.sec-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:4px}
.card h3{font-family:var(--serif);font-size:18px;font-weight:600;margin:0}
.qrange{font-family:var(--mono);font-size:11px;color:var(--graphite);background:var(--line2);padding:4px 9px;border-radius:6px;white-space:nowrap}
.muted{color:var(--graphite);font-size:13.5px;margin:2px 0 14px}
.hint{font-size:12.5px;color:var(--graphite);margin:10px 0}
.instruction{font-size:13px;font-style:italic;background:var(--line2);border-left:3px solid var(--accent);padding:9px 12px;border-radius:0 7px 7px 0;margin:14px 0}
.timer{display:flex;align-items:center;gap:8px;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:7px 10px}
.timer-clock{font-family:var(--mono);font-size:18px;font-weight:600;min-width:60px;text-align:center}
.ic-btn{background:var(--line2);border:none;border-radius:7px;width:30px;height:30px;display:flex;align-items:center;justify-content:center;color:var(--ink)}
.ic-btn:hover{background:#E2E5EA}.ic-btn.dk{background:#2B3848;color:#fff}.ic-btn.dk2{background:#fff;color:var(--ink)}
.audio{display:flex;align-items:center;justify-content:space-between;gap:14px;background:var(--ink);color:#fff;border-radius:12px;padding:12px 16px;flex-wrap:wrap;margin:8px 0}
.audio-left{display:flex;align-items:center;gap:12px}
.audio-disc{width:40px;height:40px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.audio-title{font-weight:600;font-size:14px}.audio-sub{font-size:12px;color:#A9B2BF;font-family:var(--mono)}
.audio-ctrls{display:flex;align-items:center;gap:8px}
.rate{display:flex;background:#0F1722;border-radius:7px;overflow:hidden}
.rate-btn{background:transparent;border:none;color:#8A95A3;font-family:var(--mono);font-size:12px;padding:7px 9px}
.rate-btn.on{background:var(--accent);color:#fff}
.play-btn{display:flex;align-items:center;gap:7px;background:#fff;color:var(--ink);border:none;border-radius:8px;padding:8px 14px;font-weight:600;font-size:13.5px}
.play-btn:disabled{opacity:.45;cursor:not-allowed}
.form-sheet{border:1px solid var(--line);border-radius:11px;overflow:hidden}
.form-title{background:var(--ink);color:#fff;font-family:var(--mono);font-size:12px;letter-spacing:.5px;padding:10px 14px}
.form-row{display:grid;grid-template-columns:32px 1.1fr 1fr;align-items:center;gap:10px;padding:11px 14px;border-bottom:1px solid var(--line2)}
.form-row:last-child{border-bottom:none}.form-row:nth-child(even){background:var(--paper)}
.form-label{font-size:13.5px;color:var(--graphite)}.form-fill{font-size:14px}
.qn{font-family:var(--mono);font-size:12px;font-weight:600;color:#fff;background:var(--ink);min-width:24px;height:24px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;padding:0 5px}
.gap{display:inline-flex;align-items:center;gap:6px;vertical-align:middle}
.gap-input{font-family:var(--sans);font-size:14px;border:none;border-bottom:2px solid var(--ink);background:transparent;padding:2px 6px;min-width:92px;max-width:150px;color:var(--ink);outline:none}
.gap-input:focus{border-color:var(--accent)}
.gap-input.right{border-color:var(--green);color:var(--green);font-weight:600}
.gap-input.wrong{border-color:var(--accent);color:var(--accent);text-decoration:line-through}
.gap-correct{font-size:12.5px;color:var(--green);font-weight:600;background:var(--green-soft);padding:1px 7px;border-radius:5px}
.q-block{padding:14px 0;border-bottom:1px solid var(--line2)}.q-block:last-child{border-bottom:none}
.q-prompt{font-size:14.5px;margin:0 0 10px;display:flex;flex-wrap:wrap;align-items:baseline;gap:8px;line-height:1.65}
.gapline{padding:12px 0;border-bottom:1px solid var(--line2)}
.choices{display:flex;flex-direction:column;gap:8px}.choices.row{flex-direction:row;flex-wrap:wrap}
.choice{display:flex;align-items:center;gap:11px;text-align:left;background:var(--card);border:1px solid var(--line);border-radius:9px;padding:11px 13px;font-size:14px;color:var(--ink)}
.choice.sm{padding:9px 12px;gap:8px}
.choice:hover:not(:disabled){border-color:var(--ink)}
.choice-mark{font-family:var(--mono);font-size:12px;font-weight:600;width:24px;height:24px;border-radius:6px;background:var(--line2);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--graphite)}
.choice-sel{border-color:var(--ink);background:var(--paper)}.choice-sel .choice-mark{background:var(--ink);color:#fff}
.choice-right{border-color:var(--green);background:var(--green-soft)}.choice-right .choice-mark{background:var(--green);color:#fff}
.choice-wrong{border-color:var(--accent);background:var(--accent-soft)}
.choice-ico{margin-left:auto}.choice-right .choice-ico{color:var(--green)}.choice-wrong .choice-ico{color:var(--accent)}
.tfng{display:flex;gap:8px;flex-wrap:wrap}
.pill{font-family:var(--mono);font-size:12px;font-weight:600;border:1px solid var(--line);background:var(--card);border-radius:8px;padding:9px 14px;color:var(--graphite)}
.pill:hover:not(:disabled){border-color:var(--ink);color:var(--ink)}
.pill-sel{background:var(--ink);color:#fff;border-color:var(--ink)}
.pill-right{background:var(--green);color:#fff;border-color:var(--green)}
.pill-wrong{background:var(--accent-soft);color:var(--accent);border-color:var(--accent)}
.lr{padding:12px 0;border-bottom:1px solid var(--line2)}
.lr-opts{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin-top:8px}
.lp{font-family:var(--mono);font-weight:600;width:34px;height:34px;border-radius:8px;border:1px solid var(--line);background:#fff;color:var(--graphite)}
.lp:hover:not(:disabled){border-color:var(--ink);color:var(--ink)}
.lp-sel{background:var(--ink);color:#fff;border-color:var(--ink)}
.lp-right{background:var(--green);color:#fff;border-color:var(--green)}
.lp-wrong{background:var(--accent-soft);color:var(--accent);border-color:var(--accent)}
.lr-ans{font-size:12px;color:var(--green);font-weight:600;background:var(--green-soft);padding:3px 8px;border-radius:5px;font-style:normal}
.legend{display:flex;gap:14px;flex-wrap:wrap;background:var(--paper);border:1px solid var(--line);border-radius:9px;padding:10px 14px;margin:10px 0;font-size:13px;font-weight:500}
.notes{border:1px solid var(--line);border-radius:11px;padding:6px 16px 14px}
.note-sec{padding:10px 0;border-bottom:1px dashed var(--line)}.note-sec:last-child{border-bottom:none}
.note-h{font-family:var(--mono);font-size:11px;text-transform:uppercase;letter-spacing:.8px;color:var(--accent);margin:6px 0 8px}
.note-row{font-size:14px;display:flex;flex-wrap:wrap;align-items:baseline;gap:7px;margin:7px 0}
.map-svg{width:100%;max-width:520px;display:block;margin:6px auto;border:1px solid var(--line);border-radius:11px;background:var(--paper)}
.map-lbl{font-family:var(--sans);font-size:11px;fill:var(--graphite)}
.map-dot{font-family:var(--mono);font-size:12px;font-weight:600;fill:var(--accent)}
.map-start{font-family:var(--mono);font-size:11px;font-weight:600;fill:#fff}
.passage-tabs{display:flex;gap:8px;flex-wrap:wrap}
.ptab{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:9px 14px;font-size:13.5px;font-weight:500;color:var(--graphite)}
.ptab span{font-family:var(--mono);font-size:11px;opacity:.7}
.ptab.on{background:var(--ink);color:#fff;border-color:var(--ink)}.ptab.on span{color:#A9B2BF}
.read-grid{display:grid;grid-template-columns:1.05fr 1fr;gap:18px;align-items:start}
.passage{position:sticky;top:70px;max-height:calc(100vh - 90px);overflow:auto}
.passage h3{margin-bottom:12px;font-size:19px}
.passage p{font-size:14.5px;line-height:1.72;margin:0 0 14px;color:#26313F}
.para-no{font-family:var(--mono);font-size:11px;font-weight:600;color:#fff;background:var(--graphite);width:20px;height:20px;border-radius:5px;display:inline-flex;align-items:center;justify-content:center;margin-right:9px;vertical-align:1px}
.read-q{display:flex;flex-direction:column;gap:18px}
.headings-list{background:var(--paper);border:1px solid var(--line);border-radius:9px;padding:12px 14px;margin:10px 0;font-size:13px}
.hl-title{font-weight:600;margin-bottom:6px}.hl-row{padding:2px 0;color:#33404F}.hl-row b{font-family:var(--mono);margin-right:6px}
.hsel{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--line2);flex-wrap:wrap}
.hsel-label{font-size:14px;flex:1;min-width:120px}
.sel{font-family:var(--mono);font-size:13px;border:1px solid var(--ink);border-radius:7px;padding:6px 8px;background:#fff;color:var(--ink)}
.sel.right{border-color:var(--green);color:var(--green);background:var(--green-soft)}
.sel.wrong{border-color:var(--accent);color:var(--accent);background:var(--accent-soft)}
.bank{display:flex;gap:10px;flex-wrap:wrap;background:var(--paper);border:1px solid var(--line);border-radius:9px;padding:10px 14px;margin:10px 0;font-size:13px}
.bank b{font-family:var(--mono);color:var(--accent);margin-right:3px}
.summary{font-size:14.5px;line-height:2.1}
.inline-sel{display:inline-flex;align-items:center;gap:3px;margin:0 2px}
.inline-sel b{font-family:var(--mono);font-size:11px;color:var(--graphite)}
.inline-sel .lr-ans{padding:1px 6px}
.action-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.primary{background:var(--accent);color:#fff;border:none;border-radius:10px;padding:12px 22px;font-weight:600;font-size:14.5px}
.primary:hover{background:#C9392B}
.ghost{display:inline-flex;align-items:center;gap:7px;background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:11px 16px;font-weight:500;font-size:14px}
.ghost:hover{border-color:var(--ink)}.ghost.sm{padding:8px 12px;font-size:13px}
.verdict{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px 22px}
.verdict-score{display:flex;align-items:baseline;gap:10px;margin-bottom:16px}
.verdict-score strong{font-family:var(--serif);font-size:34px;color:var(--accent)}.verdict-score span{color:var(--graphite);font-size:14px}
.fine{font-size:12px;color:var(--graphite);margin:10px 0 0}
.ruler-head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:8px}
.ruler-label{font-size:12px;color:var(--graphite);text-transform:uppercase;letter-spacing:.6px;font-weight:600}
.ruler-band{font-family:var(--serif);font-size:24px;font-weight:600}
.ruler{position:relative;height:10px;background:var(--line2);border-radius:6px;margin-bottom:18px}
.ruler-fill{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,var(--ink),var(--accent));border-radius:6px}
.ruler-tick{position:absolute;top:14px;transform:translateX(-50%)}.ruler-tick span{font-family:var(--mono);font-size:10px;color:var(--graphite)}
.script h4{font-family:var(--serif);font-size:15px;margin:16px 0 8px}
.script-line{font-size:13.5px;margin:0 0 6px;color:#2A3543}.who{font-weight:600;color:var(--accent)}
.prompt-box{font-size:14.5px;background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:14px 16px;margin:6px 0 14px;line-height:1.65}
.chart{background:var(--paper);border:1px solid var(--line);border-radius:10px;padding:14px 8px 6px;margin-bottom:14px}
.write-tools{display:flex;align-items:center;gap:12px;margin-bottom:10px;flex-wrap:wrap}
.wc{font-family:var(--mono);font-size:12px;color:var(--graphite);background:var(--line2);padding:6px 11px;border-radius:7px}.wc-ok{background:var(--green-soft);color:var(--green)}
.writepad{width:100%;min-height:200px;border:1px solid var(--line);border-radius:10px;padding:14px;font-family:var(--sans);font-size:14.5px;line-height:1.7;resize:vertical;color:var(--ink);outline:none;margin-bottom:12px}
.writepad:focus{border-color:var(--ink)}
.model{background:var(--paper);border:1px solid var(--line);border-left:3px solid var(--green);border-radius:0 10px 10px 0;padding:14px 16px;margin-top:10px}
.model p{font-size:14px;line-height:1.7;margin:0 0 12px}.model p:last-child{margin:0}
.crit{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid var(--line2)}.crit:last-child{border-bottom:none}
.crit b{font-family:var(--serif);font-size:14px;min-width:200px}.crit span{font-size:13.5px;color:var(--graphite)}
.reveal{display:inline-flex;align-items:center;gap:6px;background:transparent;border:1px dashed var(--line);border-radius:8px;padding:7px 12px;font-size:13px;color:var(--graphite)}
.reveal:hover{border-color:var(--ink);color:var(--ink)}
.sample{background:var(--paper);border:1px solid var(--line);border-left:3px solid var(--ink);border-radius:0 10px 10px 0;padding:13px 15px;margin-top:10px;font-size:14px;line-height:1.7}
.sample p{margin:0 0 10px}.sample p:last-child{margin:0}
.cue-card{background:#FFFCFB}
.cue{background:var(--ink);color:#fff;border-radius:12px;padding:18px 20px;margin:6px 0 16px}
.cue-main{font-family:var(--serif);font-size:20px;font-weight:600;margin:0 0 12px}
.cue-sub{font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#A9B2BF;margin:0 0 6px}
.cue ul{margin:0;padding-left:18px}.cue li{font-size:14px;margin:4px 0;color:#E4E8ED}
.cd-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
.cd{display:flex;align-items:center;justify-content:space-between;background:var(--ink);color:#fff;border-radius:11px;padding:13px 16px}
.cd-title{font-size:12px;text-transform:uppercase;letter-spacing:.6px;color:#A9B2BF;font-weight:600}
.cd-clock{font-family:var(--mono);font-size:26px;font-weight:600;color:#fff}
.cd-btns{display:flex;gap:7px}
.rec{margin-top:14px}
.rec-btn{display:inline-flex;align-items:center;gap:8px;background:var(--ink);color:#fff;border:none;border-radius:10px;padding:10px 16px;font-weight:600;font-size:13.5px}
.rec-btn.live{background:var(--accent);animation:pulse 1.4s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.72}}
.rec-done{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.rec-done audio{height:38px}
.empty{display:flex;align-items:center;gap:12px;color:var(--graphite);font-size:14px}
.band-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px}
.band-card{background:var(--card);border:1px solid var(--line);border-radius:13px;padding:16px 18px}
.band-card.hero{background:var(--ink);color:#fff;border-color:var(--ink)}
.bc-label{font-size:12px;text-transform:uppercase;letter-spacing:.6px;color:var(--graphite);font-weight:600}
.band-card.hero .bc-label{color:#A9B2BF}
.bc-band{font-family:var(--serif);font-size:40px;font-weight:600;line-height:1.1;margin:4px 0}
.band-card.hero .bc-band{color:#fff}.band-card:not(.hero) .bc-band{color:var(--accent)}
.bc-raw{font-size:12.5px;color:var(--graphite)}.band-card.hero .bc-raw{color:#A9B2BF}
.fb-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.fb-head{display:flex;align-items:center;gap:8px;margin-bottom:6px}.fb-head h3{font-family:var(--serif);font-size:17px;margin:0}
.fb-strong .fb-head{color:var(--green)}.fb-weak .fb-head{color:var(--accent)}
.fb-row{display:flex;align-items:center;gap:10px;padding:7px 0}
.fb-type{font-size:13px;min-width:130px}
.fb-bar{flex:1;height:8px;background:var(--line2);border-radius:5px;overflow:hidden}
.fb-bar i{display:block;height:100%;border-radius:5px}.fb-bar i.ok{background:var(--green)}.fb-bar i.bad{background:var(--accent)}.fb-bar i.mid{background:#E0A33B}
.fb-pct{font-family:var(--mono);font-size:12px;color:var(--graphite);min-width:36px;text-align:right}
.fb-block{padding:6px 0;border-bottom:1px solid var(--line2)}.fb-block:last-child{border-bottom:none}
.fb-tip{font-size:12.5px;color:var(--graphite);margin:2px 0 8px;line-height:1.5}
.foot{max-width:1080px;margin:18px auto 0;padding:18px;font-size:12px;color:var(--graphite);text-align:center;border-top:1px solid var(--line)}
@media (max-width:860px){.read-grid{grid-template-columns:1fr}.passage{position:static;max-height:none}.fb-grid{grid-template-columns:1fr}.cd-row{grid-template-columns:1fr}.mod-head h2{font-size:26px}.band-strip{display:none}.form-row{grid-template-columns:28px 1fr;row-gap:4px}.form-fill{grid-column:2}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
`;
