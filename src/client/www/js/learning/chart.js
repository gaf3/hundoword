Learning.controller("Chart","Changeable",{
    list: function() {
        this.it = {
            student: hwAPI.student.select(this.application.current.path.student_id),
            achievements: hwAPI.achievement.list(),
            achievement_names: {},
            achievement_colors: {}
        };
        for (var achievement = 0; achievement < this.it.achievements.length; achievement++) {
            this.it.achievement_names[this.it.achievements[achievement].id] = this.it.achievements[achievement].name;
            this.it.achievement_colors[this.it.achievements[achievement].id] = this.it.achievements[achievement].color;
        }
        var by = null;
        if (this.application.current.query.by) {
            by = this.application.current.query.by;
        }        
        var focus = null;
        if (this.application.current.query.focus) {
            focus = this.application.current.query.focus.toLowerCase() == 'true';
        }
        var words = null;
        if (this.application.current.query.words) {
            words = this.application.words_array(this.application.current.query.words);
        }
        var achievements = null;
        if (this.application.current.query.achievements) {
            achievements = this.application.words_array(this.application.current.query.achievements);
        }
        var from = null;
        if (this.application.current.query.from) {
            from = this.application.current.query.from;
        }
        var to = null;
        if (this.application.current.query.to) {
            to = this.application.current.query.to;
        }
        this.application.render(this.it);
        $("#chart").css('width','100%');
        $("#chart").css('height','100%');
        $("#chart")[0].width  = $("#chart")[0].offsetWidth;
        $("#chart")[0].height = $("#chart")[0].offsetHeight;
        var chart = hwAPI.student.chart(this.application.current.path.student_id,by,focus,words,achievements,from,to);
        var context = $("#chart")[0].getContext("2d");
        var data = {
            labels: chart.times,
            datasets: []
        }
        for (var dataset = 0; dataset < chart.data.length; dataset++) {
            console.log(chart.data[dataset]);
            data.datasets.push({
                label: this.it.achievement_names[chart.data[dataset].achievement],
                strokeColor: this.it.achievement_colors[chart.data[dataset].achievement],
                pointColor: this.it.achievement_colors[chart.data[dataset].achievement],
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: this.it.achievement_colors[chart.data[dataset].achievement],
                data: chart.data[dataset].totals
            });
        }
        new Chart(context).Line(data,{datasetFill: false});
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
        parameters["by"] = $("#by option:selected").val();
        if ($("#focus").prop("checked")) {
            parameters["focus"] = "true";
        }
        var words = $("#words").val();
        if (words.length) {
            parameters["words"] = this.application.words_array(words).join(",");
        }
        var achievements = $("#achievements li.uk-active").map(function(){return $(this).attr("achievement-id");}).get();;
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
            this.application.go('student/chart',this.application.current.path.student_id);
        } else {
            this.application.go('student/chart',this.application.current.path.student_id,parameters);
        }
    }
});

Learning.template("Chart",Learning.load("student/chart"),null,Learning.partials);

Learning.route("student/chart","/student/{student_id:^\\d+$}/chart/","Chart","Chart","list");

