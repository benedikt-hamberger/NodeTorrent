

// get canvas and context
var canvas = document.getElementById("myCanvas")
var ctx = canvas.getContext("2d")


// // Create gradient
// var grd = ctx.createLinearGradient(0, 0, 200, 0);
// grd.addColorStop(0, "red");
// grd.addColorStop(1, "white");

// // Fill with gradient
// ctx.fillStyle = grd;
// ctx.fillRect(10, 10, 150, 80);



// var grd = ctx.createLinearGradient(20, 100, 150, 127);
//     grd.addColorStop(0, '#AF101112');
//     grd.addColorStop(1, '#9F0A0B0C');

// ctx.beginPath();
// ctx.moveTo(70,100);
// ctx.arcTo(0,100,0,0,30);
// ctx.arcTo(0,0,100,0,30);
// ctx.arcTo(100,0,100,100,30);
// ctx.arcTo(100,100,0,100,30);
// ctx.fillStyle = grd;
// ctx.fill();
// ctx.strokeStyle = '#000000';
// ctx.stroke();



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

    document.addEventListener('mousedown', function(event) {
        lastDownTarget = event.target;
    }, false);

    document.addEventListener('keydown', function(event) {
        if(lastDownTarget == canvas) {
            scene.keydown(event)
        }
    }, false);
}
