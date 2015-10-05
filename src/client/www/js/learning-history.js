Learning.controller("History","Changeable",{
    list: function() {
        this.it = {
            student: hwAPI.student.select(this.application.current.path.student_id),
            achievements: hwAPI.achievement.list(),
            achievement_names: {}
        };
        for (var achievement = 0; achievement < this.it.achievements.length; achievement++) {
            this.it.achievement_names[this.it.achievements[achievement].id] = this.it.achievements[achievement].name;
        }
        var words = null;
        if (this.application.current.query.words) {
            words = this.words_array(this.application.current.query.words);
        }
        var achievements = null;
        if (this.application.current.query.achievements) {
            achievements = this.words_array(this.application.current.query.achievements);
        }
        var from = null;
        if (this.application.current.query.from) {
            from = this.application.current.query.from;
        }
        var to = null;
        if (this.application.current.query.to) {
            to = this.application.current.query.to;
        }
        this.it.history = hwAPI.student.history(this.application.current.path.student_id,words,achievements,from,to);
        this.application.render(this.it);
    },
    toggle: function(achievement) {
        if ($(achievement).hasClass("uk-active")) {
            $(achievement).removeClass("uk-active");
        } else {
            $(achievement).addClass("uk-active");
        }
        this.search();
    },
    search: function() {
        var parameters = {};
        var words = $("#words").val();
        if (words.length) {
            parameters["words"] = this.words_array(words).join(",");
        }
        var achievements = $("#achievements li.uk-active").map(function(){return $(this).attr("data");}).get();;
        if (achievements.length) {
            parameters["achievements"] = achievements.join(",");
        }
        var from = $("#from").val();
        if (from) {
            parameters["from"] = from;
        }
        var to = $("#to").val();
        if (to) {
            parameters["to"] = to;
        }
        if ($.isEmptyObject(parameters)) {
            this.application.go('student/history',this.application.current.path.student_id);
        } else {
            this.application.go('student/history',this.application.current.path.student_id,parameters);
        }
    }
});

Learning.template("History",Learning.load("history"),null,Learning.partials);

Learning.route("student/history","/student/{student_id:^\\d+$}/history/","History","History","list");

