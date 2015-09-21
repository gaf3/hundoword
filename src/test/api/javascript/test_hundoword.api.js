
var hundoword_django_host = window.location.protocol + "//" + window.location.hostname;
var hundoword_django_prefix = "api-js-test"

function make_user(username) {

    return hundoword_django_prefix + "-" + username

}

function make_achievement(achievement) {

    return hundoword_django_prefix + "-" + achievement

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

function delete_achievements() {

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
            "next": "/admin/learning/achievement/?q=" + make_achievement("")
        },
        async: false
    }).responseText;

    var token = $(html).find("input[name='csrfmiddlewaretoken']").attr('value');
    if (!token) { throw "Couldn't get search token"; }

    $(html).find("input[name='_selected_action']").each(function() {

        var achievement_id = $(this).attr('value');

        if (!achievement_id) { throw "Couldn't get search achievement_id"; }

        var html = $.ajax({
            type: "POST",
            dataType : "html",
            url: hundoword_django_host + "/admin/learning/achievement/" + achievement_id + "/delete/",
            data: {
                "post": "yes",
                "csrfmiddlewaretoken": token
            },
            async: false
        }).responseText;

        var success = $(html).find("li.success").html();

        if (!((success.indexOf('The achievement "' + make_achievement("")) == 0) && (success.indexOf('" was deleted successfully.') > 0))) {
            throw "Delete unsuccessful"; 
        }

    });

    $.ajax({url: hundoword_django_host + "/admin/logout/",async: false});

}

QUnit.module("HundoWord");

QUnit.module("HundoWord.API", {

    setup: function() {
        delete_users();
        delete_achievements();
    },

    teardown: function() {
        delete_users();
        delete_achievements();
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

QUnit.test("Base", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api");
    check_user(api,"tester0","tester0","tester0@hundoword.com");
    var entity = new HundoWord.Base(api,"stuff");

    assert.equal(entity.build_url(),"http://192.168.72.87/api/stuff/");
    assert.equal(entity.build_url(1),"http://192.168.72.87/api/stuff/1/");
    assert.equal(entity.build_url(1,"do"),"http://192.168.72.87/api/stuff/1/do/");

    // Check all failures with exceptions

    try {

        entity.list();
        assert.ok(false);

    } catch (exception) {

        assert.equal(exception.name,"HundoWord.APIException");
        assert.equal(exception.message,"GET: http://192.168.72.87/api/stuff/ failed");
        assert.deepEqual(exception.json,{});

    }

    try {

        entity.select(0);
        assert.ok(false);

    } catch (exception) {

        assert.equal(exception.name,"HundoWord.APIException");
        assert.equal(exception.message,"GET: http://192.168.72.87/api/stuff/0/ failed");
        assert.deepEqual(exception.json,{});

    }

    try {

        entity.create({});
        assert.ok(false);

    } catch (exception) {

        assert.equal(exception.name,"HundoWord.APIException");
        assert.equal(exception.message,"POST: http://192.168.72.87/api/stuff/ failed");
        assert.deepEqual(exception.json,{});

    }

    try {

        entity.update(0,{});
        assert.ok(false);

    } catch (exception) {

        assert.equal(exception.name,"HundoWord.APIException");
        assert.equal(exception.message,"POST: http://192.168.72.87/api/stuff/0/ failed");
        assert.deepEqual(exception.json,{});

    }

    try {

        entity.delete(0);
        assert.ok(false);

    } catch (exception) {

        assert.equal(exception.name,"HundoWord.APIException");
        assert.equal(exception.message,"DELETE: http://192.168.72.87/api/stuff/0/ failed");
        assert.deepEqual(exception.json,{});

    }

    // Check all failures with callback

    var list_fail = assert.async();
    entity.list(
        function () {
            assert.ok(false);
        },
        function (response) {
            assert.equal(response.status,404);
        },
        function () {
            list_fail();
        }
    );

    var select_fail = assert.async();
    entity.select(0,
        function () {
            assert.ok(false);
        },
        function (response) {
            assert.equal(response.status,404);
        },
        function () {
            select_fail();
        }
    );

    var create_fail = assert.async();
    entity.create({},
        function () {
            assert.ok(false);
        },
        function (response) {
            assert.equal(response.status,404);
        },
        function () {
            create_fail();
        }
    );

    var update_fail = assert.async();
    entity.update(0,{},
        function () {
            assert.ok(false);
        },
        function (response) {
            assert.equal(response.status,404);
        },
        function () {
            update_fail();
        }
    );

    var delete_fail = assert.async();
    entity.delete(0,
        function () {
            assert.ok(false);
        },
        function (response) {
            assert.equal(response.status,404);
        },
        function () {
            delete_fail();
        }
    );

});


QUnit.test("Words", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api");
    check_user(api,"tester0","tester0","tester0@hundoword.com");
    var entity = new HundoWord.Words(api,"stuff");

    // Check all failures with exceptions

    try {

        entity.append(0,{});
        assert.ok(false);

    } catch (exception) {

        assert.equal(exception.name,"HundoWord.APIException");
        assert.equal(exception.message,"POST: http://192.168.72.87/api/stuff/0/append/ failed");
        assert.deepEqual(exception.json,{});

    }

    try {

        entity.remove(0,{});
        assert.ok(false);

    } catch (exception) {

        assert.equal(exception.name,"HundoWord.APIException");
        assert.equal(exception.message,"POST: http://192.168.72.87/api/stuff/0/remove/ failed");
        assert.deepEqual(exception.json,{});

    }

    // Check all failures with callback

    var list_fail = assert.async();
    entity.append(0,{},
        function () {
            assert.ok(false);
        },
        function (response) {
            assert.equal(response.status,404);
        },
        function () {
            list_fail();
        }
    );

    var select_fail = assert.async();
    entity.remove(0,{},
        function () {
            assert.ok(false);
        },
        function (response) {
            assert.equal(response.status,404);
        },
        function () {
            select_fail();
        }
    );

});

QUnit.test("achievement", function(assert) {

    var api = new HundoWord.API(hundoword_django_host + "/api");
    check_user(api,"tester0","tester0","tester0@hundoword.com");


    assert.ok(true);

});

