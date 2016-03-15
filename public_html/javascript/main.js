        Number.prototype.between = function(a, b) {
            var min = Math.min.apply(Math, [a, b]),
            max = Math.max.apply(Math, [a, b]);
            return this >= min && this <= max;
        };

        String.prototype.substitute = function(search, replacement) {
            var target = this;
            return target.replace(new RegExp(search, 'g'), replacement);
        };

        String.prototype.lpad = function(padstr, length) {
            var str = this;           
            while (str.length < length) str = padstr + str;
            return str;
        }

        var startTimer = 0;
        var pauseTimer = 0;
        var currentTimer = 0;

        var gameover = false;
        var startMap = 5;
        var startPos = 'E2';
        var pause = true;
        var loadedMap = [];
        var board;
        var ctx;
        var background;
        var keyboard = [];
        var show_bondaries = false;
        var pattern = [];
        var img = [
            'images/mario.png',
            'images/mario-background.jpg',
            'images/tiles_spritesheet.png',
            'images/hud_spritesheet.png',
            'images/items_spritesheet.png',
            'images/enemies_spritesheet.png',
            'images/enemies.png',
            'images/cave.jpg',
            'images/bricks.jpg',
            'images/bg-princess.jpg',
        ];

        var music_theme = new Audio('musics/intro.mp3');
        music_theme.volume = 0.03;
        music_theme.loop = true;
        music_theme.play();

        
        var sounds = {
            'coin' : { 'volume' : 0.05, 'src' : 'sounds/smb3_coin.wav' },
            'live' : { 'volume' : 0.05, 'src' : 'sounds/smb3_1-up.wav' },
            'break' : { 'volume' : 0.05, 'src' : 'sounds/smb3_break_brick_block.wav' },
            'enter' : { 'volume' : 0.05, 'src' : 'sounds/smb3_enter_level.wav' },
            'fireball' : { 'volume' : 0.05, 'src' : 'sounds/smb3_fireball.wav' },
            'gameover' : { 'volume' : 0.05, 'src' : 'sounds/smb3_game_over.wav' },
            'jump' : { 'volume' : 0.05, 'src' : 'sounds/smb3_jump.wav' },
            'key' : { 'volume' : 0.05, 'src' : 'sounds/smb3_key.wav' },
            'exit' : { 'volume' : 0.05, 'src' : 'sounds/smb3_map_new_world.wav' },
            'pause' : { 'volume' : 0.05, 'src' : 'sounds/smb3_pause.wav' },
            'pipe' : { 'volume' : 0.05, 'src' : 'sounds/smb3_pipe.wav' },
            'loser' : { 'volume' : 0.05, 'src' : 'sounds/smb3_player_down.wav' },
            'dead' : { 'volume' : 0.05, 'src' : 'sounds/loser.mp3' },
            'powerup' : { 'volume' : 0.05, 'src' : 'sounds/smb3_power-up.wav' },
            'door' : { 'volume' : 0.05, 'src' : 'sounds/smb3_door.wav' },
        };

        var createPattern = function(ctx, img, x, y, width, height) { 
            
            var pattern_canvas = document.createElement('canvas');
            var pattern_context = pattern_canvas.getContext('2d');

            pattern_canvas.width = width;
            pattern_canvas.height = height;

            pattern_context.drawImage(img, x, y, width, height, 0, 0, width, height);

            final_pattern = ctx.createPattern(pattern_canvas, "repeat");

            return final_pattern;
        }

        function playSound(key) {
            var obj = sounds[key];

            var source = audio.createBufferSource();
            source.buffer = obj.buffer;

            // create a gain node
            obj.gainNode = audio.createGain();

            // connect the source to the gain node
            source.connect(obj.gainNode);

            // set the gain (volume)
            obj.gainNode.gain.value = obj.volume;

            // connect gain node to destination
            obj.gainNode.connect(audio.destination);

            // play sound
            source.start(0);
        }

        function loadSoundObj(obj) {

            var loadFromGitHub = 'https://raw.githubusercontent.com/mboulette/mariomaze/master/public_html/'
            //var loadFromGitHub = '';

            var request = new XMLHttpRequest();
            request.open('GET', loadFromGitHub + obj.src, true);
            request.responseType = 'arraybuffer';

            request.onload = function() {
                audio.decodeAudioData(request.response, function(buffer) {
                    obj.buffer = buffer;
                }, function(err) {
                    throw new Error(err);
                });
            }

            request.send();
        }
        /*
        var loadSound = function () {

            // iterate over sounds obj
            for (i in sounds) {
                if (sounds.hasOwnProperty(i)) {
                  // load sound
                  loadSoundObj(sounds[i]);
                }
            }

        }*/

        var loadSound = function myself (id) {

            if (id >= Object.keys(sounds).length) {

                $('progress').hide();
                $('#begin').show();

            } else {
                key = Object.keys(sounds)[id];

                if (sounds.hasOwnProperty(key)) {
                    obj = sounds[key];

                    var loadFromGitHub = 'https://raw.githubusercontent.com/mboulette/mariomaze/master/public_html/'
                    //var loadFromGitHub = '';

                    var request = new XMLHttpRequest();
                    request.open('GET', loadFromGitHub + obj.src, true);
                    request.responseType = 'arraybuffer';

                    request.onload = function() {
                        audio.decodeAudioData(request.response, function(buffer) {
                            obj.buffer = buffer;

                            myself(id);

                        }, function(err) {
                            throw new Error(err);
                        });
                    }

                    request.send();

                }

                id++;
                $('progress').val($('progress').val()+1);
            }
        };

        var loadImg = function myself (img_id) {
            if (img_id >= img.length) {

                /*
                map.loadMap(maps[startMap], startPos);
                music_theme.src = map.theme;
                music_theme.play();
                main();
                */
                loadSound(0);


            } else {
                src = img[img_id];

                img[img_id] = new Image();
                img[img_id].src = src;

                img[img_id].onload = function() {
                    myself(img_id);
                }.bind(img_id);

                img_id++;
                $('progress').val(img_id);
            }
        };


        var fireAmmo = function(x, y, dir) {

            this.trash = 0;
            this.gravity = 2,
            this.width = 40,
            this.height = 40,
            this.img = img[0];

            this.current = {
                'timer' : 0,
                'x' : x,
                'y' : y,
                'frame' : 0,
                'speed' : 25,
                'dir' : dir,
                'action' : 'burn',
            },

            this.action = {
                'burn' : [
                [(this.width * 1), 240, 25],
                [(this.width * 2), 240, 25],
                [(this.width * 3), 240, 25],
                [(this.width * 4), 240, 25],
                [(this.width * 5), 240, 25]
                ]
            },

            this.boundaries = {
                'left' : -2,
                'right' : -2,
                'top' : -8,
                'bottom' : -8,
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

                x = this.action[this.current.action][this.current.frame][0];
                y = this.action[this.current.action][this.current.frame][1];

                ctx.save();
                if ( (this.current.dir == -1) ) {
                    ctx.translate(this.current.x + (this.width/2), 0);
                    ctx.scale(-1, 1);
                    ctx.translate(0 - (this.current.x + (this.width/2)), 0);
                }
                
                ctx.drawImage(this.img, x, y, this.width, this.height, this.current.x, this.current.y, this.width, this.height);
                ctx.restore();
                
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

            this.script = function() {
                
                turn = false;
                for (var i = 0; i < map.monsters.length; i++) {
                    
                    if (map.monsters[i].shield && map.monsters[i].shield(this.current.x, this.current.y, this.current.x+this.width, this.current.y+this.height)) {
                        this.trash = 1;
                        return;
                    }

                    if (map.monsters[i].hit(this.current.x, this.current.y, this.current.x+this.width, this.current.y+this.height)) {
                        this.trash = 1;
                        map.monsters[i].die();
                    }
                }

            },

            this.move = function() {

                this.script();

                this.current.x += (this.current.speed * this.current.dir);
                this.current.y += this.gravity;
                this.current.speed--;
                
                this.nextframe();

                if (this.current.speed <= 0) this.trash = 1;
            }

        };  

        var player = function() {

            this.invincible = false;
            this.kill = 0,
            this.ammos = 100,
            this.lives = 3,
            this.coins = 0,
            this.keys = 2,
            this.width = 46,
            this.height = 90,
            this.speed = 5,
            this.leap = -14,
            this.gravity = 0.5,
            this.friction = 0.5,
            this.countStars = 0;
            this.invincibleTimer = performance.now();
            this.dying = 0;

            this.current = {
                'x'         : 0,
                'y'         : 0,
                'velX'      : 0,
                'velY'      : 0,
                'running'   : 1,
                'jumping'   : 0,
                'grounding' : 0,
                'climbing' : 0,
                'action'    : 'wait',
                'timer'     : performance.now(),
                'frame'     : 0,
                'face'      : 'right',
                'moving'    : 0,
            },

            this.boundaries = {
                'left' : -12,
                'top' : -7,
            },

            this.action = {

                'wait'  : [[490, 0, 800], [560, 0, 200], [630, 0, 800], [560, 0, 200] ],                                                                    //attendre
                'walk'  : [[0, 0, 50], [70, 0, 50], [140, 0, 50], [210, 0, 50], [280, 0, 50], [350, 0, 50], [420, 0, 50], [350, 0, 50] ],                   //marcher
                'run'   : [[0, 0, 20], [70, 0, 20], [140, 0, 20], [210, 0, 20], [280, 0, 20], [350, 0, 20], [420, 0, 20], [350, 0, 20] ],                   //courrir
                'jump'  : [[0, 100, 50], [70, 100, 1000], 'fall'],                                                                                          //sauter
                'fall'  : [[0, 0, 100], [210, 101, -1] ],                                                                                                   //tomber
                'land'  : [[0, 100, 100], [290, 100, 100], 'wait' ],                                                                                          //Atterrir
                'stoop' : [[280, 100, -1] ],                                                                                                                //se baisser
                'getup' : [[0, 0, 200], 'wait'],                                                                                                            //se lever 
                'throw' : [[630, 100, 20], [770, 100, 50], [910, 100, 20], [1050, 100, 50]],

                'climbwait' : [[350, 100, -1]],
                'climb' : [[350, 100, 100], [420, 100, 50], [490, 100, 100], [560, 100, 50]],
            },

            this.draw = function() {
                
                ctx.save();

                x = this.action[this.current.action][this.current.frame][0];
                y = this.action[this.current.action][this.current.frame][1];


                if (this.dying == 1) {
                    ctx.globalCompositeOperation = 'difference';
                    x = this.action['fall'][1][0];
                    y = this.action['fall'][1][1];
                }


                if ( (this.current.face == 'left') ) {
                    ctx.translate(this.current.x + (this.width/2), 0);
                    ctx.scale(-1, 1);
                    ctx.translate(0 - (this.current.x + (this.width/2)), 0);
                }

                ctx.drawImage(img[0], x, y, 70, 100, this.current.x+this.boundaries.left, this.current.y+this.boundaries.top, 70, 100);


                if (show_bondaries) {

                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
                    ctx.rect(this.current.x, this.current.y, this.width, this.height);
                    ctx.stroke();
                }
                

                

                ctx.restore();

                if (this.invincible) {
                    
                    if (performance.now() - this.invincibleTimer > 50) {
                        this.countStars++;
                        if (this.countStars > 4) this.countStars = 0;
                        this.invincibleTimer = performance.now();
                    }

                    //console.log(this.countStars);
                    var rnd = Math.floor((Math.random() * 4) + 1);
                    ctx.save();
                    if (this.countStars % 2) ctx.globalCompositeOperation = 'color-burn';
                    if ( (this.current.face == 'left') ) {
                        ctx.translate(this.current.x + (this.width/2), 0);
                        ctx.scale(-1, 1);
                        ctx.translate(0 - (this.current.x + (this.width/2)), 0);
                    }
                    ctx.drawImage(img[0], x, y, 70, 100, this.current.x+this.boundaries.left, this.current.y+this.boundaries.top, 70, 100);
                    ctx.restore();

                    ctx.save();
                    ctx.drawImage(img[0], (4+this.countStars)*72, 3*72, 70, 70, this.current.x-10, this.current.y+28+rnd, 70, 70);
                    ctx.restore();
                }
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


            this.previewX = function() {                   
                return this.current.x + this.current.velX + this.friction;
            },

            this.previewY = function() {
                return this.current.y + this.current.velY + this.gravity;
            },

            this.die = function () {
                
                if (!this.invincible) {
                                        
                    

                    keyboard = [];
                    map.projectiles = [];

                    pause=true;
                    mario.dying = 1;

                    for (var i = 0; i < map.monsters.length; i++) { 
                        map.monsters[i].wait();
                    }

                    if (this.lives == 0) {
                        $('#gameOverbox').show();
                        playSound('gameover');
                        overlay.start(true);
                        gameover = true;

                    } else {
                        playSound('dead');
                        this.lives--;
                        mario.dying = 1;
                        overlay.toogle();

                    }

                }

            },

            this.move = function () {

                if (this.current.velX > 0) {
                    this.current.velX -= this.friction;
                    this.current.face = 'right';
                }
                if (this.current.velX < 0) {
                    this.current.velX += this.friction;
                    this.current.face = 'left';
                }

                if (this.current.velY < Math.abs(this.leap)+1 ) this.current.velY += this.gravity;

                this.current.x += this.current.velX;
                this.current.y += this.current.velY;

                if (this.current.y > map.height) {
                    this.invincible = false;
                    this.die();
                }

            }


        };


        var update = function() {

            mario.current.moving = 0;
            for (var i = 0; i < map.monsters.length; i++) {
                map.monsters[i].move();
            }

            for (var i = 0; i < map.projectiles.length; i++) {
                map.projectiles[i].move();
            }

            mario.nextframe();

            next_action = 'wait';

            if (keyboard[67] && mario.ammos > 0) { //x (shoot)

                stoop = (keyboard[40]) ? 20 : 0;

                if (mario.current.face == 'right') { 
                    var tmp = new fireAmmo(mario.current.x+mario.width, mario.current.y+20+stoop, 1);
                } else {
                    var tmp = new fireAmmo(mario.current.x, mario.current.y+20+stoop, -1);
                }

                map.projectiles.push(tmp);
                mario.ammos--;
                playSound('fireball');
                keyboard[67] = false;
            }

            if (keyboard[40]) { //down arrow
                next_action = 'stoop';
            }

            if (keyboard[18] || keyboard[90]) { // alt
                mario.current.running = 1 + (3/5);
            } else {
                mario.current.running = 1;
            }

            if (keyboard[39]) { // right arrow
                if (mario.current.velX < mario.speed * mario.current.running) {
                    mario.current.velX++;
                }
                next_action = 'walk';
                if (mario.current.running > 1) next_action = 'run';
            }

            if (keyboard[37]) { // left arrow
                if (mario.current.velX > -mario.speed * mario.current.running) {
                    mario.current.velX--;
                }
                next_action = 'walk';
                if (mario.current.running > 1) next_action = 'run';
            }

            if (keyboard[38] || keyboard[32] || keyboard[88]) { // up arrow or space
                if (!mario.current.jumping && mario.current.grounding) {
                    mario.current.jumping = 1;
                    if ( mario.current.climbing != 1)  {
                        mario.current.velY = mario.leap - mario.current.running;
                    } else {
                       mario.current.velY = -3; 
                    }  
                }
                
            }

            if ( mario.current.grounding == 0) next_action = 'fall';
            if ( mario.current.jumping == 1 && mario.current.velY < 0) next_action = 'jump';

            if ( mario.current.climbing == 1) {
                //console.log(next_action);
                if (next_action == 'wait') {
                    next_action = 'climbwait';
                } else {
                   next_action = 'climb';
                } 
            }


            if (mario.current.action != next_action) {
                mario.current.action = next_action;
                mario.current.frame = 0;


                switch(next_action) {
                    case 'jump':
                        playSound('jump');
                        break;
                    default:
                }

            }


            mario.move();

        };


        var collision = function() {

            mario.current.grounding = 0;
            mario.current.climbing = 0;

            for (var i = 0; i < map.monsters.length; i++) {
                map.monsters[i].collision(mario);
            }

            for (var i = 0; i < map.obstacles.length; i++) {
                map.obstacles[i].collision(mario);
            }

            for (var i = 0; i < map.items.length; i++) {
                map.items[i].collision(mario);
            }
        };


        var render = function() {
            

            ctx.save();

            ctx.clearRect(0, 0, board.width, board.height);

            
            var translation = { 'x' : map.translation.x, 'y' : map.translation.y};

            if (mario.current.x > board.width/2) {
                translation.x += ((board.width/2) - mario.current.x)/10;
            }
            if (mario.current.y > board.height/2) {
                translation.y += ((board.height/2) - mario.current.y)/10; 
            }

            
            ctx.translate(translation.x, translation.y);
            ctx.rect(0, 0, board.width-translation.x, board.height-translation.y);
            ctx.fillStyle = background;
            ctx.fill();

            ctx.restore();
            ctx.save();

            if (mario.current.x > board.width/2) {
                ctx.translate(Math.max((board.width/2) - mario.current.x, board.width-map.width), 0);
            }

            var translation = 0;
            if (mario.current.y > board.height/2) {
                translation = Math.max((board.height/2) - mario.current.y, board.height-map.height);               
            } 
            if (mario.current.action == "stoop") {
                translation = Math.max(translation-100, board.height - map.height);
            }
            ctx.translate(0, translation);

            map.draw();
            mario.draw();


            ctx.restore();

            drawFrame();


            overlay.draw();

        };

        var drawFrame = function() {

            ctx.save();
            ctx.globalAlpha = 0.8;

            ctx.beginPath();
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.rect(0, 0, board.width, 30);
            ctx.stroke();
            ctx.fill();
                        
            ctx.font = '14pt Comic Sans MS';
            ctx.fillStyle = '#FFFFFF';//'rgba(255, 255, 255, 1)';
            ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
            ctx.lineWidth = 5;

            ctx.font = '10pt Comic Sans MS';
            ctx.textAlign="left";

            curTimer = new Date(currentTimer);
            strTimer = curTimer.getUTCHours().lpad('0', 2) + ":" + curTimer.getUTCMinutes().lpad('0', 2) + ":" + curTimer.getUTCSeconds().lpad('0', 2) + ":" + Math.floor(curTimer.getUTCMilliseconds()/100).lpad('0', 2);
            //ctx.fillText("x:"+Math.floor((mario.current.x+mario.height)/70)+", y:"+Math.floor(mario.current.y/70), 10, 18);
            ctx.fillText(strTimer, 10, 18);

            ctx.font = '14pt Comic Sans MS';
            ctx.textAlign="center";
            ctx.strokeText(map.name, board.width/2, 22);
            ctx.fillText(map.name, board.width/2, 22);
            

            ctx.textAlign="right";
            ctx.strokeText(mario.lives+' x', board.width-70, 22);
            ctx.fillText(mario.lives+' x', board.width-70, 22);
            ctx.drawImage(img[3], 0, 93, 53, 47, board.width-64, 4, 53/2, 47/2);

            ctx.strokeText(mario.keys+' x', board.width-170, 22);
            ctx.fillText(mario.keys+' x', board.width-170, 22);
            ctx.drawImage(img[3], 146, 189, 44, 40, board.width-164, 5, 44/2, 40/2);

            ctx.strokeText(mario.ammos+' x', board.width-270, 22);
            ctx.fillText(mario.ammos+' x', board.width-270, 22);
            ctx.drawImage(img[0], 0, 240, 40, 40, board.width-268, 2, 25, 25);   

            ctx.strokeText(mario.coins+' x', board.width-370, 22);
            ctx.fillText(mario.coins+' x', board.width-370, 22);
            ctx.drawImage(img[0], 200, 200, 40, 40, board.width-364, 3, 23, 23);   
            
            ctx.restore();

        };

        var overlays = function() {
            this.timer = 0;
            this.action = 'reduce';
            this.frame = 0;

            this.start = function(growing) {
                this.timer = performance.now();
                this.action = 'reduce';
                if(growing) this.action = 'grow';
                this.frame = 0;
            };

            this.toogle = function() {
                
                this.start(true);

                setTimeout(function(object){ 
                    mario.current.velX = 0;
                    mario.current.velY = 0;
                    mario.current.x = map.start.x;
                    mario.current.y = map.start.y;
                    mario.dying = 0;

                    music_theme.src = map.theme;
                    music_theme.play();

                    overlay.start(false);
                    pause=false;

                }, 400, this);

            }

            this.draw = function() {
                
                if ((performance.now() - this.timer) > 10 && this.frame < 10) {
                    this.frame++;
                    this.timer = performance.now();
                }

                if (this.action == 'reduce') {
                    dim = ((10-this.frame) * 0.1);
                    pos = (this.frame * 0.1) * 0.5;
                } else {
                    dim = (this.frame * 0.1);
                    pos = ((10-this.frame) * 0.1) * 0.5;
                }
                ctx.save();
                ctx.beginPath();
                ctx.rect(board.width*pos, board.height*pos, board.width*dim, board.height*dim);
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fill();

                ctx.restore();
            };

        };


        var reset = function() {
            if ($('progress').val() == 24) {

                startTimer = performance.now();

                $('#gameOverbox').hide();
                $('#beginbox').hide();
                $('#youWinbox').hide();
                loadedMap = [];

                mario = new player();
                map = new level();

                map.loadMap(maps[startMap], startPos);
                music_theme.src = map.theme;
                music_theme.play();
                gameover = false;

                main();
                overlay.start(false);
                pause = false;

            }
        }

        var main = function() {

            if (performance.now() - timer > 5) { 

                if (!pause) {

                    currentTimer = performance.now() - startTimer;

                    collision();
                    update();
                }                
                
                render();

                timer = performance.now();
               
                map.clean();
            }

            if (!gameover) requestAnimationFrame(main);
        };

        var pause_game = function() {
            pause = !pause;
            music_theme.muted = pause;

            if (pause) {
                pauseTimer = performance.now();
            }else {
                startTimer += performance.now() - pauseTimer;
            }

            overlay.start(pause);            
        }

        $( document ).ready(function() {

            board = $('canvas')[0];
            ctx = board.getContext('2d');
            audio = new AudioContext();


            timer = performance.now();
            overlay = new overlays();
            
            loadImg(0);
            //loadSound();

            $(document).on('keydown', function (e) {
                keyboard[e.which] = true;

                if (e.which == '13') {
                    reset();
                }

                if (e.which == '80') {
                    playSound('pause');
                    pause_game();
                }
                return false;
            });

            $(document).on('keyup', function (e) {
                keyboard[e.which] = false;
                return false;
            });

            $(window).on('focus', function (e) {
                pause_game();
            });

            $(window).on('blur', function (e) {
                if (pause==false) pause_game();
            });





        });
