class NEContextMenu{
    constructor(scene) {
        this.scene = scene
        this.active = true

        this.graphics_cm = new NEGraphicsContextMenu(this)
        this.input = null
    }

    show(x, y) {
        this.active = true
        this.container = document.createElement('div');

        this.container.style = `
            position: fixed;
            background: #101010;
            width = 180px;
            height: 120px;
            border-radius: 10px;

            margin: 10px;
            padding: 10px
        `

        this.container.style.left = (this.scene.canvas.offsetLeft + x ) + 'px';
        this.container.style.top = (this.scene.canvas.offsetTop + y) + 'px';

        document.body.appendChild(this.container);


        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.style = `
            font: Arial 18px;
            display: block;
            width: 160px;
            background: #101010;
            border: 1px #505050AA;

            color: #EEEEEE;

            margin-bottom: 10px;
        `

        this.container.appendChild(this.input)

        this.input.focus();
        this.input.hasInput = true

        this.list = document.createElement('ul');

        var options = ["abc", "def", "ghi"]
        // for (var i = 0; i < options.length; i++){
        for (var i = 0; i <100; i++){
            var opt = document.createElement('li');
            opt.value = i;
            opt.innerHTML = i // options[i]
            this.list.appendChild(opt)
        }

        this.list.style = `
            background: #101010;
            color: #EEEEEE;
            display: block;
            width: 160px;
            height: 80px;
            overflow: hidden;
            overflow-y: scroll; 

            list-style-type: none;
            padding: 0;
            margin: 0;
        `

        this.container.appendChild(this.list)
        


        this.scene.update()
    }

    hide() {
        this.active = false
        if(document.body.contains(this.container)){
            document.body.removeChild(this.container);
        }
    }
}

class NEGraphicsContextMenu {
    constructor(cm){
        this.scene = cm.scene
        this.x = 0
        this.y = 0
        this.width = 200
        this.height = 200
        this.cm = cm
    }

    draw() {
        if(this.cm.active){

            // var ctx = this.scene.ctx
            
            // ctx.fillStyle = '#060204EE';
            // ctx.fillRect(this.x, this.y, this.width, this.height)
            
        }
        else {
            // var scene = this.widget.scene.toScene(this.x, this.y)
            // this.widget.input.style.left = (this.widget.scene.canvas.offsetLeft + scene.x ) + 'px';
            // this.widget.input.style.top = (this.widget.scene.canvas.offsetTop + scene.y) + 'px';
            // this.widget.input.style.width = this.width * this.widget.scene.curr_scale + "px"
            // this.widget.input.style.height = this.height * this.widget.scene.curr_scale + "px"
        }
    }
}