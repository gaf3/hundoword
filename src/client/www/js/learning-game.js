Learning.controller("Game","Changeable",{
    list: function() {
        this.it = {
            student: hwAPI.student.select(this.application.current.path.student_id),
            achievements: hwAPI.achievement.list()
        };
        this.application.render(this.it);
    },
    words: function() {
        if (!("words" in this.words)) {
            this.words = [];
            var positions = hwAPI.student.position(this.application.current.path.student_id,null,true);
            for (var position = 0; position < positions.length; position++) {
                this.words.push(positions[position].word);
            }
        }
        this.it = {
            student: hwAPI.student.select(this.application.current.path.student_id),
            achievement: hwAPI.achievement.select(this.application.current.path.achievement_id),
            words: this.words
        };
        this.application.render(this.it);
    },
    press: function(event) {
        if (event.keyCode == 13) {
            this.select();
        }
    },
    select: function() {
        var words = this.words_array($("#select").val());
        for (var word = 0; word < words.length; word++) {
            $("#words li[data=" + words[word] + "]").addClass("uk-active");
        }
        $("#select").val('');
    },
    focus: function() {
        var positions = hwAPI.student.position(this.application.current.path.student_id,null,true);
        for (var position = 0; position < positions.length; position++) {
            $("#words li[data=" + positions[position].word + "]").addClass("uk-active");
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
    start: function() {
        this.words = $("#words li.uk-active").map(function(){return $(this).attr("data");}).get();
        this.it.words = this.words;
        this.game = this.it.achievement.name.replace(/ /,"_").toLowerCase();
        this[this.game](true);
    },
    introduction: function(start) {
        if (start) {
            this.index = -1;
        }
        if (++this.index < this.words.length) {
            this.it.word = this.it.words[this.index];
            this.it.audio = hwAPI.audio(this.it.word);
            this.application.render(this.it,this.it.achievement.name);
        } else {
            this.application.go("student/history",this.it.student.id);
        }
    },
    introduced: function() {
        hwAPI.student.attain(this.it.student.id,this.it.word,this.it.achievement.id);
        $('#next').removeClass('uk-icon-spin');
        $('#next').prop('disabled',false);
    },
    single_match: function(start) {
        if (start) {
            this.index = -1;
        }
        if (++this.index < this.words.length) {
            this.it.word = this.it.words[this.index];
            this.it.audio = hwAPI.audio(this.it.word);
            this.it.choices = [];
            while (this.it.choices.length < 8) {
                var choice = this.it.student.words[Math.floor(Math.random() * this.it.student.words.length)];
                if (choice != this.it.word) {
                    this.it.choices.push(choice);
                }
            }
            this.it.choices[Math.floor(Math.random() * this.it.student.words.length)] = this.it.word
            this.application.render(this.it,this.it.achievement.name);
        } else {
            this.application.go("student/history",this.it.student.id);
        }
    },
    single_matched: function(choice) {
        $(choice).addClass("uk-active");
        if ($(choice).attr('data') == this.it.word) {
            hwAPI.student.attain(this.it.student.id,this.it.word,this.it.achievement.id);
            $('#next').addClass('uk-button-success');
        } else {
            hwAPI.student.yield(this.it.student.id,this.it.word,this.it.achievement.id);
            $('#next i').removeClass('uk-icon-thumbs-o-up');
            $('#next i').addClass('uk-icon-thumbs-o-down');
            $('#next').addClass('uk-button-danger');
        }
        $('#next').removeClass('uk-icon-spin');
        $('#next').prop('disabled',false);
    },
    sight_match: function(start) {
        this.single_match(start);
    },
    sight_matched: function(choice) {
        this.single_matched(choice);
    },
    sound_match: function(start) {
        this.single_match(start);
    },
    sound_matched: function(choice) {
        this.single_matched(choice);
    }
});

Learning.template("Games",Learning.load("games"),null,Learning.partials);
Learning.template("Words",Learning.load("words"),null,Learning.partials);
Learning.template("Introduction",Learning.load("introduction"),null,Learning.partials);
Learning.template("Sight Match",Learning.load("sight-match"),null,Learning.partials);
Learning.template("Sound Match",Learning.load("sound-match"),null,Learning.partials);

Learning.route("student/games","/student/{student_id:^\\d+$}/game/","Games","Game","list");
Learning.route("student/game","/student/{student_id:^\\d+$}/game/{achievement_id:^\\d+$}/","Words","Game","words");
