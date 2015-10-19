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
            words: this.application.words_array($("#words").val())
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
    }
});

Learning.partial("StudentTabs",Learning.load("student/tabs"));

Learning.template("Students",Learning.load("student/list"),null,Learning.partials);
Learning.template("Student",Learning.load("student/item"),null,Learning.partials);

Learning.route("student","/student/","Students","Student","list");
Learning.route("student/select","/student/{student_id:^\\d+$}/","Student","Student","select");
Learning.route("student/new","/student/new/","Student","Student","new");

