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

            this.wait = function() {
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

                    if (object.invincible) this.die(); 
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
                this.trash = performance.now();

               setTimeout(function(object){ 
                    object.trash = 1;
                }, 60000, this);

            },

            this.me.draw = function(ctx) {

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

                if (this.trash > 1 && performance.now() - this.trash > 20000) {
                    alpha = Math.round(  ((performance.now() - this.trash)-10000) / 10000);
                    ctx.globalAlpha = 1-alpha/10;
                }

                ctx.drawImage(this.img, x, y, this.width, this.height, posX, this.current.y, this.width, this.height);
                ctx.restore();

                this.drawBondaries(ctx);
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


        var plants = function(param) {

            tmp = new hitZone(['boxes', param[1], param[2], 142, 70, 0, 0, 7]);
            map.obstacles.push(tmp);

            param[1] += 35;
            param[2] += 2;
            this.me = new monsters(param);
            this.me.img = img[0];
            this.me.current.action = 'hide';
            this.me.width = 70;
            this.me.height = 0;
            this.me.maxY = param[2];
            this.me.minY = param[2] - 140;

            this.me.boundaries = {
                'left' : -4,
                'right' : -6,
                'top' : -10,
                'bottom' : 0,
            },


            this.me.wait = function() {
                
                this.current.y = this.maxY;
                this.height = 0;
                this.current.frame = 0;
                this.current.action = 'hide';
                this.current.timer = performance.now();
                this.trash = 2;

                setTimeout(function(object){ 
                    object.trash = 0;
                }, 200, this);

            },

            this.me.die = function() {
                this.current.action = 'dead';
                this.current.frame = 0;
            },

            this.me.action = {
                'grow' : [
                     [0*72, 5*72, 1000], 'eat',
                ],
                'hide' : [
                     [0*72, 5*72, 4000], 'grow',
                ],
                'dead' : [
                     [0*72, 5*72, 10000], 'grow',
                ],
                'eat' : [
                     [0*72, 5*72, 1000],
                     [1*72, 5*72, 25],
                     [2*72, 5*72, 25],
                     [3*72, 5*72, 500],
                     [2*72, 5*72, 25],
                     [1*72, 5*72, 25],
                     [0*72, 5*72, 1000],
                     [1*72, 5*72, 25],
                     [2*72, 5*72, 25],
                     [3*72, 5*72, 500],
                     [2*72, 5*72, 25],
                     [0*72, 5*72, 1000],
                     'hide',
                ],
            }

            this.me.draw = function(ctx) {

                if (this.trash == 1) return;

                ctx.save();
                x = this.action[this.current.action][this.current.frame][0];
                y = this.action[this.current.action][this.current.frame][1];

                ctx.drawImage(this.img, x, y, this.width, this.height, this.current.x, this.current.y, this.width, this.height);
                ctx.restore();

                this.drawBondaries(ctx);
            },

            this.me.script = function() {
                
                //console.log(this.current.action, this.current.y, this.minY, this.maxY );
                if (this.current.action == 'grow') {
                    if (this.current.y > this.minY) {
                        this.current.y -= this.current.speed;
                        this.height += this.current.speed;
                    }
                }
                if (this.current.action == 'hide') {
                    if (this.current.y < this.maxY) {
                        this.current.y += this.current.speed;
                        this.height -= this.current.speed;
                    }
                }
                if (this.current.action == 'dead') {
                    if (this.current.y < this.maxY) {
                        this.current.y += (this.current.speed * 2);
                        this.height -= (this.current.speed * 2);
                    }
                }
            },

            this.me.move = function() {

                if (this.trash != 0) return;

                this.script();

                if ((performance.now() - this.current.timer) >this.action[this.current.action][this.current.frame][2]) {

                    if (!this.action[this.current.action][this.current.frame + 1]) {
                        this.current.frame = 0;
                    } else if (!$.isArray(this.action[this.current.action][this.current.frame + 1])) {
                        this.current.action = this.action[this.current.action][this.current.frame + 1];
                        this.current.frame = 0;
                    } else {
                        this.current.frame++;
                    }
                    this.current.timer = performance.now();

                }

            }  


        };



        var breaths = function(param) {

            tmp = new hitZone(['boxes', param[1], param[2], 70, 70, 0, 2, 7]);
            map.obstacles.push(tmp);

            param[2] += 2;
            this.me = new monsters(param);
            this.me.img = img[0];
            this.me.current.action = 'burn';
            this.me.current.speed = 10;
            this.me.width = 70;
            this.me.height = 0;
            this.me.y = param[2];
            this.me.maxY = param[2];
            this.me.minY = param[2] - 140;
            this.me.burning = 0;
            this.me.burnigTimer = performance.now();

            this.me.boundaries = {
                'left' : -10,
                'right' : -10,
                'top' : -20,
                'bottom' : 10,
            },

            this.me.die = function() {

            },

            this.me.action = {
                'burn' : [
                     [5*72, 5*72, 75],
                     [6*72, 5*72, 75],
                     [7*72, 5*72, 75],
                     [8*72, 5*72, 75],
                ],
            }

            this.me.draw = function(ctx) {

                if (this.trash == 1) return;

                ctx.save();
                x = this.action[this.current.action][this.current.frame][0];
                y = this.action[this.current.action][this.current.frame][1];

                ctx.drawImage(this.img, x, y, this.width, this.height, this.current.x, this.current.y, this.width, this.height);
                ctx.restore();

                this.drawBondaries(ctx);
            },

            this.me.script = function() {
                
                if (this.burning == 1) {
                    if (this.current.y > this.minY) {
                        this.current.y -= this.current.speed;
                        this.height += this.current.speed;
                    }

                    if (performance.now() - this.burnigTimer > 2000) {
                        this.burning = 0;
                        this.burnigTimer = performance.now();
                    }

                }
                if (this.burning == 0) {
                    if (this.current.y < this.maxY) {
                        this.current.y += this.current.speed;
                        this.height -= this.current.speed;
                    }

                    if (performance.now() - this.burnigTimer > 5000) {
                        this.burning = 1;
                        this.burnigTimer = performance.now();
                    }
                }


            },

            this.me.move = function() {

                if (this.trash != 0) return;

                this.script();

                if ((performance.now() - this.current.timer) >this.action[this.current.action][this.current.frame][2]) {

                    if (!this.action[this.current.action][this.current.frame + 1]) {
                        this.current.frame = 0;
                    } else if (!$.isArray(this.action[this.current.action][this.current.frame + 1])) {
                        this.current.action = this.action[this.current.action][this.current.frame + 1];
                        this.current.frame = 0;
                    } else {
                        this.current.frame++;
                    }
                    this.current.timer = performance.now();

                }

            }  


        };