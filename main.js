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

  //Add title
  title = g.text("> Cimm", "240px Monogram", "black");
  g.stage.putTop(title, -600, 400);

  // Add game state text
  curr_text = g.text("you are a cat.", "240px Monogram", "black");
  g.stage.putTop(curr_text, -600, 600);
  pointer = g.makePointer();

  //Change the state to `play`
  g.state = play;
}

//The `play` function will run in a loop
function play() {
  console.log("play");
  pointer.tap = () => console.log("The pointer was tapped at "+pointer.x+", "+pointer.y);
}
