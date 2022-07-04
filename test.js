// get canvas and context
var canvas = document.getElementById("myCanvas")
var ctx = canvas.getContext("2d")

var scene = new NEScene(canvas, ctx)

// this.scene.addNode(new NETest(this.scene))

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
