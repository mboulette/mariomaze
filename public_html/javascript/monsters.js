        var monsters =  function(param) {

            this.trash = 0,
            this.width = 57,
            this.height = 31,
            this.img = img[5],
            this.framerate = 500,

            this.current = {
                'x' : param[1],
                'y' : param[2],
                'frame' : 0,
                'speed' : 4,
                'action' : 'walk',
                'timer' : performance.now(),
            },

            this.boundaries = {
                'left' : -2,
                'right' : -6,
                'top' : -4,
                'bottom' : -4,
            },

            this.action = {
                'walk' : [
                     [66, 88, this.framerate], [143, 35, this.framerate],
                ],
                'dead' : [
                     [100, 118, -1],
                ],
            },

            this.die = function() {
                this.current.action = 'dead';
                this.current.frame = 0;
                this.current.y += 2;
                this.width -= 10;
                this.trash = 2;

                setTimeout(function(object){ 
                    object.current.action = 'walk';
                    object.current.y -= 2;
                    object.width += 10;
                    object.trash = 0;

                }, 5000, this);
            },

            this.draw = function(ctx) {

                if (this.trash == 1) return;

                ctx.save();
                x = this.action[this.current.action][this.current.frame][0];
                y = this.action[this.current.action][this.current.frame][1];
                posX = this.current.x;

                if (this.current.speed < 0) {
                    ctx.translate(board.width, 0);
                    ctx.scale(-1, 1);
                    posX = board.width - this.width - this.current.x;                     
                }

                ctx.drawImage(this.img, x, y, this.width, this.height, posX, this.current.y, this.width, this.height);
                ctx.restore();

                this.drawBondaries(ctx);
            },

            this.drawBondaries = function(ctx) {
                if (show_bondaries) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
                    ctx.rect(this.current.x-this.boundaries.left, this.current.y-this.boundaries.top, this.width+this.boundaries.left+this.boundaries.right, this.height+this.boundaries.top+this.boundaries.bottom);
                    ctx.stroke();
                }                
            },

            this.hit = function(x1, y1, x2, y2) {
                if (this.trash != 0)  return false;

                return !(
                    (x1 > this.current.x+this.width+this.boundaries.right) ||
                    (x2 < this.current.x-this.boundaries.left) ||
                    (y1 > this.current.y+this.height+this.boundaries.bottom) ||
                    (y2 < this.current.y-this.boundaries.top)
                );
            },

            this.collision = function(object) {

                if (this.trash != 0) return;
                
                x1 = object.previewX();
                y1 = object.previewY();
                x2 = object.previewX() + object.width;
                y2 = object.previewY() + object.height;

                if (this.hit(x1, y1, x2, y2)) {

                    object.die();
                }
            },

            this.script = function() {
                
                turn = false;
                for (var i = 0; i < map.obstacles.length; i++) {
                    


                    if (map.obstacles[i].hit) {


                        x = (typeof map.obstacles[i].x !== "undefined") ? map.obstacles[i].x : map.obstacles[i].current.x;
                        y = (typeof map.obstacles[i].y !== "undefined") ? map.obstacles[i].y : map.obstacles[i].current.y;

                        if (this.current.speed > 0) {

                            if (map.obstacles[i].hit(this.current.x, this.current.y, this.current.x+this.width, this.current.y+this.height-10)) {
                                this.current.x = x+map.obstacles[i].width+this.current.speed;
                                turn = true;
                                break;
                            }
                        } else {

                            if (map.obstacles[i].hit(this.current.x, this.current.y, this.current.x+this.width, this.current.y+this.height-10)) {
                                this.current.x = x-this.width+this.current.speed;
                                turn = true;
                                break;
                            }
                        }
                        
                    }
                }

                if (!turn)  {

                    turn = true;
                    for (var i = 0; i < map.obstacles.length; i++) {

                        if (map.obstacles[i].hit) {

                            if (this.current.speed > 0) {

                                if (map.obstacles[i].hit(this.current.x-5, this.current.y+this.height, this.current.x, this.current.y+this.height+5)) {
                                    turn = false;
                                    break;
                                }
                            } else {

                                if (map.obstacles[i].hit(this.current.x+this.width, this.current.y+this.height, this.current.x+this.width+5, this.current.y+this.height+5)) {
                                    turn = false;
                                    break;
                                }
                            }
                            
                        }
                    }
                }


                if (turn) this.current.speed = 0-this.current.speed;

                for (var i = 0; i < map.obstacles.length; i++) {
                    
                    if (map.obstacles[i].hit) {
                        x = (typeof map.obstacles[i].x !== "undefined") ? map.obstacles[i].x : map.obstacles[i].current.x;
                        y = (typeof map.obstacles[i].y !== "undefined") ? map.obstacles[i].y : map.obstacles[i].current.y;

                        x1 = this.current.x-this.boundaries.left;
                        y1 = this.current.y-this.boundaries.top;
                        x2 = this.current.x + this.width+this.boundaries.left+this.boundaries.right;
                        y2 = this.current.y + this.height+this.boundaries.top+this.boundaries.bottom;

                        if (map.obstacles[i].hit(x1, y1, x2, y2+10)) {
                            
                            this.current.y = y-this.height-this.boundaries.bottom;
                            return false;
                        }
                    }
                }

                this.current.y = this.current.y + 10;
                this.current.speed = 0-this.current.speed;
                return true;

            },


            this.move = function() {

                if (this.trash != 0) return;

                fall = this.script();

                if ((performance.now() - this.current.timer) >this.action[this.current.action][this.current.frame][2]) {

                    if (!this.action[this.current.action][this.current.frame + 1]) {
                        this.current.frame = 0;
                    } else if (!$.isArray(this.action[this.current.action][this.current.frame + 1])) {
                        this.current.action = this.action[this.current.action][this.current.frame + 1];
                        this.current.frame = 0;
                    } else {
                        this.current.frame++;
                    }
                    if (!fall) this.current.x = this.current.x-this.current.speed;
                    this.current.timer = performance.now();

                }
            }

        };


        var snails = function(param) {
            this.me = new monsters(param);
        };


        var rats = function(param) {
            this.me = new monsters(param);

            this.me.current.speed = 8 + Math.floor(Math.random() * 3);
            this.me.framerate = 50,
            this.me.img = img[6];
            this.me.width = 57;
            this.me.height = 35;

            this.me.die = function() {
                this.current.action = 'dead';
                this.current.frame = 0;
                this.current.y += 1;
                this.trash = 2;
            },

            this.me.action = {
                'walk' : [
                     [198, 477, this.me.framerate*2], [257, 477, this.me.framerate*2],
                ],
                'dead' : [
                     [203, 206, -1],
                ],
            }
        };


