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
    }
});

Learning.template("Students",Learning.load("students"),null,Learning.partials);
Learning.template("Student",Learning.load("student"),null,Learning.partials);

Learning.route("student","/student/","Students","Student","list");
Learning.route("student/select","/student/{student_id:^\\d+$}","Student","Student","select");
Learning.route("student/new","/student/new/","Student","Student","new");

