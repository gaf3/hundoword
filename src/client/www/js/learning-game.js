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
            this.words = hwAPI.student.focus(this.application.current.path.student_id);
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
        var words = this.application.words_array($("#select").val());
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
        this.application.words_shuffle(this.words);
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
        if ($('#sound').attr('data') == 1) {
            hwAPI.student.attain(this.it.student.id,this.it.word,this.it.achievement.id);
            $('.hw-attain').show();
        } else {
            hwAPI.student.yield(this.it.student.id,this.it.word,this.it.achievement.id);
            $('.hw-yield').show();
        }
        $('.hw-progress').hide();
    },
    match: function(start) {
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
    matched: function() {
        $('#choices li').attr('OnClick','');
        if ($('#choices li.uk-active').attr('data') == this.it.word) {
            hwAPI.student.attain(this.it.student.id,this.it.word,this.it.achievement.id);
            $('.hw-attain').show();
        } else {
            hwAPI.student.yield(this.it.student.id,this.it.word,this.it.achievement.id);
            $('.hw-yield').show();
        }
        $('.hw-progress').hide();
    },
    sight_match: function(start) {
        this.match(start);
    },
    sight_matched: function() {
        this.matched();
    },
    sound_match: function(start) {
        this.match(start);
    },
    sound_matched: function() {
        this.matched();
    },
    spell: function(start) {
        if (start) {
            this.index = -1;
        }
        if (++this.index < this.words.length) {
            this.it.word = this.it.words[this.index];
            this.it.audio = hwAPI.audio(this.it.word);
            this.application.render(this.it,this.it.achievement.name);
            $("#spell").focus();
        } else {
            this.application.go("student/history",this.it.student.id);
        }
    },
    spelled: function() {
        if ($('#spell').val().toLowerCase() == this.it.word.toLowerCase()) {
            hwAPI.student.attain(this.it.student.id,this.it.word,this.it.achievement.id);
            $('.hw-attain').show();
        } else {
            hwAPI.student.yield(this.it.student.id,this.it.word,this.it.achievement.id);
            $('.hw-yield').show();
        }
        $('.hw-progress').hide();
    },
    sight_spell: function(start) {
        this.spell(start);
    },
    sight_spelled: function() {
        this.spelled();
    },
    sound_spell: function(start) {
        this.spell(start);
    },
    sound_spelled: function() {
        this.spelled();
    }
});

Learning.template("Games",Learning.load("games"),null,Learning.partials);
Learning.template("Words",Learning.load("words"),null,Learning.partials);
Learning.template("Introduction",Learning.load("introduction"),null,Learning.partials);
Learning.template("Sight Match",Learning.load("sight-match"),null,Learning.partials);
Learning.template("Sound Match",Learning.load("sound-match"),null,Learning.partials);
Learning.template("Sight Spell",Learning.load("sight-spell"),null,Learning.partials);
Learning.template("Sound Spell",Learning.load("sound-spell"),null,Learning.partials);

Learning.route("student/games","/student/{student_id:^\\d+$}/game/","Games","Game","list");
Learning.route("student/game","/student/{student_id:^\\d+$}/game/{achievement_id:^\\d+$}/","Words","Game","words");
