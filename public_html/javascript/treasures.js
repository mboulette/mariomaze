

        var treasures =  function(param) {

            this.trash = 0,
            this.width = 40,
            this.height = 40,
            this.panH = 0,
            this.panV = 200,
            this.img = img[0],

            this.current = {
                'x' : param[1],
                'y' : param[2],
                'frame' : 0,
                'action' : 'flip',
                'timer' : performance.now(),
            },

            this.boundaries = {
                'left' : -6,
                'right' : -6,
                'top' : -4,
                'bottom' : -4,
            },

            this.action = {
                'flip' : [
                [this.panH + (this.width * 0), this.panV, 2000],
                [this.panH + (this.width * 1), this.panV, 75],
                [this.panH + (this.width * 2), this.panV, 75],
                [this.panH + (this.width * 3), this.panV, 75],
                [this.panH + (this.width * 4), this.panV, 75],
                [this.panH + (this.width * 5), this.panV, 75]
                ],
            },

            this.nextframe = function () {

                if ((performance.now() - this.current.timer) > this.action[this.current.action][this.current.frame][2] && this.action[this.current.action][this.current.frame][2] != -1) {

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
            },

            this.draw = function(ctx) {

                if (this.trash == 1) return;

                ctx.save();
                x = this.action[this.current.action][this.current.frame][0];
                y = this.action[this.current.action][this.current.frame][1];


                if (this.trash > 1)  {
                    this.trash++;
                    this.current.y = this.current.y-10;
                    ctx.globalAlpha = 1-this.trash/30;

                    if (this.trash >= 30) this.trash = 1;
                }

                ctx.drawImage(this.img, x, y, this.width, this.height, this.current.x, this.current.y, this.width, this.height);
                ctx.restore();
                this.drawBondaries(ctx);


                this.nextframe();
            },

            this.drawBondaries = function(ctx) {
                if (show_bondaries && this.trash == 0) {
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
                    this.trash = 2;
                    this.bonus(object);
                }
            },

            this.bonus = function(object) {
                object.coins++;
                playSound('coin');
            }
        };


        var coins = function(param) {
            this.me = new treasures(param);
            this.me.current.x += 16
            this.me.current.y += 14
        };

        var ammos = function(param) {
            this.me = new treasures(param);
            this.me.width = 40;
            this.me.height = 40;
            this.me.current.x += 15;
            this.me.current.y += 14;
            this.me.img = img[0];
            this.me.current.action = 'burn';
            //this.me.action.burn = [[3, 240, 75], [0, 240, 75], [3, 240, 75], [-2, 240, 75], ];
            
            this.me.action = {
                'burn' : [
                [(this.me.width * 1), 240, 150],
                [(this.me.width * 2), 240, 150],
                [(this.me.width * 3), 240, 150],
                [(this.me.width * 4), 240, 150],
                [(this.me.width * 5), 240, 150]
                ],
            };

            this.me.drawFlame = function(ctx) {

                if (this.trash == 1) return;

                ctx.save();

                if (this.trash > 1)  {
                    this.trash++;
                    this.current.y = this.current.y-10;
                    ctx.globalAlpha = 1-this.trash/30;

                    if (this.trash >= 30) this.trash = 1;
                }

                x = this.action[this.current.action][this.current.frame][0];
                y = this.action[this.current.action][this.current.frame][1];

                ctx.translate(this.current.x+(this.width/2), this.current.y+(this.height/2));
                ctx.rotate(Math.PI/2);

                ctx.drawImage(this.img, x, y, this.width, this.height, 0-this.width/2-6, 0-this.height/2-4, this.width+8, this.height+8);
                
                ctx.restore();

                this.drawBondaries(ctx);
                this.nextframe();
            };

            this.me.draw = function(ctx) {
                this.drawFlame(ctx);
            };

            this.me.bonus = function(object) {
                object.ammos++;
                playSound('key');
            };

        };


        var torches = function(param) {

            tmp = new decorations(['decorations', param[1], param[2], 70, 70, 2, 1, 1]);
            map.items.push(tmp);

            param[2] -= 30;
            ammo = new ammos(param);
            this.me = ammo.me;

        };


        var hearts = function(param) {
            this.me = new treasures(param);
            this.me.width = 53;
            this.me.height = 47;
            this.me.current.x += 9;
            this.me.current.y += 11;
            this.me.img = img[3];
            this.me.current.action = 'pulse';
            this.me.action.pulse = [[3, 0, 2000], [0, 0, 75], [3, 0, 75], [-2, 0, 75], ];

            this.me.draw = function(ctx) {

                if (this.trash == 1) return;

                ctx.save();

                if (this.trash > 1)  {
                    this.trash++;
                    this.current.y = this.current.y-10;
                    ctx.globalAlpha = 1-this.trash/30;

                    if (this.trash >= 30) this.trash = 1;
                }

                pulse = this.action[this.current.action][this.current.frame][0];

                ctx.drawImage(this.img, 0, 92, this.width, this.height, this.current.x+pulse, this.current.y+pulse, this.width-(pulse*2), this.height-(pulse*2));
                
                ctx.restore();

                this.drawBondaries(ctx);
                this.nextframe();
            };

            this.me.bonus = function(object) {
                object.lives++; 
                playSound('live');
            };

        };

        
        var stars = function(param) {
            this.me = new treasures(param);
            this.me.width = 60;
            this.me.height = 60;
            this.me.current.x += 5;
            this.me.current.y += 0;
            this.me.img = img[0];
            this.me.current.action = 'glow';
            this.me.action.glow = [[0, 280, 2000], [60, 280, 75], [120, 280, 75], [180, 281, 75], [120, 280, 75], [60, 280, 75], ];
            this.me.glowTimer = performance.now();

            this.me.draw = function(ctx) {

                if (this.trash == 1) return;

                ctx.save();

                if (this.trash > 1)  {
                    this.trash++;
                    this.current.y -= 10;
                    ctx.globalAlpha = 1-this.trash/30;

                    if (this.trash >= 30) this.trash = 1;
                }

                glow = this.action[this.current.action][this.current.frame];
                ctx.drawImage(this.img, glow[0], glow[1], this.width, this.height, this.current.x, this.current.y, this.width, this.height);
                ctx.restore();

                //console.log(performance.now() - this.glowTimer);
                if (performance.now() - this.glowTimer > 100) {
                    ctx.save();
                    ctx.globalCompositeOperation = 'color-burn';
                    ctx.drawImage(this.img, glow[0], glow[1], this.width, this.height, this.current.x, this.current.y, this.width, this.height);
                    ctx.restore();

                    this.glowTimer = performance.now();                
                } 


                this.drawBondaries(ctx);
                this.nextframe();
            };

            this.me.bonus = function(object) {
                object.invincible = true;
                playSound('powerup');

                music_theme.src = 'musics/invincible.mp3';
                music_theme.play();

                setTimeout(function(object){ 
                    object.invincible = false;

                music_theme.src = map.theme;
                music_theme.play();

                }, 20000, object);
            };

        };
        

        var diamons = function(param) {
            this.me = new treasures(param);
            this.me.width = 46;
            this.me.height = 38;
            this.me.current.x += 15;
            this.me.current.y += 14;
            this.me.img = img[3];
            this.me.current.action = 'pulse';
            this.me.action.pulse = [[4, 0, 50], [2, 0, 50], [0, 0, 500], [-2, 0, 50], [-4, 0, 50], [-2, 0, 50], [0, 0, 50], [2, 0, 50] ];

            this.me.draw = function(ctx) {

                if (this.trash == 1) return;

                ctx.save();

                if (this.trash > 1)  {
                    this.trash++;
                    this.current.y = this.current.y-10;
                    ctx.globalAlpha = 1-this.trash/30;

                    if (this.trash >= 30) this.trash = 1;
                }

                pulse = this.action[this.current.action][this.current.frame][0];

                ctx.drawImage(this.img, 104, 0, this.width, this.height, this.current.x, this.current.y+pulse, this.width, this.height);
                
                ctx.restore();

                this.drawBondaries(ctx);
                this.nextframe();
            };

            this.me.bonus = function(object) {
                object.coins += 10; 
                setTimeout(function(){ playSound('coin'); }, 100);
                setTimeout(function(){ playSound('coin'); }, 200);
                setTimeout(function(){ playSound('coin'); }, 300);
                setTimeout(function(){ playSound('coin'); }, 400);
                setTimeout(function(){ playSound('coin'); }, 500);

            };

        };


        var keys = function(param) {
            this.me = new treasures(param);
            this.me.width = 44;
            this.me.height = 40;
            this.me.current.x += 14;
            this.me.current.y += 14;
            this.me.img = img[3];
            this.me.current.action = 'blink';
            this.me.action.blink = [[146, 189, 1000], [192, 80, 50], [147, 80, 50], [146, 189, 50], [192, 80, 50], [147, 80, 50], ];

            this.me.draw = function(ctx) {

                if (this.trash == 1) return;

                ctx.save();

                if (this.trash > 1)  {
                    this.trash++;
                    this.current.y = this.current.y-10;
                    ctx.globalAlpha = 1-this.trash/30;

                    if (this.trash >= 30) this.trash = 1;
                }

                x = this.action[this.current.action][this.current.frame][0];
                y = this.action[this.current.action][this.current.frame][1];

                ctx.drawImage(this.img, 146, 189, this.width, this.height, this.current.x, this.current.y, this.width, this.height);
                ctx.drawImage(this.img, x, y, this.width, this.height, this.current.x, this.current.y, this.width, this.height);
                
                ctx.restore();
                this.drawBondaries(ctx);
                this.nextframe();
            };

            this.me.bonus = function(object) {
                object.keys++;
                playSound('key');
            };

        };

        var surprises = function(param) {
            this.me = new treasures(param);
            this.me.img = img[2];
            this.me.width = 70;
            this.me.height = 70;
            this.me.current.action = 'blink';
            this.me.action.blink = [[0, 0, 400], [0.2, 0, 100], [0.4, 0, 100], [0.8, 0, 100], [1, 0, 400], [0.8, 0, 100], [0.4, 0, 100], [0.2, 0, 100], ];
            this.me.choc = 0;
            this.me.price = 0;

            this.rndItem = function() {
                nbitem = [1,1,1,1,1,2,2,2,3,3,3,4,4,5,6,7,8,9,10][Math.floor(Math.random()*18)];
                items = [];

                for (var i = 0; i < nbitem; i++) {
                    chance = Math.floor(Math.random() * 200);
                    switch(true) {
                        case (chance > 197) :
                            items.push('hearts');
                            break;
                        case (chance > 190) :
                            items.push('stars');
                            break;
                        case (chance > 180) :
                            items.push('keys');
                            break;
                        default:
                            items.push('coins');
                    }
                }

                return items;
            };

            this.me.rndItem = this.rndItem();

            this.me.hit = function(x1, y1, x2, y2) {
                return !((y2 < this.current.y) || (y1 > this.current.y+this.height) || (x1 > this.current.x+this.width) || (x2 < this.current.x));
            };

            this.me.draw = function(ctx) {

                if (this.trash == 1) return;

                ctx.drawImage(this.img, 0, 4*72, this.width, this.height, this.current.x, this.current.y+this.choc, this.width, this.height);

                ctx.save();         
                ctx.globalAlpha = this.action[this.current.action][this.current.frame][0];
                ctx.drawImage(this.img, 0, 5*72, this.width, this.height, this.current.x, this.current.y+this.choc, this.width, this.height);
                ctx.restore();

                this.drawBondaries(ctx);

                this.nextframe();
                this.choc = (this.choc == 0) ? 0 : this.choc+5;
            };

            this.me.loadEmptyBloc = function() {
                this.trash = 1;
                tmp = new boxes(['boxes', this.current.x, this.current.y, this.width, this.height, 2, 0, 3]);
                if (tmp.me) tmp = tmp.me;
                tmp.choc = -20;
                map.items.push(tmp);    
            };

            this.me.hitH = function(object) {

                x1 = object.previewX(); y1 = object.current.y; x2 = object.previewX() + object.width; y2 = object.current.y + object.height;

                if (this.hit(x1, y1, x2, y2)) {

                    if (object.current.velX > 0) {
                        object.current.x = this.current.x-object.width-1;
                    }

                    if (object.current.velX < 0) {
                        object.current.x = this.current.x+this.width+1;
                    }

                    object.current.velX = 0;

                }
            };

            this.me.debit = function(object) {
                if (object.coins >= this.price) {
                    object.coins -= this.price;
                }
            };

            this.me.hitV = function(object) {

                x1 = object.current.x; y1 = object.previewY(); x2 = object.current.x + object.width;  y2 = object.previewY() + object.height;

                if (this.hit(x1, y1, x2, y2)) {

                    if ((object.current.velY < 0) && (object.current.y-object.current.velY > this.current.y+this.height) && (object.coins >= this.price)) {

                        items = this.rndItem.shift();
                        this.debit(object);

                        tmp = new window[items]([items, 0, 0]);
                        if (tmp.me) tmp = tmp.me;
                        tmp.current.x = this.current.x + (this.width/2) - (tmp.width / 2);
                        tmp.current.y = this.current.y + (this.height/2) - (tmp.height / 2);
                        tmp.trash = 2;
                        tmp.bonus(object);
                        map.items.push(tmp);

                        if(this.rndItem.length == 0) {
                            this.loadEmptyBloc();
                        }
                        this.choc = -20;
                        

                    }

                    if (object.current.velY > 0) {
                        object.current.y = this.current.y-object.height-object.gravity-1;
                        object.current.jumping = 0;
                        object.current.grounding = 1;

                    }

                    if (object.current.velY < 0) {
                        object.current.y = this.current.y+this.height+1; 
                    }

                    object.current.velY = 0;

                }
            };

            this.me.collision = function(object) {
                
                x1 = object.previewX(); y1 = object.previewY(); x2 = object.previewX() + object.width; y2 = object.previewY() + object.height;

                if (this.hit(x1, y1, x2, y2)) {
                    this.hitH(object);
                    this.hitV(object);
                }
            };

        };


        var surpriseBlock = function(param) {
            surp = new surprises(param);
            this.me = surp.me;

            this.me.loadEmptyBloc = function() {
                this.trash = 1;
                tmp = new brickwall(['brickwall', this.current.x, this.current.y]);
                if (tmp.me) tmp = tmp.me;
                tmp.choc = -20;
                map.items.push(tmp);    
            };

            this.me.draw = function(ctx) {

                if (this.trash == 1) return;

                ctx.drawImage(this.img, 3*72, 0, this.width, this.height, this.current.x, this.current.y+this.choc, this.width, this.height);

                this.drawBondaries(ctx);

                this.nextframe();
                this.choc = (this.choc == 0) ? 0 : this.choc+5;
            };

        };


        var openDoors = function(param) {
            this.me = new treasures(param);
            this.me.img = img[2];
            this.me.width = 70;
            this.me.height = 70;
            this.me.exit = param[3];

            this.me.draw = function(ctx) {

                if (this.trash == 1) return;

                ctx.drawImage(this.img, 9*72, 3*72, this.width, this.height, this.current.x, this.current.y-69, this.width, this.height);
                ctx.drawImage(this.img, 9*72, 4*72, this.width, this.height, this.current.x, this.current.y, this.width, this.height);
                this.drawBondaries(ctx);
                this.nextframe();      
            };

            this.me.loadNewMap = function(object) {
                loadedMap[map.id] = $.extend({}, map);

                keyboard = [];
                object.current.velX = 0;
                object.current.velY = 0; 
                map.projectiles = [];   

                pause=true;
                overlay.start(true);
                playSound('exit');

                setTimeout(function(door){ 

                    if (loadedMap[map.exits[door.exit]['map']]) {
                        
                        pos = map.exits[door.exit]['pos'];
                        map = loadedMap[map.exits[door.exit]['map']];
                        background = ctx.createPattern(img[map.background], "repeat"); 

                        object.current.x = map.exits[pos]['x'];
                        object.current.y = map.exits[pos]['y'];
                        map.start.x = map.exits[pos]['x'];
                        map.start.y = map.exits[pos]['y'];

                        for (var i = 0; i < map.monsters.length; i++) { 
                            map.monsters[i].wait();
                        }


                    } else {
                        
                        map.obstacles = [];
                        map.monsters = [];
                        map.items = [];
                        map.projectiles = [];

                        map.loadMap(maps[map.exits[door.exit]['map']], map.exits[door.exit]['pos']);                       
                    }

                    if (!mario.invincible) {
                        music_theme.src = map.theme;
                        music_theme.play();                        
                    }

                    overlay.start(false);
                    pause=false;

                }, 400, this);


            };

            this.me.collision = function(object) {
                
                x1 = object.current.x; y1 = object.current.y; x2 = object.current.x + object.width; y2 = object.current.y + object.height;

                if (this.hit(x1, y1, x2, y2) && (keyboard[38] || keyboard[40])) {
                    
                    keyboard = [];

                    this.loadNewMap(object);



                }
            };

        };


        var hiddenDoors = function(param) {
            var door = new openDoors(param);
            this.me = door.me;
            this.me.current.x += 35;
            this.me.current.y -= 30;

            this.me.boundaries.top = -90;
            this.me.boundaries.bottom = 30;
            this.me.boundaries.left = 0;
            this.me.boundaries.right = 0;

            this.me.draw = function(ctx) {
                
                if (show_bondaries) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(0, 255, 0, 0.7)';
                    ctx.rect(this.current.x, this.current.y, this.width, this.height);
                    ctx.stroke();
                    ctx.beginPath();
                }

                this.drawBondaries(ctx);    
            };

            this.me.collision = function(object) {
                
                x1 = object.current.x; y1 = object.current.y; x2 = object.current.x + object.width; y2 = object.current.y + object.height;

                if (this.hit(x1, y1, x2, y2) && (keyboard[40])) {
                    keyboard = [];
                    this.loadNewMap(object);
                }
            };

        };

        var lockDoors = function(param) {
            this.me = new treasures(param);
            this.me.img = img[2];
            this.me.width = 70;
            this.me.height = 70;
            this.me.exit = param[3];

            this.me.draw = function(ctx) {

                if (this.trash == 1) return;

                ctx.drawImage(this.img, 9*72, 5*72, this.width, this.height, this.current.x, this.current.y-69, this.width, this.height);
                ctx.drawImage(this.img, 9*72, 6*72, this.width, this.height, this.current.x, this.current.y, this.width, this.height);
                this.drawBondaries(ctx);
                this.nextframe();      
            };

            this.me.collision = function(object) {
                
                x1 = object.current.x; y1 = object.current.y; x2 = object.current.x + object.width; y2 = object.current.y + object.height;

                if (this.hit(x1, y1, x2, y2)  && (keyboard[38] || keyboard[40]) && object.keys > 0) {
                    
                    keyboard = [];
                    playSound('door');

                    this.trash = 1;
                    object.keys--;
                    
                    tmp = new openDoors(['openDoors', this.current.x, this.current.y, this.exit]);
                    if (tmp.me) tmp = tmp.me;
                    map.items.push(tmp);

                    //tmp.loadNewMap(object);

                }
            };

        };

        var shopLives = function(param) {
            surprise = new surprises(param);
            this.me = surprise.me;
            this.me.price = 200;
            this.me.rndItem = ['hearts', 'hearts', 'hearts', 'hearts', 'hearts', 'hearts', 'hearts', 'hearts', 'hearts', 'hearts'];

            this.me.loadEmptyBloc = function() {
                this.trash = 1;
                tmp = new boxes(['boxes', this.current.x, this.current.y, this.width, this.height, 2, 0, 11]);
                if (tmp.me) tmp = tmp.me;
                tmp.choc = -20;
                map.items.push(tmp);
            };

            this.me.drawItem = function(ctx) {
                ctx.drawImage(img[3], 0, 92, 53, 47, this.current.x+9, this.current.y+12+this.choc, 53, 47);
            };

            this.me.draw = function(ctx) {

                if (this.trash == 1) return;

                ctx.drawImage(this.img, 0*72, 6*72, this.width, this.height, this.current.x, this.current.y+this.choc, this.width, this.height);
                this.drawItem(ctx);

                ctx.save();         
                ctx.globalAlpha = this.action[this.current.action][this.current.frame][0];
                if (mario.coins >= this.price) {
                    ctx.drawImage(this.img, 0*72, 8*72, this.width, this.height, this.current.x, this.current.y+this.choc, this.width, this.height);
                } else {
                    ctx.drawImage(this.img, 0*72, 7*72, this.width, this.height, this.current.x, this.current.y+this.choc, this.width, this.height);  
                }
                ctx.restore(); 

                ctx.save();
                ctx.font = '12pt Comic Sans MS';
                ctx.fillStyle = 'rgba(255, 255, 255, 1)';
                ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
                ctx.lineWidth = 4;
                ctx.textAlign="center";
                ctx.strokeText("Acheter", this.current.x + (this.width / 2), this.current.y-10);
                ctx.fillText("Acheter", this.current.x + (this.width / 2), this.current.y-10);

                ctx.drawImage(img[0], 200, 200, 40, 40, this.current.x+42, this.current.y+this.height+2, 23, 23);
                
                ctx.font = '10pt Comic Sans MS';
                ctx.textAlign="left";
                ctx.strokeText(this.price + " x", this.current.x+8, this.current.y+this.height + 18);
                ctx.fillText(this.price + " x", this.current.x+8, this.current.y+this.height + 18);
                ctx.restore();
                

                this.drawBondaries(ctx);

                this.nextframe();
                this.choc = (this.choc == 0) ? 0 : this.choc+5;
            };

        };

        var shopAmmos = function(param) {
            shopLive = new shopLives(param);
            this.me = shopLive.me;
            this.me.price = 20;
            this.me.rndItem = ['ammos'];

            this.me.debit = function(object) {

                this.rndItem.push('ammos');

                if (object.coins >= this.price) {
                    object.coins -= this.price;
                }
            };

            this.me.drawItem = function(ctx) {
                ctx.drawImage(img[0], 0, 240, 40, 40, this.current.x+13, this.current.y+12+this.choc, 47, 47);
            };
        };

        var shopKeys = function(param) {
            shopLive = new shopLives(param);
            this.me = shopLive.me;
            this.me.price = 100;
            this.me.rndItem = ['keys', 'keys', 'keys', 'keys', 'keys', 'keys', 'keys', 'keys', 'keys', 'keys'];

            this.me.drawItem = function(ctx) {
                ctx.drawImage(img[3], 146, 189, 44, 40, this.current.x+12, this.current.y+17+this.choc, 44, 40);
            };

        };

        var brickwall = function(param) {
            surprise = new surprises(param);
            this.me = surprise.me;
            this.me.current.action = 'explode';
            this.me.action.explode = [[0, 0, 200]];

            this.me.draw = function(ctx) {

                ctx.save();

                if (this.trash == 1) return;

                if (this.trash > 1) {
                    this.trash++;
                    this.current.y = this.current.y-5;
                    ctx.globalAlpha = 1-this.trash/20;

                    if (this.trash >= 20) this.trash = 1;

                    x = this.current.x+(this.width/2);
                    y = this.current.y+(this.height/2);

                    for (var i = 0; i < 10; i++) { 
                        panH = (this.width/2) - Math.floor(Math.random()*this.width);
                        panV = (this.height/2) - Math.floor(Math.random()*this.width);

                        ctx.drawImage(img[4], 0, 553, 20, 20, x+panH, y+panV, 20, 20)
                    }

                } else {

                    ctx.drawImage(this.img, 3*72, 0, this.width, this.height, this.current.x, this.current.y, this.width, this.height);
                }

                ctx.restore();

                this.drawBondaries(ctx);

                this.nextframe();
            };

            this.me.hitV = function(object) {

                x1 = object.current.x; y1 = object.previewY(); x2 = object.current.x + object.width;  y2 = object.previewY() + object.height;

                if (this.hit(x1, y1, x2, y2)) {

                    if ((object.current.velY < 0) && (object.current.y-object.leap > this.current.y+this.height)) {
                        this.trash = 2;
                        playSound('break');
                    }

                    if (object.current.velY > 0) {
                        object.current.y = this.current.y-object.height-object.gravity-1;
                        object.current.jumping = 0;
                        object.current.grounding = 1;
                    }

                    if (object.current.velY < 0) {
                        object.current.y = this.current.y+this.height+1; 
                    }

                    object.current.velY = 0;

                }
            };

        };


        var hiddenBlock = function(param) {
            this.me = new treasures(param);
            this.me.width = 70;
            this.me.height = 70;

            this.me.draw = function(ctx) {
                this.drawBondaries(ctx);
            };

            this.me.hitV = function(object) {

                x1 = object.current.x; y1 = object.previewY(); x2 = object.current.x + object.width;  y2 = object.previewY() + object.height;

                if (this.hit(x1, y1, x2, y2)) {

                    if ((object.current.velY < 0) && (object.current.y-object.leap > this.current.y+this.height)) {
                        this.trash = 1;

                        tmp = new boxes(['boxes', this.current.x, this.current.y, this.width, this.height, param[3], param[4], param[5]]);
                        if (tmp.me) tmp = tmp.me;
                        map.items.push(tmp); 

                        object.current.y = this.current.y+this.height+1;
                        object.current.velY = 0;

                    }

                }
            };

            this.me.collision = function(object) {
                
                x1 = object.previewX(); y1 = object.previewY(); x2 = object.previewX() + object.width; y2 = object.previewY() + object.height;

                if (this.hit(x1, y1, x2, y2)) {
                    this.hitV(object);
                }
            };

        };


        var autoExit = function(param) {
            var door = new openDoors(param);
            
            this.me = door.me;
            this.me.current.x += 35;
            this.me.current.y += 10;

            this.me.boundaries.top = 25;
            this.me.boundaries.bottom = -75;
            this.me.boundaries.left = 0;
            this.me.boundaries.right = 0;

            this.me.draw = function(ctx) {
                
                if (show_bondaries) {
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(0, 255, 0, 0.7)';
                    ctx.rect(this.current.x, this.current.y, this.width, this.height);
                    ctx.stroke();
                }

                this.drawBondaries(ctx);    
            };

            this.me.collision = function(object) {
                
                x1 = object.current.x; y1 = object.current.y; x2 = object.current.x + object.width; y2 = object.current.y + object.height;

                if (this.hit(x1, y1, x2, y2)) {
                    keyboard = [];
                    this.loadNewMap(object);
                }
            };

        };

        var exit = function(param) {
            this.me = new treasures(param);
            this.me.img = img[2];
            this.me.width = 70;
            this.me.height = 70;
            this.me.exit = param[3];

            this.me.draw = function(ctx) {

                if (this.trash == 1) return;

                if (param[3] == 'E>') { 
                    ctx.drawImage(this.img, 4*72, 3*72, this.width, this.height, this.current.x, this.current.y, this.width, this.height);
                } else { 
                    ctx.drawImage(this.img, 4*72, 4*72, this.width, this.height, this.current.x, this.current.y, this.width, this.height);
                }

                ctx.save();
                ctx.font = 'bold 18pt Comic Sans MS';
                ctx.fillStyle = '#CFA67C';
                ctx.strokeStyle = '#A06D3D';
                ctx.lineWidth = 2;

                ctx.textAlign="center";
                ctx.strokeText('SORTIE', this.current.x + (this.width / 2)-1, this.current.y + (this.height / 2)-1, 58);
                ctx.fillText('SORTIE', this.current.x + (this.width / 2), this.current.y + (this.height / 2), 58);
                ctx.restore();

                this.drawBondaries(ctx);    
            };

            this.me.loadNewMap = function(object) {
                loadedMap[map.id] = $.extend({}, map);

                keyboard = [];
                object.current.velX = 0;
                object.current.velY = 0; 
                map.projectiles = [];   

                pause=true;
                overlay.start(true);
                playSound('exit');

                setTimeout(function(door){ 

                    if (loadedMap[map.exits[door.exit]['map']]) {
                        
                        pos = map.exits[door.exit]['pos'];
                        map = loadedMap[map.exits[door.exit]['map']];
                        background = ctx.createPattern(img[map.background], "repeat"); 

                        object.current.x = map.exits[pos]['x'];
                        object.current.y = map.exits[pos]['y'];
                        map.start.x = map.exits[pos]['x'];
                        map.start.y = map.exits[pos]['y'];

                        for (var i = 0; i < map.monsters.length; i++) { 
                            map.monsters[i].wait();
                        }

                    } else {
                        
                        map.obstacles = [];
                        map.monsters = [];
                        map.items = [];
                        map.projectiles = [];

                        map.loadMap(maps[map.exits[door.exit]['map']], map.exits[door.exit]['pos']);

                    }

                    if (!mario.invincible) {
                        music_theme.src = map.theme;
                        music_theme.play();                        
                    }

                    overlay.start(false);
                    pause=false;

                }, 400, this);


            };

            this.me.collision = function(object) {
                
                x1 = object.current.x; y1 = object.current.y; x2 = object.current.x + object.width; y2 = object.current.y + object.height;

                if (this.hit(x1, y1, x2, y2)) {
                    keyboard = [];
                    this.loadNewMap(object);
                }
            };

        };




        var movingPlatform =  function(param) {
            ele = new elevators(param);
            this.me = ele;

            this.me.hitV = function(object) {

                x1 = object.current.x; y1 = object.previewY() + object.height; x2 = object.current.x + object.width;  y2 = object.previewY() + object.height;

                if (this.hit(x1, y1, x2, y2)) {
                 
                    if (object.current.velY > 0 && object.current.y+object.height > this.current.y+this.boundaries.top) {

                        object.current.y = this.current.y-object.height-this.boundaries.top-object.gravity-1;
                        object.current.jumping = 0;
                        object.current.grounding = 1;

                        object.current.velY = 0;
                    }

                }
            },

            this.me.move = function() {

                
                x1 = mario.current.x; y1 = mario.current.y + mario.height; x2 = mario.current.x + mario.width;  y2 = mario.current.y + mario.height+5;
                if (this.hit(x1, y1, x2, y2)) {
                    if (mario.current.moving == 0) {
                        mario.current.x += this.speed;
                        mario.current.moving += this.speed;   
                    }
                    
                } 
                this.current.x += this.speed;
                this.current.move -= this.speed;

                if (Math.abs(this.current.move) >= (this.maxMove * 69) || this.current.move == 0) {

                    this.speed = 0-this.speed;
                }



            }

        };


        var ladders = function(param) {

            this.trash = 0,
            this.width = 70,
            this.height = 70,
            this.img = img[2],

            this.current = {
                'x' : param[1],
                'y' : param[2],
                'timer' : performance.now(),
            },

            this.boundaries = {
                'left' : -20,
                'right' : -20,
                'top' : -5,
                'bottom' : -5,
            },


            this.draw = function(ctx) {

                if (this.trash == 1) return;

                ctx.drawImage(this.img, 7*72, 2*72, this.width, this.height, this.current.x, this.current.y, this.width, this.height);

                this.drawBondaries(ctx);
            },

            this.drawBondaries = function(ctx) {
                if (show_bondaries && this.trash == 0) {
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

            /*
            this.hitV = function(object) {

                x1 = object.current.x; y1 = object.previewY() + object.height; x2 = object.current.x + object.width;  y2 = object.previewY() + object.height + this.speed;

                if (this.hit(x1, y1, x2, y2)) {
                 
                    if (object.current.velY > 0 && object.current.y+object.height > this.current.y+this.boundaries.top) {

                        object.current.y = this.current.y-object.height-this.boundaries.top-object.gravity-1;
                        object.current.jumping = 0;
                        object.current.grounding = 1;

                        object.current.velY = 0;
                    }

                }
            },
            */

            this.hitV = function(object) {

                //x1 = object.current.x; y1 = object.previewY() + object.height; x2 = object.current.x + object.width;  y2 = object.previewY() + object.height;
                //if (this.hit(x1, y1, x2, y2)) {
                 
                    if (object.current.velY >= 0) {
                        if (object.current.velY != 0) object.current.y = object.current.y - object.gravity;
                        object.current.velY = 0;
                        
                        if (keyboard[40]) object.current.velY = 3;

                        object.current.jumping = 0;
                        object.current.grounding = 1;
                        object.current.climbing = 1;
                        
                    }

                    if (object.current.velY < 0) {
                        object.current.jumping = 0;
                        object.current.grounding = 1;
                        object.current.climbing = 1;

                    }

                //}
            },

            this.collision = function(object) {
                
                x1 = object.previewX(); y1 = object.previewY(); x2 = object.previewX() + object.width; y2 = object.previewY() + object.height;

                if (this.hit(x1, y1, x2, y2)) {
                    this.hitV(object);
                }
            }
        };


        var laddersEnd =  function(param) {

            tmp = new ladders(['ladders', param[1], param[2]+5, 70, 70, 2, 7, 2]);
            map.items.push(tmp);

            tmp = new decorations(['decorations', param[1], param[2], 70, 70, 2, 7, 7]);
            map.obstacles.push(tmp);

            ele = new elevators(param);
            this.me = ele;

            this.me.current.y -= 60;

            this.me.boundaries = {
                'left' : -2,
                'right' : -2,
                'top' : -60,
                'bottom' : -2,
            },

            this.me.draw = function(ctx) {

                if (this.trash == 1) return;

                ctx.drawImage(this.img, 72*7, 72*1, this.width, 30, this.current.x, this.current.y+40, this.width, 30);

                this.drawBondaries(ctx);
            },

            this.me.hitV = function(object) {

                x1 = object.current.x; y1 = object.previewY() + object.height; x2 = object.current.x + object.width;  y2 = object.previewY() + object.height;

                if (this.hit(x1, y1, x2, y2)) {
                 
                    if (object.current.velY > 0 && object.current.y+object.height > this.current.y+this.boundaries.top) {

                        object.current.y = this.current.y-object.height-this.boundaries.top-object.gravity-1;
                        object.current.jumping = 0;
                        object.current.grounding = 1;

                        object.current.velY = 0;
                    }

                }
            }


        };


        var princess = function(param) {
            this.width = 70,
            this.height = 144,            

            this.current = {
                'x' : param[1] - 69,
                'y' : param[2],
            },

            this.die = function() {
            },

            this.wait = function() {
            },

            this.move = function() {

            },

            this.draw = function(ctx) {
                ctx.drawImage(img[0], 0, 0, this.width, this.height, this.current.x, this.current.y, this.width, this.height);
                this.drawBondaries(ctx);
            },

            this.boundaries = {
                'left' : -2,
                'right' : -2,
                'top' : -40,
                'bottom' : -2,
            },

            this.drawBondaries = function(ctx) {
                if (show_bondaries && this.trash == 0) {
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
                
                x1 = object.previewX(); y1 = object.previewY(); x2 = object.previewX() + object.width; y2 = object.previewY() + object.height;

                if (this.hit(x1, y1, x2, y2) && !keyboard[40]) {

                    console.log('You Win!');

                }
            },


        }


        var elevators = function(param) {

            this.trash = 0,
            this.width = 70,
            this.height = 70,
            this.img = img[2],
            this.maxMove = 4,
            this.speed = param[3];

            this.current = {
                'x' : param[1],
                'y' : param[2],
                'move' : 0,
                'timer' : performance.now(),
            },

            this.boundaries = {
                'left' : -2,
                'right' : -2,
                'top' : -46,
                'bottom' : -2,
            },

            this.die = function() {
            },

            this.wait = function() {
            },


            this.draw = function(ctx) {

                if (this.trash == 1) return;

                ctx.drawImage(this.img, 72*4, 72*10, this.width, this.height, this.current.x, this.current.y, this.width, this.height);

                this.drawBondaries(ctx);
            },

            this.drawBondaries = function(ctx) {
                if (show_bondaries && this.trash == 0) {
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

  

            this.hitV = function(object) {

                x1 = object.current.x; y1 = object.previewY() + object.height; x2 = object.current.x + object.width;  y2 = object.previewY() + object.height + this.speed;

                if (this.hit(x1, y1, x2, y2)) {
                 
                    if (object.current.velY > 0 && object.current.y+object.height > this.current.y+this.boundaries.top) {

                        object.current.y = this.current.y-object.height-this.boundaries.top-object.gravity-1;
                        object.current.jumping = 0;
                        object.current.grounding = 1;

                        object.current.velY = 0;
                    }

                }
            },

            this.collision = function(object) {
                
                x1 = object.previewX(); y1 = object.previewY(); x2 = object.previewX() + object.width; y2 = object.previewY() + object.height;

                if (this.hit(x1, y1, x2, y2) && !keyboard[40]) {
                    this.hitV(object);
                }
            },

            this.move = function() {

                x1 = mario.current.x; y1 = mario.current.y + mario.height; x2 = mario.current.x + mario.width;  y2 = mario.current.y + mario.height + this.speed;

                dropMario = false;
                if (this.hit(x1, y1, x2, y2)) {
                    dropMario = true;
                    if (this.speed > 0) mario.current.y += this.speed;

                }                

                this.current.y += this.speed;
                this.current.move -= this.speed;

                if (this.current.move >= (this.maxMove * 69) || this.current.move == 0) {

                    if (this.speed > 0 && dropMario) mario.current.y += this.speed;
                    this.speed = 0-this.speed;
                }



            }
        };




