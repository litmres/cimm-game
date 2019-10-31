// preload media
let thingsToLoad = [
  "img/Cimm_mc.png",
  "img/Cimm_mc_awake.png",
  "snd/meow.mp3",
  "fonts/monogram.ttf"
];

// all UI text - switch translations here
var ui_text = {}
ui_text['title'] = '> Cinn'
ui_text['subtitle'] = 'you are a cat.'
ui_text['play'] = 'wake up?'
ui_text['about'] = '(about)'
ui_text['credits'] = '(credits)'
ui_text['sound'] = '(music)'
ui_text['awake_waiting'] = "You're hungry."
ui_text['action1'] = 'Hunt a rat'
ui_text['action1_response'] = 'You catch a yummy rat and \nfeel slightly fuller.'
ui_text['action2'] = 'Blink'
ui_text['action2_response'] = 'You blink your eyes. \nYou feel slightly more refreshed.'
ui_text['action3'] = 'Grab a lizard'
ui_text['action3_response'] = ''
ui_text['action4'] = 'Meow'
ui_text['action4_response'] = ''
ui_text['action5'] = 'Catch a bug'
ui_text['action5_response'] = ''
ui_text['action6'] = 'Sniff flowers'
ui_text['action6_response'] = ''
ui_text['too_hungry_fail'] = "You faint from hunger. Thankfully, you're not alone ..."
ui_text['win'] = "You did it! You're full! You get to spend the rest of day playing in flowers, and settle down for a comfy nap."
ui_text['too_stressed_fail'] = "You're too tired! You can't ... keep ... going ... \n\n but your besties have your back ^_^"

// global variables
let music, music_toggle, playscene, endscene, titlescene, update_stress_hunger

/**
* Randomize array element order in-place.
* Using Durstenfeld shuffle algorithm.
* from https://stackoverflow.com/a/12646864
*/
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

//Create a new Hexi instance, and start it.
let g = hexi(2048, 2048, setup, thingsToLoad);

g.border = "2px red dashed";
g.scaleToWindow();
g.start();


// show loading bar
function load(){
  g.loadingBar();
}

function setup() {
  g.fps = 10;
  console.log("setup");

  // Settings
  stress_init = 0.1;
  fullness_init = 0.25;
  action_text_font = "120px Monogram";
  action_text_col = "black";
  action_text_prefix = "> ";

  // Init vars
  actions = [];
  stress = 0; // reinitialize on play
  fullness = 0; // reinitialize on play
  awake = false;
  ticks_since_last_action = 0;
  music_status = true;

  awakescene = g.group();
  // build fake background
  fb_bg = g.rectangle(2048, 2048, "black");
  bg_bg = g.rectangle(2048, 2048, "white");
  awakescene.addChild(fb_bg);
  awakescene.addChild(bg_bg);

  // Alter variables, check for win/fail states
  function update_stress_hunger(stress_d, fullness_d, reset_ticks_n){
    if (awake==false){
      return;
    }
    stress += stress_d;
    // if (ticks_since_last_action < 12){
    //   console.log("Too quick!")
    //   if (stress_d>0){
    //     stress += stress_d;
    //   }
    //   if (stress_d<0){
    //     stress -= stress_d;
    //   }
    // }
    if (stress < 0){ // overflow hack
      stress = 0;
    }
    fullness += fullness_d
    hunger_bar.inner.height = 2000*fullness;
    awakescene.alpha = 0.05 + (0.95 * (1-stress))
    console.log("Stress at "+stress+", Fullness at "+fullness)
    ticks_since_last_action = reset_ticks_n
    if (stress >= 1){
      // burnout fail
    }
    else if (fullness < 0){
      // hunger fail
    }
    else if (fullness > 1){
      // win
    }
  }

  let meow = g.sound("snd/meow.mp3");
  // Configure actions
  // this could be refactored better
  function makeAction(action_text, success_text, stress_d, fullness_d){
    action = g.text(action_text_prefix+action_text, action_text_font, action_text_col);
    action.interactive = true;
    //action.tap = () => update_stress_hunger(stress_d, fullness_d, 0);
    action.click = () => {
      update_stress_hunger(stress_d, fullness_d, 24);
      action_reponse.content = success_text;
      if (action_text==ui_text['action4']){ // hack for meows
        meow.play();
      }
      awake_reset();
    }
    action.alpha = 0;
    console.log("Making button "+action_text);
    awakescene.addChild(action);
    return action;
  };

  // get rat
  actions.push(makeAction(ui_text['action1'], ui_text['action1_response'], 0.2, 0.1));
  // blink
  actions.push(makeAction(ui_text['action2'], ui_text['action2_response'], -0.1, -0.01));
  // sneak up on lizard
  actions.push(makeAction(ui_text['action3'], ui_text['action3_response'], 0.1, 0.05));
  // meow
  actions.push(makeAction(ui_text['action4'], ui_text['action4_response'], -0.2, -0.01));
  // get bug
  actions.push(makeAction(ui_text['action5'], ui_text['action5_response'], 0.1, 0.01));
  // sniff flowers
  actions.push(makeAction(ui_text['action6'], ui_text['action6_response'], -0.2, -0.05));

  awake_status = g.text("> "+ui_text['awake_waiting'], "240px Monogram", "black");
  g.stage.putTop(awake_status, -100, 300);
  awakescene.addChild(awake_status);

  action_reponse = g.text("", "120px Monogram", "black");
  g.stage.putRight(action_reponse, -1900, -600);
  awakescene.addChild(action_reponse);

  // Make title components
  titlescene = g.group();

  //Add title
  title = g.text(ui_text['title'], "240px Monogram", "black");
  g.stage.putTop(title, -600, 300);
  titlescene.addChild(title)

  // Add game state text
  subtitle = g.text(ui_text['subtitle'], "240px Monogram", "black");
  g.stage.putRight(subtitle, -1900, -600);
  // make it clickable
  subtitle.interactive = true;
  titlescene.addChild(subtitle)
  subtitle.tap = () => console.log("The current text was tapped");
  subtitle.click = () => {
    console.log("The current text was clicked");
    wake_up = g.fadeOut(titlescene, 10);
    wake_up.onComplete = () => {
      awake_reset();
      update_stress_hunger(0,0,24);
      g.fadeIn(awakescene, 10);
    }
  }

  // add cat
  main_kitty_anim = g.filmstrip("img/Cimm_mc.png", 352, 352);
  main_kitty = g.sprite(main_kitty_anim);
  main_kitty.fps = 2;
  main_kitty.playAnimation([0,2]);
  main_kitty.setScale(1.5,1.5);
  main_kitty.setPosition(800,700);
  titlescene.addChild(main_kitty);

  main_kitty_anim_awake = g.filmstrip("img/Cimm_mc_awake.png", 352, 352);
  main_kitty_awake = g.sprite(main_kitty_anim_awake);
  main_kitty_awake.fps = 2;
  main_kitty_awake.playAnimation([0,2]);
  main_kitty_awake.setScale(1.5,1.5);
  main_kitty_awake.setPosition(800,700);
  awakescene.addChild(main_kitty_awake);

  // Create BeepBox synth
  music = new beepbox.Synth("8n10s0k0l00e05t1Um0a7g09j04i0r1o3T5v1u32q1d5f8y1z7C1c0h0HU7000U0006000Eb9jB00p21nFEYzwieCCCCS1F8W2eyEzRAt97lnjjjhhjjhjjEFFFFEEFFEbWqqqtd9vhhkhT4t97ihQAuMzG8WieCEzGFHIcI");

  // add music
  //music.play();

  // build hunger bar
  outerBar = g.rectangle(50, 2000, "black");
  innerBar = g.rectangle(30, 1980, "white");
  innerBar.x += 10;
  innerBar.y += 10;
  hunger_bar = g.group(outerBar, innerBar);
  hunger_bar.inner = innerBar;
  hunger_bar.setPosition(20,20);

  awakescene.addChild(hunger_bar);



  // get a pointer object to find where clicks happen
  pointer = g.makePointer();
  pointer.tap = () => console.log("The pointer was tapped at "+pointer.x+", "+pointer.y);

  // Rebuild screen between button presses
  function awake_reset(){
    awake = true;
    shuffleArray(actions);
    g.stage.putRight(actions[0], -1000, 600);
    g.stage.putRight(actions[1], -1000, 300);
    g.stage.putRight(actions[2], -1000, 900);
    g.stage.putRight(actions[3], -1900, 300);
    g.stage.putRight(actions[4], -1900, 600);
    g.stage.putRight(actions[5], -1900, 900);
    g.fadeIn(actions[0], 10);
    g.fadeIn(actions[1], 10);
    g.fadeIn(actions[2], 10);
    g.fadeIn(actions[3], 10);
    g.fadeIn(actions[4], 10);
    g.fadeIn(actions[5], 10);
    // actions[0].visible = true;
    // actions[1].visible = true;
    // actions[2].visible = true;
    // actions[3].visible = true;
    // actions[4].visible = true;
    // actions[5].visible = true;
  }
  function return_to_sleep(){
    g.fadeOut(actions[0], 10);
    g.fadeOut(actions[1], 10);
    g.fadeOut(actions[2], 10);
    g.fadeOut(actions[3], 10);
    g.fadeOut(actions[4], 10);
    g.fadeOut(actions[5], 10);
  }

  // Hide other scenes
  awakescene.alpha = 0;
  // Update starting levels
  stress = stress_init;
  fullness = fullness_init;

  //Change the state to `play`
  g.state = play;

}

//The `play` function will run in a loop
function play() {
  console.log("play");

  // if (awake){
  //   ticks_since_last_action += 1;
  //   if (ticks_since_last_action>24){
  //     update_stress_hunger(0, -0.01, 12);
  //   }
  // }

}
