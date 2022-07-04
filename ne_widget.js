class NEWidget {
    constructor(scene) {
        this.that = this
        this.scene = scene
        this.graphics_widget = null // new NEGraphicsWidget(this.scene, this)
        this.value = null

        this.visible = true
        this.editable = true
    }

    move() {

    }

    draw() {
        this.graphics_widget.draw()
    }

    serialize() {
        return this.value
    }
}

class NEGraphicsWidget {
    constructor(scene, widget) {
        this.scene = scene
        this.widget = widget
        this.x = 20
        this.y = 20
        this.x_offset = 0
        this.y_offset = 0
        this.width = 80
        this.height = 30
    }

    move(new_x, new_y) {
        this.x = new_x + this.x_offset
        this.y = new_y + this.y_offset
    }

    draw() {

    }
}

class NETextWidget extends NEWidget{
    constructor(scene){
        super(scene)
        this.scene = scene
        this.graphics_widget = new NETextGraphicsWidget(this.scene, this)
        this.value = ""
        this.focused = false
        this.cursor = 0
        this.input = null
        this.validation_pattern = "\d+[\.,]?\d*"
        this.type = "text"
        this.max_length = "10"
        this.min_length = "0"
    }

    focus() {
        if(this.editable) {
            this.focused = true
            this.input = document.createElement('input');
    
            this.input.type = 'text';
            this.input.style.position = 'fixed';
    
            var scene = this.scene.toScene(this.graphics_widget.x, this.graphics_widget.y)
            this.input.style.left = (this.scene.canvas.offsetLeft + scene.x ) + 'px';
            this.input.style.top = (this.scene.canvas.offsetTop + scene.y) + 'px';
            this.input.style.backgroundColor = "#060204EE"
            this.input.style.color = "#FFFFFF"
            this.input.style.width = this.graphics_widget.width + 'px';
            this.input.style.height = this.graphics_widget.height + 'px';
            this.input.style.font = "18px Arial"
            this.input.style.boxSizing = "border-box"
            this.input.style.padding = "0px"
            this.input.style.margin = "0px"
    
            this.input.addEventListener("focus", function() {
                this.style.borderWidth = "1px"
                this.style.border = "#EE8800"
                this.style.borderRadius = "0px"
            })
    
            this.input.minLength = this.min_length
            this.input.maxLength = this.max_length
            this.input.type = this.type
            this.input.pattern = this.validation_pattern
            this.input.onkeydown = this.handleEnter;
            this.input.widget = this
            this.input.value = this.value
            document.body.appendChild(this.input);
            this.input.focus();
            this.input.hasInput = true
            this.scene.update()
        }
    }

    unfocus() {
        this.value = this.input.value
        this.focused = false
        if(document.body.contains(this.input)){
            document.body.removeChild(this.input);
        }
    }

    //Key handler for input box:
    handleEnter(e) {
        var keyCode = e.keyCode;
        if (keyCode === 13) {
            this.widget.unfocus()
            this.widget.scene.update()
        }
        
    }

}

class NETextGraphicsWidget extends NEGraphicsWidget {
    constructor(scene, widget) {
        super(scene, widget)
    }

    draw() {
        if(this.widget.visible){
            if(!this.widget.focused){
    
                var ctx = this.scene.ctx
                
                ctx.fillStyle = '#060204EE';
                ctx.fillRect(this.x, this.y, this.width, this.height)
                
                // ctx.strokeStyle = '#EE8800';
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1
                ctx.strokeRect(this.x, this.y, this.width, this.height)
                
                ctx.font = "18px Arial";
                ctx.strokeStyle = '#000000FF'
                ctx.lineWidth = 1
                var display_text = this.widget.value
                ctx.strokeText(display_text, this.x + 5, this.y + 20)
                ctx.fillStyle = "#FFFFFF"
                ctx.fillText(display_text, this.x + 5, this.y + 20)
            }
            else {
                var scene = this.widget.scene.toScene(this.x, this.y)
                this.widget.input.style.left = (this.widget.scene.canvas.offsetLeft + scene.x ) + 'px';
                this.widget.input.style.top = (this.widget.scene.canvas.offsetTop + scene.y) + 'px';
                this.widget.input.style.width = this.width * this.widget.scene.curr_scale + "px"
                this.widget.input.style.height = this.height * this.widget.scene.curr_scale + "px"
            }
        }
        
    }
}