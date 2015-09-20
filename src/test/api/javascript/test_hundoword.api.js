
var hundoword_django_host = window.location.protocol + "//" + window.location.hostname;
var hundoword_django_prefix = "api-js-test"

function make_user(username) {

    return hundoword_django_prefix + "-" + username

}


function check_user(api,username,password,email) {

    try {
        
        api.login(make_user(username),password);

    } catch (exception) {

        api.register(make_user(username),password,email);
        api.login(make_user(username),password);

    }

}

function delete_users() {

    var html;
    var token;

    html = $.ajax({url: hundoword_django_host + "/admin/",async: false}).responseText;

    if ($(html).find("a[href='/admin/logout/']").attr('href')) {

        $.ajax({url: hundoword_django_host + "/admin/logout/",async: false});
        var html = $.ajax({url: hundoword_django_host + "/admin/",async: false}).responseText;

    }

    var token = $(html).find("input[name='csrfmiddlewaretoken']").attr('value');

    if (!token) { throw "Couldn't get initial token"; }

    var action = $(html).find("form").attr('action');

    if (!action) { throw "Couldn't get initial action"; }

    var html = $.ajax({
        type: "POST",
        url: hundoword_django_host + action,
        data: {
            "csrfmiddlewaretoken": token,
            "username": "vagrant",
            "password": "vagrant",
            "next": "/admin/auth/user/?q=" + make_user("")
        },
        async: false
    }).responseText;

    var token = $(html).find("input[name='csrfmiddlewaretoken']").attr('value');
    if (!token) { throw "Couldn't get search token"; }

    $(html).find("input[name='_selected_action']").each(function() {

        var user_id = $(this).attr('value');

        if (!user_id) { throw "Couldn't get search user_id"; }

        var html = $.ajax({
            type: "POST",
            dataType : "html",
            url: hundoword_django_host + "/admin/auth/user/" + user_id + "/delete/",
            data: {
                "post": "yes",
                "csrfmiddlewaretoken": token
            },
            async: false
        }).responseText;

        var success = $(html).find("li.success").html();

        if (!((success.indexOf('The user "' + make_user("")) == 0) && (success.indexOf('" was deleted successfully.') > 0))) {
            throw "Delete unsuccessful"; 
        }

    });

    $.ajax({url: hundoword_django_host + "/admin/logout/",async: false});

}

QUnit.module("HundoWord");

QUnit.module("HundoWord.API", {

    setup: function() {
        delete_users();
    },

    teardown: function() {
        delete_users();
    }

});

QUnit.test("constructor", function(assert) {

    var api = new HundoWord.API("learning");

    assert.equal(api.url,"learning");

});

QUnit.test("headers", function(assert) {

    var api = new HundoWord.API("learning.com");
    api.token = "funspot"

    assert.deepEqual(api.headers(),{authorization: "Token funspot"});

});

QUnit.test("build_url", function(assert) {

    var api = new HundoWord.API("learning.com");

    assert.equal(api.build_url("stuff"),"learning.com/stuff/");
    assert.equal(api.build_url("stuff",1),"learning.com/stuff/1/");
    assert.equal(api.build_url("stuff",1,"do"),"learning.com/stuff/1/do/");

});


QUnit.test("register", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api");

    try {

        api.register("good","bad","ugly");
        assert.ok(false);

    } catch (exception) {

        assert.equal(exception.name,"HundoWord.APIException");
        assert.equal(exception.message,"POST: http://192.168.72.87/api/register/ failed");
        assert.deepEqual(exception.json,{email: ["Enter a valid email address."]});

    }

    var fail = assert.async();
    api.register("good","bad","ugly",
        function () {
            assert.ok(false);
        },
        function (response) {
            assert.deepEqual(response.responseJSON,{email: ["Enter a valid email address."]});
        },
        function () {
            fail();
        }
    );

});

QUnit.test("login", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api");

    try {

        api.login("good","bad");
        assert.ok(false);

    } catch (exception) {

        assert.equal(exception.name,"HundoWord.APIException");
        assert.equal(exception.message,"POST: http://192.168.72.87/api/token/ failed");
        assert.deepEqual(exception.json,{non_field_errors: ["Unable to log in with provided credentials."]});

    }

    var fail = assert.async();
    api.login("good","bad",
        function () {
            assert.ok(false);
        },
        function (response) {
            assert.deepEqual(response.responseJSON,{non_field_errors: ["Unable to log in with provided credentials."]});
        },
        function () {
            fail();
        }
    );

    api.register(make_user("tester0"),"tester0","tester0@hundoword.com");
    var pass = assert.async();
    api.login(make_user("tester0"),"tester0",
        function (data) {
            assert.equal(api.token,data.token);
        },
        function () {
            assert.ok(false);
        },
        function () {
            pass();
        }
    );

});

QUnit.test("achievement", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api");
    check_user(api,"tester0","tester0","tester0@hundoword.com");

    try {

        api.achievement.select(-1);
        assert.ok(false);

    } catch (exception) {

        assert.equal(exception.name,"HundoWord.APIException");
        assert.equal(exception.message,"Game failed");
        assert.deepEqual(exception.json,{detail: "Game not found"});

    }

    var fail = assert.async();
    api.achievement.select(-1,
        function () {
            assert.ok(false);
        },
        function (response) {
            assert.deepEqual(response.responseJSON,{detail: "Game not found"});
        },
        function () {
            fail();
        }
    );

});

