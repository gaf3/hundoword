Learning.controller("Program","Changeable",{
    list: function() {
        programs: hwAPI.program.list($.proxy(this.listed,this));
    },
    listed: function(programs) {
        this.it = {programs: programs};
        this.application.render(this.it);
    },
    select: function() {
        hwAPI.program.select(this.application.current.path.program_id,$.proxy(this.selected,this));
    },
    selected: function(program) {
        this.it = {program: program};
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
            hwAPI.program.update(program_id,program,$.proxy(this.updated,this));
        } else {
            hwAPI.program.create(program,$.proxy(this.created,this));
        }
    },
    updated: function(program) {
        this.it = {program: program};
        this.application.render(this.it);
    }, 
    created: function(program) {
        this.application.go('program/select',program.id);
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
            hwAPI.program.delete(this.application.current.path.program_id,$.proxy(this.deleted,this));
        }
    },
    deleted: function() {
        this.application.go('program');
    }
});

Learning.template("Programs",Learning.load("programs"),null,Learning.partials);
Learning.template("Program",Learning.load("program"),null,Learning.partials);

Learning.route("program","/program/","Programs","Program","list");
Learning.route("program/select","/program/{program_id:^\\d+$}","Program","Program","select");
Learning.route("program/new","/program/new/","Program","Program","new");

