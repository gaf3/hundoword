window.Learning = new DoTRoute.Application();

window.hwAPI = new HundoWord.API(window.location.protocol + "//" + window.location.host + "/api/");

Learning.load = function (name) {
    return $.ajax({url: name + ".html", async: false}).responseText;
}

Learning.partial("Header",Learning.load("header"));
Learning.partial("Footer",Learning.load("footer"));

Learning.template("Home",Learning.load("home"),null,Learning.partials);

Learning.route("home","/","Home");
Learning.route("achievement","/achievement/","Home");
Learning.route("program","/program/","Home");
Learning.route("student","/student/","Home");