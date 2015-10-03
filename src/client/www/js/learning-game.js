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
    clear: function(word) {
        $("#words li.uk-active").removeClass("uk-active");
    },
    toggle: function(word) {
        if ($(word).hasClass("uk-active")) {
            $(word).removeClass("uk-active");
        } else {
            $(word).addClass("uk-active");
        }
    }
});

Learning.template("Games",Learning.load("games"),null,Learning.partials);
Learning.template("Words",Learning.load("words"),null,Learning.partials);

Learning.route("student/games","/student/{student_id:^\\d+$}/game/","Games","Game","list");
Learning.route("student/game","/student/{student_id:^\\d+$}/game/{achievement_id:^\\d+$}/","Words","Game","words");
