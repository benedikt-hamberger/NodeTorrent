
const Colors = {
    0: "#FFFFFF",
    1: "#33AA11",
    2: "#EE8800",
    3: "#3333AA"
}


// get canvas and context
var canvas = document.getElementById("myCanvas")
var ctx = canvas.getContext("2d")

var scene = new NEScene(canvas, ctx)

var widget = new NEWidget(scene)
scene.widgets.push(widget)


scene.update()


// make key down work on scene
window.onload = function() {
    canvas = document.getElementById('myCanvas');

    lastDownTarget = null 

    // prevent default right click menu
    canvas.addEventListener('contextmenu', (e) => {e.preventDefault()});

    document.addEventListener('mousedown', function(event) {
        lastDownTarget = event.target;
        event.preventDefault()
    }, false);

    document.addEventListener('keydown', function(event) {
        if(lastDownTarget == canvas) {
            scene.keydown(event)
        }
    }, false);

}
