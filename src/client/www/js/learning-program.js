Learning.controller("Program","Changeable",{
    list: function() {
        this.it = {programs: hwAPI.program.list()};
        this.application.render(this.it);
    },
    select: function() {
        this.it = {program: hwAPI.program.select(this.application.current.path.program_id)};
        this.application.render(this.it);
    },    
    new: function() {
        this.it = {program: {}};
        this.application.render(this.it);
        this.changing();
    },
    edit: function() {
        this.changing();
    },
    save: function() {
        var program_id = $("#program_id").val();
        var program = {
            name: $("#name").val(), 
            description: $("#description").val(),
            words: this.words_array($("#words").val())
        };
        if (program_id) {
            this.it = {program: hwAPI.program.update(program_id,program)};
        } else {
            this.it = {program: hwAPI.program.create(program)};
        }
        this.application.render(this.it);
    },
    cancel: function() {
        var program_id = $("#program_id").val();
        if (program_id) {
            this.selecting();
        } else {
            this.application.go('program');
        }
    },
    delete: function() {
        if (confirm("Are you sure?") == true) {
            hwAPI.program.delete(this.application.current.path.program_id);
            this.application.go('program');
        }
    }
});

Learning.template("Programs",Learning.load("programs"),null,Learning.partials);
Learning.template("Program",Learning.load("program"),null,Learning.partials);

Learning.route("program","/program/","Programs","Program","list");
Learning.route("program/select","/program/{program_id:^\\d+$}","Program","Program","select");
Learning.route("program/new","/program/new/","Program","Program","new");

