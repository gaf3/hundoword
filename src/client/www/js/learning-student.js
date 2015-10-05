Learning.controller("Student","Changeable",{
    list: function() {
        this.it = {students: hwAPI.student.list()};
        this.application.render(this.it);
    },
    select: function() {
        this.it = {student: hwAPI.student.select(this.application.current.path.student_id)};
        this.application.render(this.it);
    },    
    new: function() {
        this.it = {student: {}};
        this.application.render(this.it);
        this.changing();
    },
    edit: function() {
        this.changing();
    },
    save: function() {
        var student_id = $("#student_id").val();
        var student = {
            first_name: $("#first_name").val(), 
            last_name: $("#last_name").val(), 
            age: $("#age").val(),
            words: this.words_array($("#words").val())
        };
        if (student_id) {
            this.it = {student: hwAPI.student.update(student_id,student)};
        } else {
            this.it = {student: hwAPI.student.create(student)};
        }
        this.application.render(this.it);
    },
    cancel: function() {
        var student_id = $("#student_id").val();
        if (student_id) {
            this.selecting();
        } else {
            this.application.go('student');
        }
    },
    delete: function() {
        if (confirm("Are you sure?") == true) {
            hwAPI.student.delete(this.application.current.path.student_id);
            this.application.go('student');
        }
    },
    position: function() {
        this.it = {
            student: hwAPI.student.select(this.application.current.path.student_id),
            achievements: hwAPI.achievement.list()
        };
        var words = null;
        if (this.application.current.query.words) {
            words = this.words_array(this.application.current.query.words);
        }
        var focus = null;
        if (this.application.current.query.focus) {
            focus = this.application.current.query.focus.toLowerCase() == 'true';
        }
        this.it.positions = hwAPI.student.position(this.application.current.path.student_id,words,focus);
        this.application.render(this.it);
    },
    position_search: function() {
        var parameters = {};
        var words = $("#words").val();
        if (words.length) {
            parameters["words"] = this.words_array(words).join(",");
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
    },
    history: function() {
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
    history_toggle: function(achievement) {
        if ($(achievement).hasClass("uk-active")) {
            $(achievement).removeClass("uk-active");
        } else {
            $(achievement).addClass("uk-active");
        }
        this.history_search();
    },
    history_search: function() {
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

Learning.partial("StudentTabs",Learning.load("student-tabs"));

Learning.template("Students",Learning.load("students"),null,Learning.partials);
Learning.template("Student",Learning.load("student"),null,Learning.partials);
Learning.template("Position",Learning.load("position"),null,Learning.partials);
Learning.template("History",Learning.load("history"),null,Learning.partials);

Learning.route("student","/student/","Students","Student","list");
Learning.route("student/select","/student/{student_id:^\\d+$}/","Student","Student","select");
Learning.route("student/new","/student/new/","Student","Student","new");
Learning.route("student/position","/student/{student_id:^\\d+$}/position/","Position","Student","position");
Learning.route("student/history","/student/{student_id:^\\d+$}/history/","History","Student","history");
Learning.route("student/chart","/student/{student_id:^\\d+$}/chart/","Student","Student","select");
