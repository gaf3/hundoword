Learning.controller("Learn","Changeable",{
    learn: function() {
        this.it.learn = [];
        for (var achievement = 0; achievement < this.it.achievements.length; achievement++) {
            if (($.inArray(this.it.achievements[achievement].id,this.application.took) == -1) &&
                (!('forgo' in this.it.student.plan) || 
                ($.inArray(this.it.achievements[achievement].id,this.it.student.plan.forgo) == -1))) {
                this.it.learn.push(this.it.achievements[achievement]);
            }
        }
    },
    play: function() {
        this.it = {
            student: hwAPI.student.select(this.application.current.path.student_id),
            achievements: hwAPI.achievement.list()
        };
        if ('required' in this.it.student.plan && this.it.student.plan.required.length) {
            var evaluate = true;
            if ('took' in this.application) {
                JSON.stringify(this.application.took);
                for (var required = 0; required < this.it.student.plan.required.length; required++) {
                    if ($.inArray(this.it.student.plan.required[required],this.application.took) == -1) {
                        evaluate = false;
                    }
                }
            }
            if (evaluate) {
                this.application.took = [];
                this.it.evaluate = hwAPI.student.evaluate(this.application.current.path.student_id);
            } else {
                this.it.evaluate = {
                    focus: this.it.student.focus,
                    learned: hwAPI.student.learned(this.application.current.path.student_id),
                    blurred: [],
                    focused: []
                };
            }
            this.learn();
        } else {
            this.it.evaluate = {
                focus: this.it.student.focus,
                learned: [],
                blurred: [],
                focused: []
            };
            this.it.learn = this.it.achievements;
        }
        this.application.render(this.it);
    },
    words: function() {
        this.assessing = false;
        var student = hwAPI.student.select(this.application.current.path.student_id);
        this.words = student.focus.length > 0 ? student.focus : student.words;
        this.it = {
            student: student,
            achievement: hwAPI.achievement.slug(Learning.current.paths[3]),
            words: this.words
        };
        this.application.shuffle(this.words);
        this.it.words = this.words;
        this.groups = [];
        for (var word = 0; word < this.words.length; word++) {
            var group = Math.floor(word/6.0);
            if (!this.groups[group]) {
                this.groups[group] = [];
            }
            this.groups[group].push(this.words[word]);
        }
        this.next(true);
    },
    assess: function() {
        this.it = {
            student: hwAPI.student.select(this.application.current.path.student_id),
            achievements: hwAPI.achievement.list()
        };
        this.application.render(this.it);
    },
    choose: function() {
        this.assessing = true;
        var student = hwAPI.student.select(this.application.current.path.student_id);
        this.words = student.focus;
        this.it = {
            student: hwAPI.student.select(this.application.current.path.student_id),
            achievement: hwAPI.achievement.slug(Learning.current.paths[3]),
            words: this.words
        };
        this.application.render(this.it,"Words");
    },
    select: function() {
        var words = this.application.words_array($("#select").val());
        for (var word = 0; word < words.length; word++) {
            $("#words li[word=" + words[word] + "]").addClass("uk-active");
        }
        $("#select").val('');
    },
    focus: function() {
        this.clear();
        for (var word = 0; word < this.it.student.focus.length; word++) {
            $("#words li[word=" + this.it.student.focus[word] + "]").addClass("uk-active");
        }
    },
    all: function() {
        for (var word = 0; word < this.it.student.words.length; word++) {
            $("#words li[word=" + this.it.student.words[word] + "]").addClass("uk-active");
        }
    },
    clear: function() {
        $("#words li.uk-active").removeClass("uk-active");
    },
    toggle: function(word) {
        if ($(word).hasClass("uk-active")) {
            $(word).removeClass("uk-active");
        } else {
            $(word).addClass("uk-active");
        }
    },
    chosen: function() {
        this.words = $("#words li.uk-active").map(function(){return $(this).attr("word");}).get();
        this.application.shuffle(this.words);
        this.it.words = this.words;
        this.groups = [];
        for (var word = 0; word < this.words.length; word++) {
            var group = Math.floor(word/6.0);
            if (!this.groups[group]) {
                this.groups[group] = [];
            }
            this.groups[group].push(this.words[word]);
        }
        this.next(true);
    },
    audio: function(item,sound) {
        if (sound.readyState > 0) {
            sound.play();
            return;
        }
        var word = $(item).attr("word");
        try {
            var audio = hwAPI.audio(word);
            $(sound).find(".hw-mp3").attr('src',audio.mp3);
            $(sound).find(".hw-ogg").attr('src',audio.ogg);
            sound.autoplay = true;
            sound.load();
            if (this.sight == true) {
                $(item).find('a').html(word);
            }
        } catch (exception) {
            $(item).find('a').html(word);
        }
        $(sound).attr('played',true);
    },
    finish: function() {
        if (this.application.current.paths[2] == "assess") {
            this.application.go("student/assess",this.it.student.id);
        } else if (this.application.current.paths[2] == "play") {
            this.application.took.push(this.it.achievement.id);
            this.application.go("student/play",this.it.student.id);
        }
    }
});

Learning.template("Play",Learning.load("learn/play"),null,Learning.partials);
Learning.template("Assess",Learning.load("learn/assess"),null,Learning.partials);
Learning.template("Words",Learning.load("learn/words"),null,Learning.partials);

Learning.route("student/play","/student/{student_id:^\\d+$}/play/","Play","Learn","play");
Learning.route("student/assess","/student/{student_id:^\\d+$}/assess/","Assess","Learn","assess");

