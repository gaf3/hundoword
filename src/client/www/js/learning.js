window.Learning = new DoTRoute.Application();

window.hwAPI = new HundoWord.API(window.location.protocol + "//" + window.location.host + "/api/v0/");

Learning.load = function (name) {
    return $.ajax({url: name + ".html", async: false}).responseText;
}

Learning.words_string = function(list) {
    return list ? list.join(" ") : "";
}

Learning.words_array = function(text) {
    return text ? text.replace(/,+/g," ").replace(/\s+/g," ").replace(/^ | $/,"").split(" ") : [];
}

Learning.partial("Header",Learning.load("header"));
Learning.partial("Footer",Learning.load("footer"));

Learning.template("Home",Learning.load("home"),null,Learning.partials);

Learning.route("home","/","Home");

Learning.controller("Changeable",null,{
    selecting: function() {
        $(".selecting").show();
        $(".changing").hide();
    },
    changing: function(programs) {
        $(".selecting").hide();
        $(".changing").show();
    }
});