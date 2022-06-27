

// get canvas and context
var canvas = document.getElementById("myCanvas")
var ctx = canvas.getContext("2d")

var scene = new NEScene(canvas, ctx)
var node = new NENode(scene, "MyNode", [], [])

var node2 = new NENode(scene, "TestNode", [], [])
node2.graphics_node.x = 300
scene.nodes.push(node)
scene.nodes.push(node2)
scene.draw()


// make key down work on scene
window.onload = function() {
    canvas = document.getElementById('myCanvas');

    lastDownTarget = null 

    document.addEventListener('mousedown', function(event) {
        lastDownTarget = event.target;
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
