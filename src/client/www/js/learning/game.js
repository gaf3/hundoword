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
        var words = hwAPI.student.focus(this.application.current.path.student_id);
        for (var word = 0; word < words.length; word++) {
            $("#words li[word=" + words[word] + "]").addClass("uk-active");
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
        this.words = $("#words li.uk-active").map(function(){return $(this).attr("word");}).get();
        this.application.words_shuffle(this.words);
        this.it.words = this.words;
        this.groups = [];
        for (var word = 0; word < this.words.length; word++) {
            var group = Math.floor(word/6.0);
            if (!this.groups[group]) {
                this.groups[group] = [];
            }
            this.groups[group].push(this.words[word]);
        }
        this.play(true);
    },
    audio: function(word) {
        try {
            return hwAPI.audio(word);
        } catch (exception) {
            return {};
        }
    }
});

Learning.template("Games",Learning.load("game/list"),null,Learning.partials);
Learning.template("Words",Learning.load("game/words"),null,Learning.partials);

Learning.route("student/games","/student/{student_id:^\\d+$}/game/","Games","Game","list");