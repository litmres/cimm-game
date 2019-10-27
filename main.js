// preload media
let thingsToLoad = [
  "img/Cimm_mc.json",
  "fonts/monogram.ttf"
];

//Create a new Hexi instance, and start it.
let g = hexi(2048, 2048, setup);

g.border = "2px red dashed";
g.scaleToWindow();
g.start();

// Create BeepBox synth
var music = new beepbox.Synth("");
//music.play();
//music.pause();

// show loading bar
function load(){
  g.loadingBar();
}

function setup() {
  g.fps = 2;
  console.log("setup");

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

  // Setup vars
  actions = [];
  stress = 0.1;
  fullness = 0.25;
  action_text_font = "120px Monogram";
  action_text_col = "black";
  action_text_prefix = "> ";
  awake = false;
  ticks_since_last_action = 0;

  // Alter variables, check for win/fail states
  function update_stress_hunger(stress_d, fullness_d){
    stress += stress_d;
    if (ticks_since_last_action < 12){
      if stress_d>0{
        stress += stress_d;
      }
      if stress_d<0{
        stress -= stress_d;
      }
    }
    fullness += fullness_d
  }

  // Configure actions
  // this could be refactored better
  action1 = g.text(action_text_prefix+"Hunt a rat", action_text_font, action_text_col);
  action1.interactive = true;
  action1_action = () => update_stress_hunger(0.1, 0.1)
  action1.tap = action1_action();
  action1.click = action1_action();
  actions.push(action1);

  action2 = g.text(action_text_prefix+"Blink", action_text_font, action_text_col);
  action2.interactive = true;
  action2_action = () => update_stress_hunger(-0.1, -0.01)
  action2.tap = action2_action();
  action2.click = action2_action();
  actions.push(action2);

  //action3
  //action4
  //action5
  //action6

  // Rebuild screen between button presses

  function rebuild_screen(){
    shuffleArray(actions)
  }

  //Add title
  title = g.text("> Cimm", "240px Monogram", "black");
  g.stage.putTop(title, -600, 400);

  // Add game state text
  curr_text = g.text("you are a cat...", "240px Monogram", "black");
  g.stage.putRight(curr_text, -2000, -200);
  // make it clickable
  curr_text.interactive = true;

  // get a pointer object to find where clicks happen
  pointer = g.makePointer();

  //Change the state to `play`
  g.state = play;
}

//The `play` function will run in a loop
function play() {
  console.log("play");
  pointer.tap = () => console.log("The pointer was tapped at "+pointer.x+", "+pointer.y);
  curr_text.tap = () => console.log("The current text was tapped");
  curr_text.click = () => console.log("The current text was clicked");
}
