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
                'speed' : 5,
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
                mario.kill +=1;

                setTimeout(function(object){ 
                    object.current.action = 'walk';
                    object.current.y -= 2;
                    object.width += 10;
                    object.trash = 0;

                }, 10000, this);
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
                mario.kill +=1;

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

        var bats = function(param) {
            this.me = new monsters(param);

            this.me.current.speed = 8 + Math.floor(Math.random() * 3);
            this.me.framerate = 50,
            this.me.img = img[0];
            this.me.width = 70;
            this.me.height = 40;
            this.me.current.action = 'fly';
            this.me.current.speed = 3 + Math.floor(Math.random() * 3);;
            this.me.current.y = param[2] + 30;

            this.me.die = function() {
                this.current.action = 'dead';
                this.current.frame = 0;
                this.trash = 2;
                mario.kill +=1;

                setTimeout(function(object){ 
                    object.trash = 1;
                }, 2000, this);

            },

            this.me.boundaries = {
                'left' : -4,
                'right' : -4,
                'top' : -4,
                'bottom' : 0,
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
                'fly' : [
                     [4*72, 4*72, this.me.framerate*2], [6*72, 4*72, this.me.framerate*2],
                ],
                'dead' : [
                     [7*72, 4*72, -1],
                ],
            },


            this.me.script = function() {

                if (this.trash != 0) {
                    this.current.x -= (this.current.speed/2);
                    this.current.y += Math.abs(this.current.speed*3);
                    return
                };
                

                for (var i = 0; i < map.obstacles.length; i++) {

                    if (map.obstacles[i].hit) {

                        //Une chance sur 5 de changer de direction aléatoirement
                        /*
                        var change = Math.floor(Math.random() * 1000);
                        console.log(change);
                        if (change == 1) this.current.speed = 0-this.current.speed;
                        */


                        x = (typeof map.obstacles[i].x !== "undefined") ? map.obstacles[i].x : map.obstacles[i].current.x;
                        y = (typeof map.obstacles[i].y !== "undefined") ? map.obstacles[i].y : map.obstacles[i].current.y;

                        if (map.obstacles[i].hit(
                            this.current.x - this.boundaries.left, 
                            this.current.y - this.boundaries.top, 
                            this.current.x+this.width + this.boundaries.right, 
                            this.current.y+this.height + this.boundaries.bottom
                            )) {

                            //console.log(this.current.speed);
                            if (this.current.speed > 0) {
                                this.current.x = x+map.obstacles[i].width+this.current.speed; 
                            } else {
                                this.current.x = x-this.width+this.current.speed;
                            }
                            this.current.speed = 0-this.current.speed;
                            break;

                        }
  
                    }
                }

                this.current.x -= this.current.speed;

            },


            this.me.collision = function(object) {

                if (this.trash != 0) return;
                
                x1 = object.previewX();
                y1 = object.previewY();
                x2 = object.previewX() + object.width;
                y2 = object.previewY() + object.height;

                if (this.hit(x1, y1, x2, y2) && object.current.action != 'stoop') {

                    object.die();

                    if (object.invincible) this.die(); 
                }
            },

            this.me.move = function() {

                this.script();

                if (this.trash != 0) return;

                if ((performance.now() - this.current.timer) >this.action[this.current.action][this.current.frame][2]) {

                    if (!this.action[this.current.action][this.current.frame + 1]) {
                        this.current.frame = 0;
                        this.current.y -= 10;
                    } else if (!$.isArray(this.action[this.current.action][this.current.frame + 1])) {
                        this.current.action = this.action[this.current.action][this.current.frame + 1];
                        this.current.frame = 0;
                    } else {
                        this.current.frame++;
                        this.current.y += 10;
                    }
                    
                    this.current.timer = performance.now();

                }
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
                mario.kill +=1;
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

                    if (!this.hit(mario.current.x, mario.current.y+mario.height, mario.current.x+mario.width, mario.current.y+mario.height+10 )) {
                        if (this.current.y > this.minY) {
                            this.current.y -= this.current.speed;
                            this.height += this.current.speed;
                        }                       
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

        
        var breathsReverse = function(param) {

            
            tmp = new hitZoneR(['boxes', param[1], param[2], 70, 70, 0, 2, 7]);
            map.obstacles.push(tmp.me);
            

            param[2] += 68;
            this.me = new monsters(param);
            this.me.img = img[0];
            this.me.current.action = 'burn';
            this.me.current.speed = 10;
            this.me.width = 70;
            this.me.height = 0;
            this.me.y = param[2];
            this.me.maxY = param[2] + 140;
            this.me.minY = param[2];
            this.me.burning = 0;
            this.me.burnigTimer = performance.now();

            this.me.boundaries = {
                'left' : -10,
                'right' : -10,
                'top' : 10,
                'bottom' : -20,
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

                ctx.translate(this.current.x + (this.width/2), this.current.y + (this.height/2));
                ctx.scale(1, -1);
                ctx.translate(0 - (this.current.x + (this.width/2)), 0 - (this.current.y + (this.height/2)) );

                ctx.drawImage(this.img, x, y+140, this.width, this.height, this.current.x, this.current.y, this.width, this.height);
                ctx.restore();

                this.drawBondaries(ctx);
            },

            this.me.script = function() {
                
                if (this.burning == 1) {
                    if (this.current.y > this.minY) {
                        this.current.y -= this.current.speed;
                        this.height += this.current.speed;
                    }

                    if (performance.now() - this.burnigTimer > 5000) {
                        this.burning = 0;
                        this.burnigTimer = performance.now();
                    }

                }
                if (this.burning == 0) {
                    if (this.current.y < this.maxY) {
                        this.current.y += this.current.speed;
                        this.height -= this.current.speed;
                    }

                    if (performance.now() - this.burnigTimer > 2000) {
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




        var lavas = function(param) {

            this.me = new monsters(param);
            this.me.img = img[0];
            this.me.current.action = 'burn';
            this.me.width = 70;
            this.me.height = 70;
            this.me.burning = 0;
            this.me.burnigTimer = performance.now();
            this.me.fireball = Math.floor(Math.random() * 3) + 1;

            this.me.boundaries = {
                'left' : 0,
                'right' : 0,
                'top' : -20,
                'bottom' : 0,
            },

            this.me.die = function() {

            },

            this.me.action = {
                'burn' : [
                     [5*72, 7*72, 200],
                     [6*72, 7*72, 200],
                     [7*72, 7*72, 200],
                     [8*72, 7*72, 200],

                     [5*72, 7*72, 200],
                     [6*72, 7*72, 200],
                     [7*72, 7*72, 200],
                     [8*72, 7*72, 200],

                ]

            }

            this.me.draw = function(ctx) {

                if (this.trash == 1) return;

                ctx.save();
                x = this.action[this.current.action][this.current.frame][0];
                y = this.action[this.current.action][this.current.frame][1];

                if (this.current.frame%2 == 0) {
                    ctx.translate(this.current.x + (this.width/2), 0);
                    ctx.scale(-1, 1);
                    ctx.translate(0 - (this.current.x + (this.width/2)), 0);                     
                }

                ctx.drawImage(this.img, x, y, this.width, this.height, this.current.x, this.current.y, this.width, this.height);
                ctx.restore();

                this.drawBondaries(ctx);
            },

            this.me.script = function() {

                if ((performance.now() - this.burnigTimer) > (this.fireball*3000)) {

                    var tmp = new fireball(['fireball', this.current.x, this.current.y]);
                    map.monsters.push(tmp);

                    this.burnigTimer = performance.now();
                }
                
            },

            this.me.move = function() {

                if (this.trash != 0) return;

                this.script();

                if ((performance.now() - this.current.timer) > this.action[this.current.action][this.current.frame][2]) {

                    

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


        var firelame =  function(param) {
            this.me = new fireball(param);
            this.me.centerX = param[1];
            this.me.centerY = param[2];
            this.me.rayon = param[3];
            this.me.percent = 0;
            this.me.current.speed = -1;

            this.me.script = function() {
                
                if ((performance.now() - this.movingTimer) > 10) {

                    this.percent++;
                    if ( this.percent > 200)  this.percent = 1;

                    var angle = Math.PI * (1-this.percent/100);
                    var x = this.centerX + this.rayon * Math.cos(angle);
                    var y = this.centerY + this.rayon * Math.sin(angle); 

                    this.current.x = x;
                    this.current.y = y;

                    this.movingTimer = performance.now();
                }
            }
        }


        var bowserBreath =  function(param) {
            this.me = new fireball(param);
            this.me.current.speed = param[3];
            this.me.startX = param[1];
            this.gravity = 4;

            this.me.script = function() {

                if ((performance.now() - this.movingTimer) > 25) {

                    this.current.x += this.current.speed;
                    this.current.y += this.gravity;

                    this.movingTimer = performance.now();

                    if (Math.abs(this.startX - this.current.x) > 400 ) this.trash = 1;
                }
            };

            this.me.wait = function() {
                this.trash = 1;
            },

            this.me.draw = function(ctx) {

                if (this.trash == 1) return;

                ctx.save();
                x = this.action[this.current.action][this.current.frame][0];
                y = this.action[this.current.action][this.current.frame][1];
                
                if (this.current.speed < 0) {
                    ctx.translate(this.current.x + (this.width/2), this.current.y + (this.height/2));
                    ctx.scale(-1, 1);
                    ctx.translate(0 - (this.current.x + (this.width/2)), 0 - (this.current.y + (this.height/2)) );
                }

                ctx.drawImage(this.img, x, y, this.width, this.height, this.current.x, this.current.y, this.width, this.height);
                ctx.restore();

                this.drawBondaries(ctx);
            };

        }

        var fireball =  function(param) {

            this.trash = 0,
            this.width = 40,
            this.height = 40,
            this.img = img[0],
            this.gravity = 1,
            this.movingTimer = performance.now(),
            this.startY = param[2];

            this.current = {
                'x' : param[1],
                'y' : param[2],
                'frame' : Math.floor(Math.random() * 4),
                'speed' : 22,
                'action' : 'burning',
                'timer' : performance.now(),
            },

            this.boundaries = {
                'left' : -8,
                'right' : -8,
                'top' : -4,
                'bottom' : -4,
            },

            this.action = {
                'burning' : [
                [(this.width * 1), 240, 100],
                [(this.width * 2), 240, 100],
                [(this.width * 3), 240, 100],
                [(this.width * 4), 240, 100],
                [(this.width * 5), 240, 100]
                ]
            },


            this.die = function() {

            },

            this.wait = function() {
            },

            this.draw = function(ctx) {

                if (this.trash == 1) return;

                ctx.save();
                x = this.action[this.current.action][this.current.frame][0];
                y = this.action[this.current.action][this.current.frame][1];

                ctx.translate(this.current.x + (this.width/2), this.current.y + (this.height/2));
                if (this.current.speed > 0) {
                    ctx.rotate(270*Math.PI/180);
                } else {
                    ctx.rotate(90*Math.PI/180);
                }
                ctx.translate(0 - (this.current.x + (this.width/2)), 0 - (this.current.y + (this.height/2)) );

                ctx.drawImage(this.img, x, y, this.width, this.height, this.current.x, this.current.y, this.width, this.height);
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

                if ((performance.now() - this.movingTimer) > 25) {

                    this.current.y -= this.current.speed;
                    this.current.speed -= this.gravity;

                    this.movingTimer = performance.now();
                }

                if (this.startY < this.current.y) this.trash = 1; 
            },


            this.move = function() {

                if (this.trash != 0) return;

                this.script();

                if ((performance.now() - this.current.timer) > this.action[this.current.action][this.current.frame][2]) {
                   
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



        var pikes =  function(param) {

            this.trash = 0,
            this.width = 70,
            this.height = 70,
            this.img = img[4],

            this.current = {
                'x' : param[1],
                'y' : param[2],
            },

            this.boundaries = {
                'left' : 0,
                'right' : 0,
                'top' : -40,
                'bottom' : 0,
            },

            this.wait = function() {
            },

            this.die = function() {
            },

            this.draw = function(ctx) {

                if (this.trash == 1) return;

                ctx.save();
                ctx.drawImage(this.img, 347, 0, this.width, this.height, this.current.x, this.current.y, this.width, this.height);
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


            this.move = function() {
            }

        };


        var bowser = function(param) {
            this.trash = 0,
            this.width = 144,
            this.height = 216,
            this.img = img[0],
            this.gravity = 1,
            this.lives = 6,
            this.fireTimer = performance.now(),

            this.current = {
                'x' : param[1],
                'y' : param[2]-140,
                'frame' : 0,
                'speed' : -18,
                'action' : 'walk',
                'timer' : performance.now(),
                'lives' : this.lives,
            },

            this.boundaries = {
                'left' : -20,
                'right' : -20,
                'top' : -90,
                'bottom' : -10,
            },

            this.action = {
                'walk' : [
                [(this.width * 0), 650, 100],
                [(this.width * 1), 650, 100],
                [(this.width * 2), 650, 100],
                [(this.width * 3), 650, 100],
                [(this.width * 4), 650, 100],
                [(this.width * 5), 650, 100],
                ],

                'dead' :  [
                [(this.width * 6), 650, -1],
                ]
            },

            this.wait = function() {
            },

            this.die = function() {
                if (this.trash != 0 ) return;

                this.current.lives--;

                if (this.current.lives == 0) {
                    this.trash = 2;
                    this.current.action = 'dead';
                    this.current.frame = 0;
                    mario.kill +=1;
                }
            },

            this.draw = function(ctx) {

                if (this.trash == 1) return;

                ctx.save();
                x = this.action[this.current.action][this.current.frame][0];
                y = this.action[this.current.action][this.current.frame][1];

                if (this.current.speed > 0) {
                    ctx.translate(this.current.x + (this.width/2), this.current.y + (this.height/2));
                    ctx.scale(-1, 1);
                    ctx.translate(0 - (this.current.x + (this.width/2)), 0 - (this.current.y + (this.height/2)) );
                }

                ctx.drawImage(this.img, x, y, this.width, this.height, this.current.x, this.current.y, this.width, this.height);
                ctx.restore();


                ctx.beginPath();
                ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                ctx.rect(this.current.x+50, this.current.y + this.height, this.current.lives * (50 / this.lives) , 8);
                ctx.fill();

                ctx.beginPath();
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
                ctx.rect(this.current.x+50, this.current.y + this.height, 50, 8);
                ctx.stroke();



                this.drawBondaries(ctx);
            },

            this.drawBondaries = function(ctx) {
                if (show_bondaries) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
                    ctx.rect(this.current.x-this.boundaries.left, this.current.y-this.boundaries.top, this.width+this.boundaries.left+this.boundaries.right, this.height+this.boundaries.top+this.boundaries.bottom);
                    ctx.stroke();

                    if (this.current.speed > 0) {
                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(0, 0, 255, 1)';
                        ctx.rect(this.current.x + this.width, this.current.y + this.height , 5, 5);
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
                        ctx.rect(this.current.x + 70, this.current.y + 58 , 70, 70);
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(0, 0, 255, 1)';
                        ctx.rect(this.current.x + 10, this.current.y + 90 , 30, 100);
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(0, 255, 0, 1)';
                        ctx.rect(this.current.x + this.width + 20, this.current.y , 300, 100);
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(0, 255, 0, 1)';
                        ctx.rect(this.current.x + this.width + 20, this.current.y+120 , 300, 100);
                        ctx.stroke();


                    } else {
                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(0, 0, 255, 1)';
                        ctx.rect(this.current.x, this.current.y + this.height, 5, 5);
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
                        ctx.rect(this.current.x+5, this.current.y + 58 , 70, 70);
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(0, 0, 255,1)';
                        ctx.rect(this.current.x + 105, this.current.y + 90 , 30, 100);
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(0, 255, 0, 1)';
                        ctx.rect(this.current.x - 320, this.current.y, 300, 100);
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.strokeStyle = 'rgba(0, 255, 0, 1)';
                        ctx.rect(this.current.x - 320, this.current.y+120, 300, 100);
                        ctx.stroke();
                    }


                }                
            },

            this.shield = function(x1, y1, x2, y2) {
                if (this.trash != 0)  return false;

                if (this.current.speed > 0) {
                    return !(
                        (x1 > this.current.x+40) ||
                        (x2 < this.current.x+10) ||
                        (y1 > this.current.y+190) ||
                        (y2 < this.current.y+90)

                    );

                } else {
                    return !(
                        (x1 > this.current.x+135) ||
                        (x2 < this.current.x+105) ||
                        (y1 > this.current.y+190) ||
                        (y2 < this.current.y+90)
                    );
                }
            },

            this.fireZoneUp = function(x1, y1, x2, y2) {
                if (this.trash != 0)  return false;

                if (this.current.speed > 0) {
                    return !(
                        (x1 > this.current.x + this.width + 320) ||
                        (x2 < this.current.x + this.width + 20) ||
                        (y1 > this.current.y + 100) ||
                        (y2 < this.current.y)
                    );

                } else {
                    return !(
                        (x1 > this.current.x - 20) ||
                        (x2 < this.current.x - 320) ||
                        (y1 > this.current.y + 100) ||
                        (y2 < this.current.y)
                   );
                }

            },

            this.fireZoneDown = function(x1, y1, x2, y2) {
                if (this.trash != 0)  return false;

                if (this.current.speed > 0) {
                    return !(
                        (x1 > this.current.x + this.width + 320) ||
                        (x2 < this.current.x + this.width + 20) ||
                        (y1 > this.current.y + 220) ||
                        (y2 < this.current.y + 120)
                    );

                } else {
                    return !(
                        (x1 > this.current.x - 20) ||
                        (x2 < this.current.x - 320) ||
                        (y1 > this.current.y + 220) ||
                        (y2 < this.current.y + 120)
                   );
                }

            },

            this.hit = function(x1, y1, x2, y2) {
                if (this.trash != 0)  return false;

                if (this.current.speed > 0) {
                    return !(
                        (x1 > this.current.x+this.width+this.boundaries.right) ||
                        (x2 < this.current.x-this.boundaries.left) ||
                        (y1 > this.current.y+this.height+this.boundaries.bottom) ||
                        (y2 < this.current.y-this.boundaries.top)
                    ) || !(
                        (x1 > this.current.x+140) ||
                        (x2 < this.current.x+20) ||
                        (y1 > this.current.y+128) ||
                        (y2 < this.current.y+58)
                    );

                } else {
                    return !(
                        (x1 > this.current.x+this.width+this.boundaries.right) ||
                        (x2 < this.current.x-this.boundaries.left) ||
                        (y1 > this.current.y+this.height+this.boundaries.bottom) ||
                        (y2 < this.current.y-this.boundaries.top)
                    ) || !(
                        (x1 > this.current.x+75) ||
                        (x2 < this.current.x+5) ||
                        (y1 > this.current.y+128) ||
                        (y2 < this.current.y+58)
                    );
                }
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


                var turn = true;
                for (var i = 0; i < map.obstacles.length; i++) {

                    if (map.obstacles[i].hit) {

                        if (this.current.speed > 0) {
                            if (map.obstacles[i].hit(this.current.x + this.width, this.current.y + this.height, this.current.x + this.width + 5, this.current.y + this.height - 5)) {
                                turn = false;
                                break;
                            }
                        } else {

                            if (map.obstacles[i].hit(this.current.x, this.current.y + this.height, this.current.x - 5, this.current.y + this.height - 5)) {
                                turn = false;
                                break;
                            }
                            
                        }
                        
                    }
                }

                
                if (turn) this.current.speed = 0-this.current.speed;

                this.current.x += this.current.speed;


                if (performance.now() - this.fireTimer > 1000) {

                    if (this.fireZoneUp(mario.current.x, mario.current.y, mario.current.x+mario.width, mario.current.y+mario.height)) {
                        //console.log('up');
                        this.fireTimer = performance.now();

                        var tmp = new bowserBreath(['bowserBreath', this.current.x+(this.width/2), this.current.y-this.boundaries.top, this.current.speed / 2]);
                        map.monsters.push(tmp.me);

                        return;
                    }

                    if (this.fireZoneDown(mario.current.x, mario.current.y, mario.current.x+mario.width, mario.current.y+mario.height)) {
                        //console.log('down');
                        this.fireTimer = performance.now();

                        var tmp = new bowserBreath(['bowserBreath', this.current.x+(this.width/2), this.current.y-this.boundaries.top+50, this.current.speed / 2 ]);
                        map.monsters.push(tmp.me);

                        return;
                    }

                }


            },


            this.move = function() {

                if (this.trash != 0) return;

                if ((performance.now() - this.current.timer) > this.action[this.current.action][this.current.frame][2]) {
                   
                    this.script();

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