Learning.controller("Student","Changeable",{
    list: function() {
        students: hwAPI.student.list($.proxy(this.listed,this));
    },
    listed: function(students) {
        this.it = {students: students};
        this.application.render(this.it);
    },
    select: function() {
        hwAPI.student.select(this.application.current.path.student_id,$.proxy(this.selected,this));
    },
    selected: function(student) {
        this.it = {student: student};
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
            hwAPI.student.update(student_id,student,$.proxy(this.updated,this));
        } else {
            hwAPI.student.create(student,$.proxy(this.created,this));
        }
    },
    updated: function(student) {
        this.it = {student: student};
        this.application.render(this.it);
    }, 
    created: function(student) {
        this.application.go('student/select',student.id);
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
            hwAPI.student.delete(this.application.current.path.student_id,$.proxy(this.deleted,this));
        }
    },
    deleted: function() {
        this.application.go('student');
    },
    position: function() {
        hwAPI.student.select(this.application.current.path.student_id,$.proxy(this.position_selected,this));
    },
    position_selected: function(student) {
        this.it = {student: student};
        hwAPI.achievement.list($.proxy(this.position_achievements,this));
    },
    position_achievements: function(achievements) {
        this.it.achievements = achievements;
        if (this.application.current.query.words) {
            hwAPI.student.position(this.application.current.path.student_id,this.words_array(this.application.current.query.words),$.proxy(this.positioned,this));
        } else {
            hwAPI.student.position(this.application.current.path.student_id,null,$.proxy(this.positioned,this));
        }
    },
    positioned: function(positions) {
        this.it.positions = positions
        this.application.render(this.it);
    },
    position_change: function(event) {
        event.preventDefault();
        var word = $(event.target).data("word");
        var achievement = $(event.target).data("achievement");
        if ($(event.target).prop("checked")) {
            hwAPI.student.attain(this.application.current.path.student_id,word,achievement,$.proxy(this.position_changed,this));
        } else {
            hwAPI.student.yield(this.application.current.path.student_id,word,achievement,$.proxy(this.position_changed,this));
        }
    },
    position_changed: function(position) {
        $("[data-word='" + position.word + "'][data-achievement='" + position.achievement + "']").prop("checked",position.hold);
    },
    position_search: function() {
        this.application.go('student/position',this.application.current.path.student_id,{words: this.words_array($("#words").val()).join(",")});
    }
});

Learning.partial("StudentTabs",Learning.load("student-tabs"));

Learning.template("Students",Learning.load("students"),null,Learning.partials);
Learning.template("Student",Learning.load("student"),null,Learning.partials);
Learning.template("Position",Learning.load("position"),null,Learning.partials);

Learning.route("student","/student/","Students","Student","list");
Learning.route("student/select","/student/{student_id:^\\d+$}/","Student","Student","select");
Learning.route("student/new","/student/new/","Student","Student","new");
Learning.route("student/position","/student/{student_id:^\\d+$}/position/","Position","Student","position");
Learning.route("student/progress","/student/{student_id:^\\d+$}/progress/","Student","Student","select");
Learning.route("student/chart","/student/{student_id:^\\d+$}/chart/","Student","Student","select");
Learning.route("student/games","/student/{student_id:^\\d+$}/games/","Student","Student","select");
