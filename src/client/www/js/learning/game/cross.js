Learning.controller("Cross","Game",{
    play: function(start) {
        if (start) {
            this.index = -1;
        }
        if (++this.index < this.groups.length) {
            this.sight = (this.application.current.paths[3] == 'sight-cross');
            this.it.lefts = [];
            this.it.rights = [];
            this.it.crosses = this.groups[this.index].length;
            for (var match = 0; match < this.it.crosses; match++) {
                var row = {
                    word: this.groups[this.index][match]
                }
                this.it.lefts.push(row);
                this.it.rights.push(row);             
            }
            this.application.shuffle(this.it.rights);
            this.application.render(this.it);
            var canvas = $("#matches")[0];
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        } else {
            this.application.go("student/position",this.it.student.id);
        }
    },
    cross: function(item,sound) {
        if (sound) {
            this.audio(item,sound);
        }
        var column = $(item).attr("column");
        var word = $(item).attr('word');
        var match = $(item).attr("match");
        var other = $("#crosses li.uk-active")[0];
        if (match && other && $(other).attr("column") != $(item).attr("column")) {
            var last = $("#crosses li[column!='" + column + "'][match='" + $(item).attr('word') + "']")[0];
            if (last) {
                $(last).removeAttr("match");
                $(item).removeAttr("match");
            }
            match = false;
        } else if (other && $(other).attr("column") == $(item).attr("column")) {
            $(other).removeClass('uk-active');
        }
        if (match) {
            var last = $("#crosses li[column!='" + column + "'][match='" + word + "']")[0];
            $(last).removeAttr("match");
            $(item).removeAttr("match");
            $(last).addClass('uk-active');
        } else if (other && $(other).attr("column") != $(item).attr("column")) {
            $(other).attr("match",$(item).attr("word"));
            $(item).attr("match",$(other).attr("word"));
            $(other).removeClass('uk-active');
        } else {
            $(item).addClass('uk-active');
        }
        this.draw();
    },
    draw: function() {
        var context = $("#matches")[0].getContext("2d");
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        context.lineWidth = 1;
        $("#crosses li[column='left'][match]").each(function() {
            var left = this.getBoundingClientRect();
            var right = $("#crosses li[column='right'][match='" + $(this).attr("word") + "']")[0].getBoundingClientRect();
            context.beginPath();
            context.moveTo(left.right,left.top+0.5*left.height);
            context.lineTo(right.left,right.top+0.5*right.height);
            context.strokeStyle = '#a0a0a0';
            context.stroke();
        });
    },
    move: function(event) {
        var current = $("#crosses li.uk-active")[0];
        if (current) {
            this.draw();
            var context = $("#matches")[0].getContext("2d");
            context.lineWidth = 1;
            var from = current.getBoundingClientRect();
            context.beginPath();
            context.moveTo(from.right,from.top+0.5*from.height);
            context.lineTo(event.clientX,event.clientY);
            context.strokeStyle = '#a0a0a0';
            context.stroke();
        }
    },
    check: function() {
        var context = $("#matches")[0].getContext("2d");
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        context.lineWidth = 1;
        var matches = [];
        $("#crosses li[column='left'][match]").each(function() {
            var other = $("#crosses li[column='right'][word='" + $(this).attr("match") + "']")[0];
            var left = this.getBoundingClientRect();
            var right = other.getBoundingClientRect();
            var color = '#d32c46';
            if ($(this).attr('word') == $(other).attr('word')) {
                matches.push($(this).attr('word'));
                color = '#82bb42';
            }
            context.strokeStyle = color;
            $(this).find('a').css('color',color);
            $(other).find('a').css('color',color);
            context.beginPath();
            context.moveTo(left.right,left.top+0.5*left.height);
            context.lineTo(right.left,right.top+0.5*right.height);
            context.stroke();
        });
        $("#crosses li:not([match]) a").css('color','#d32c46');
        for (var index = 0; index < this.it.lefts.length; index++) {
            var word = this.it.lefts[index].word;
            if ($.inArray(word,matches) > -1) {
                hwAPI.student.attain(this.it.student.id,word,this.it.achievement.id);
            } else {
                hwAPI.student.yield(this.it.student.id,word,this.it.achievement.id);
            }
        }
        var transform = "rotate(" + -180 * (1 - matches.length / this.it.crosses)  + "deg)";
        $('.hw-complete').css({
            "webkitTransform":transform,
            "MozTransform":transform,
            "msTransform":transform,
            "OTransform":transform,
            "transform":transform
        });
        $('.hw-complete').show();
        $('.hw-progress').hide();
    }
});

Learning.template("Cross",Learning.load("game/cross"),null,Learning.partials);

Learning.route("game/sight-cross","/student/{student_id:^\\d+$}/game/sight-cross/","Cross","Cross","choose");
Learning.route("game/sound-cross","/student/{student_id:^\\d+$}/game/sound-cross/","Cross","Cross","choose");