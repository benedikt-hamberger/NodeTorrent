
const Colors = {
    1: "#EE8800",
    2: "#0088EE",
    3: "#33AA11"
}


// get canvas and context
var canvas = document.getElementById("myCanvas")
var ctx = canvas.getContext("2d")

var scene = new NEScene(canvas, ctx)

var node = new NENode(scene, "MyNode")
node.graphics_node.move(0, 0)
scene.nodes.push(node)
node.can_be_deleted = false
node.can_be_selected = false
node.can_be_moved = false

var node2 = new NENode(scene, "TestNode")
node2.graphics_node.move(300, 0)
scene.nodes.push(node2)

var node3 = new NENode(scene, "ABC")
node3.graphics_node.move(600, 200)
scene.nodes.push(node3)
node3.can_be_selected = false

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
