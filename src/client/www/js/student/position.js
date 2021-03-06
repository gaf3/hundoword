Learning.controller("Position","Changeable",{
    list: function() {
        this.it = {
            student: hwAPI.student.select(this.application.current.path.student_id),
            achievements: hwAPI.achievement.list()
        };
        var words = null;
        if (this.application.current.query.words) {
            words = this.application.words_array(this.application.current.query.words);
        }
        var focus = null;
        if (this.application.current.query.focus) {
            focus = this.application.current.query.focus.toLowerCase() == 'true';
        }
        this.it.positions = hwAPI.student.position(this.application.current.path.student_id,words,focus);
        this.it.words = words !== null ? words : this.it.student.words;
        this.application.render(this.it);
    },
    search: function() {
        var parameters = {};
        var words = $("#words").val();
        if (words.length) {
            parameters["words"] = this.application.words_array(words).join(",");
        }
        if ($("#focus").prop("checked")) {
            parameters["focus"] = "true";
        }
        if ($.isEmptyObject(parameters)) {
            this.application.go('student/position',this.application.current.path.student_id);
        } else {
            this.application.go('student/position',this.application.current.path.student_id,parameters);
        }
    },
    progress: function(event,word,achievement) {
        if ($(event.target).prop("checked")) {
            hwAPI.student.attain(this.application.current.path.student_id,word,achievement);
        } else {
            hwAPI.student.yield(this.application.current.path.student_id,word,achievement);
        }
    },
    focus: function(event,word) {
        if ($(event.target).prop("checked")) {
            hwAPI.student.focus(this.application.current.path.student_id,[word]);
        } else {
            hwAPI.student.blur(this.application.current.path.student_id,[word]);
        }
    }
});

Learning.template("Position",Learning.load("student/position"),null,Learning.partials);

Learning.route("student/position","/student/{student_id:^\\d+$}/position/","Position","Position","list");

