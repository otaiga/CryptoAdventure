export const rawJson = {
  intro: {
    sectionKey: "intro",
    image: "bafkreieppsblsbjfepc74nti23gtxgioaymn2zbw3tk662lzgcl7ydnpb4",
    p: [
      "You jerk violently awake! Alarms are all you can hear.\n        Gathering your thoughts after brutally being brought back to consciousness from what seemed like an eternity of sleep.\n        You remember you are on board the Moralis. A large cargo ship where you are part of the crew, carrying fuel and supplies for a remote mining colony in some distant crap hole star system.\n        But something is wrong, very wrong.\n        The alarms are excruciating, tearing into your skull.\n        You try to crane your neck to see outside your pod but the red flashing lights are all that fill your vision.. and maybe a flicker of flame?\n        Something shoves your cryochamber and you hit the floor hard.\n        You hear the screen of your pod crack and you frantically fumble with the controls to get the pod to open!",
    ],
    audio: [
      {
        type: "MP3",
        audio: "bafkreihebq4fe27oiuj6xnpwkdzqflpycwknivs2yemmf4iycg7rkpm2gq",
      },
    ],
    options: { continue: "Crawl out of pod" },
  },
  "Crawl out of pod": {
    sectionKey: "Crawl out of pod",
    p: [
      "You look around. Many pods are already on the floor, some are on fire. Your crew members are still in there!\n    Another tremor violently shakes the ship. The noise of the alarm, the fire and all the confusion melts away as you see the wall suddenly rip open as an asteroid breaks through, your crew members pods explode as the asteroid crashes into them.\n    The asteroid hits and the hole it made starts to suck everything into space",
    ],
    image: "bafkreiayf74ilkdblofb7tiwlctd3gnaeffbhnzkdgdod3v2zxt76pltbi",
    audio: [
      {
        type: "MP3",
        audio: "bafkreignqm62ukudc67akquxzdg42hvtc42ggwqiiozuxnxrqx5jxh5ydq",
      },
    ],
    options: { continue: "breach" },
  },
  breach: {
    sectionKey: "breach",
    image: "bafkreihjjq7urrqx5rob6eqfqtqgl2fkgzkpihtfqcc74p5sl5atlrh2fy",
    p: [
      "The hole in the wall caused by the asteroid tears wider, and the air pressure rapidly drops. You are pulled towards the blackness of space.\n      You are suddenly dragged across the floor with tremendous force.\n      Looking around as you get pulled towards your imminent death, you see a network of pipes exposed above the metal grated floor",
    ],
    audio: [
      {
        type: "MP3",
        audio: "bafkreiab7oo62ia4l2nn5jkywdh5b6hyymnxqrogno2ujofako2rsmkkuq",
      },
    ],
    options: {
      "grab onto pipe": "grab pipe",
      "look around for other options": "other options",
    },
  },
  "grab pipe": {
    sectionKey: "grab pipe",
    p: [
      "You grab the pipe and look around\n      The piping follows the room and leads to the exit where you can hopefully get out and seal the door closed\n      You also notice the piping leads around the other way and passes an open pod, you can see one of your crew in there struggling to get out",
    ],
    audio: [
      {
        type: "MP3",
        audio: "bafkreigdzlxvatvv2cq4ssu5afb2wpp4t3dn5buuo6i2ocarf5qv2f7k7y",
      },
    ],
    image: "bafkreihkbdzbo26obfcqsmwsbh52sauc5yohz3mfcszb6kwy32dmjxwddq",
    options: {
      "Head straight to exit": "straight to exit",
      "Help save your crew member": "save crew member",
    },
    collectable: "6",
  },
  "other options": {
    sectionKey: "other options",
    image: "bafkreicpk2rk4z7w2gyfkndxyij7xe4sbbdmueawqoduo7ydhgrq3kvxbu",
    p: [
      "You look franticly around and see nothing.\n        You realise that this is it. You are going to be sucked out into the cold blackness of space.\n        Just before you pass through the point of no return, a hand grabs your arm and pulls you back from the brink of certain death. \n        Looking down you see your crew member, Saul, half hanging out of his cryo pod.",
    ],
    audio: [
      {
        type: "MP3",
        audio: "bafkreib6p5iuq5v3bjjtq64ggauwyvoputledknkyv2pmsrspy2yqi3eaa",
      },
    ],
    options: { continue: "exit together" },
  },
  "exit together": {
    sectionKey: "exit together",
    p: [
      "Both of you hang onto the nearest pipe as tight as possible as the vacuum of space tries to claim you. \n      Slowly you make your way to the exit, following the path of the pipe that luckily goes past the sealed door to salvation.\n      Pulling yourself onward with every ounce of strength to gain critical inches towards safety\n      Reaching the exit, you notice the control panel next to the door.\n      It needs a security code!",
    ],
    audio: [
      {
        type: "MP3",
        audio: "bafkreifl3ciomprx2iuoqkbkda6awit2ck2adaxh2ctu6cchtzrmoo7ihy",
      },
    ],
    image: "bafkreihbarmow5772fywyrnkksasocnlmh6bm5uunjbzxi2xpkefmuocl4",
    options: { continue: "security code" },
    actions: { together: "true" },
  },
  "save crew member": {
    sectionKey: "save crew member",
    p: [
      "You make your way to your crew member, in the opposite direction to the exit.\n      Holding onto the pipe so not to lose grip and get sucked out into oblivion.\n      You make your way to the cryo pod and realise it's Saul, the med tech on the team.\n      He's trying to get free of the wreckage of his pod",
    ],
    image: "bafkreihkbdzbo26obfcqsmwsbh52sauc5yohz3mfcszb6kwy32dmjxwddq",
    audio: [
      {
        type: "MP3",
        audio: "bafkreif4urdx25havymkykw3bvhdqpsjwlssucazdujf2two5q2orh4che",
      },
    ],
    options: {
      "Help Saul": "help Saul",
      "Head back to the exit": "straight to exit",
    },
  },
  "help Saul": {
    sectionKey: "help Saul",
    image: "bafkreicpk2rk4z7w2gyfkndxyij7xe4sbbdmueawqoduo7ydhgrq3kvxbu",
    p: [
      'You offer a hand to Saul and as he looks up, you see the gratitude and relief in his face\n      You manage to get his body free of the wreckage just as the pod scrapes away to the  hole and is lost to the blackness.\n      Saul says "thanks!, where are the others?"\n      You both look around and immediately realise you are the only two left on the ship!\n      You both look towards the exit and know time is against you.',
    ],
    audio: [
      {
        type: "MP3",
        audio: "bafkreigeb543zigq3k2hr2rnztrzcpnwzj4xo7rwdcmgiaosvhbwm7xy64",
      },
    ],
    options: { continue: "exit together" },
  },
  "straight to exit": {
    sectionKey: "straight to exit",
    image: "bafkreihbarmow5772fywyrnkksasocnlmh6bm5uunjbzxi2xpkefmuocl4",
    p: [
      "You decide to head for the exit and start pulling your way clinging on with all that you can muster.\n      You try to block out the cries for help from your crew member and over the whistling gusts of air.\n      Reaching the exit, you notice the control panel next to the door.\n      It needs a security code!",
    ],
    audio: [
      {
        type: "MP3",
        audio: "bafkreig4evs4see5cwmgy4jvslzama7gqcp5kgtxojevgswokvrlqoynyu",
      },
    ],
    options: { continue: "security code" },
  },
  "security code": {
    sectionKey: "security code",
    image: "bafkreihbarmow5772fywyrnkksasocnlmh6bm5uunjbzxi2xpkefmuocl4",
    p: [
      "You try to remember the code, but it's all too much, your nerves are shot and your stress levels are blown beyond reasonable levels!\n      You realise the longer you take, the less chance you have of surviving as all the breathable air is sucked out. The hole is getting wider and soon the room will be torn to nothing!\n      What is that code?!",
      {
        type: "Condition",
        rule: "equals",
        var: "together",
        true: 'Saul instantly shouts out "It\'s 2112!"',
        false: "Was it 2112 or maybe, 2212?",
      },
    ],
    options: { "2112": "code 2112", "2212": "code 2212" },
    audio: [
      {
        type: "MP3",
        audio: "bafkreihvgvbb7mpsicz6vd5jtlxtpsqosb2qa3yyge2kpnej5t5nphutlm",
      },
      {
        type: "Condition",
        rule: "equals",
        var: "together",
        true: "bafkreifcdo3bibeujfuhisoj7gzzkvwotdslryiqnkntqds7mls23nlmem",
        false: "bafkreigzetd2ivxe6a3etzcnwcjks2zjuqjwm6wvm76ld2kxcc5gvpr56q",
      },
    ],
  },
  "code 2212": {
    image: "bafkreihbarmow5772fywyrnkksasocnlmh6bm5uunjbzxi2xpkefmuocl4",
    sectionKey: "code 2212",
    p: [
      "You punch the numbers in and hear the negative sound from the console speaker as the indication light flashes red.\n      The door doesn't move.\n      Damn it!, you hammer on the door in frustration.\n      The walls are starting to tear away to nothingness.\n      It just might be 2112! or maybe 1122?",
    ],
    audio: [
      {
        type: "MP3",
        audio: "bafkreibtsrf7t7xnneuv5ibqsin333vcna3ilxussy2kb7v6enzk3gh6ym",
      },
    ],
    options: { "1122": "code 1122", "2112": "code 2112" },
  },
  "code 1122": {
    image: "bafkreihbarmow5772fywyrnkksasocnlmh6bm5uunjbzxi2xpkefmuocl4",
    sectionKey: "code 1122",
    p: [
      "You quickly punch the numbers in and again you are instantly dismayed as the red light mocks you and you hear the negative sound\n      Aaahh! you scream in desperation and hammer the correct numbers",
    ],
    audio: [
      {
        type: "MP3",
        audio: "bafkreihjnp6ig2u7pntrnhxvtv4n4kvgezzwogas5kzyrhlpcsxmul3fgu",
      },
    ],
    options: { "2112": "code 2112" },
  },
  "code 2112": {
    sectionKey: "code 2112",
    image: "bafkreib6gqqe37cbscmfoyegsgg4bdxridfn5ynwhq3gielycebqyk7pme",
    audio: [
      {
        type: "MP3",
        audio: "bafkreigfm2fxscsnhnv7lrfrwf5gnk6xcacpvmwd3u4xdixlczapl3nh7e",
      },
      {
        type: "Condition",
        rule: "equals",
        var: "together",
        true: "bafkreifxb56fplpsqo6etkas3ttydyjitb7ri5amm7xvz2d3bpxxjgaz5q",
        false: "bafkreicedsrio557nitgwttmzwm7ha56dfuwitm2qqxa5tcnm6frczfbfm",
      },
      {
        type: "MP3",
        audio: "bafkreihksv6grh7sdn3lr6pgbpqs46rgk32xi3qzaeqle3wuvxsjbdubje",
      },
    ],
    p: [
      "You punch in the numbers and a green light indicates a correct code. A positive notification is played through the console speaker and the door slides open.\n      More air gusts from under the door as it rises as the room around you is literally torn away",
      {
        type: "Condition",
        rule: "equals",
        var: "together",
        true: "you both push yourselves through and you slam your fist on the close button",
        false:
          "You push yourself through and slam your fist onto the close button!",
      },
      "The Door slams shut! You made it!",
    ],
    options: { continue: "end" },
  },
  end: {
    image: "bafkreihrb6ioylgj3fi3clteouxbx5ydqf44ulyrqheyp3gjul2i4symua",
    sectionKey: "end",
    p: ["Well done for getting this far! Keep checking for the next chapter!"],
  },
};
