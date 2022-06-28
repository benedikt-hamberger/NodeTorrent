

// get canvas and context
var canvas = document.getElementById("myCanvas")
var ctx = canvas.getContext("2d")

var scene = new NEScene(canvas, ctx)

var node = new NENode(scene, "MyNode")
var node2 = new NENode(scene, "TestNode")
node.graphics_node.move(0, 0)
node2.graphics_node.move(300, 0)
scene.nodes.push(node)
scene.nodes.push(node2)

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

    // document.addEventListener('wheel', function(event) {
    //     if(lastDownTarget == canvas) {
    //         scene.mousewheel(event)
    //     }
    // }, false);
}
