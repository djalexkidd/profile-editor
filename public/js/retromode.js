const htmlnode = document.querySelector("main")
const gridbackground = document.querySelector(".scrolling-image-container")
const linknode = document.querySelectorAll("a:link")
const imgnode = document.querySelector("img")

var allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    65: 'a',
    66: 'b'
};

var konamiCode = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'];
var konamiCodePosition = 0;

document.addEventListener('keydown', function(e) {
    var key = allowedKeys[e.keyCode];
    var requiredKey = konamiCode[konamiCodePosition];

    if (key == requiredKey) {

      konamiCodePosition++;

      if (konamiCodePosition == konamiCode.length) {
        activateCheats();
        konamiCodePosition = 0;
      }
    } else {
      konamiCodePosition = 0;
    }
});

function activateCheats() {
    htmlnode.style.fontFamily = "vcr"
    htmlnode.style.fontSize = "24px"
    gridbackground.style.display = "block"
    htmlnode.style.color = "white"
    imgnode.style.backgroundColor = "white"

    for(let i = 0; i < linknode.length; i++) {
      linknode[i].style.color = "white"
      linknode[i].style.fontSize = "34px"
    }
}