// Class to interact with the API

var HundoWord = {};
$.ajaxSetup({ cache: false });

// Exception to use with the API

HundoWord.APIException = function(message,response) {
    
    this.name = "HundoWord.APIException";
    this.message = message;

    try {
        this.json = JSON.parse(response.responseText);
    } catch (exception) {
        this.json = {};
    }

}

HundoWord.APIException.prototype = Object.create(Error.prototype);
HundoWord.APIException.prototype.constructor = HundoWord.APIException;

// Base entity for others

HundoWord.Base = function(api,path) {
    this.api = api;
    this.path = path;
}

// Use as constructor

HundoWord.Base.prototype.constructor = HundoWord.Base;

// Standard methods

HundoWord.Base.prototype.build_url = function(id,action) {
    return this.api.build_url(this.path,id,action);
}
HundoWord.Base.prototype.rest = function(type,url,data,success,error,complete) {
    return this.api.rest(type,url,data,this.api.headers(),success,error,complete);
}
HundoWord.Base.prototype.list = function(success,error,complete) {
    return this.rest("GET",this.build_url(),null,success,error,complete);
}
HundoWord.Base.prototype.select = function(id,success,error,complete) {
    return this.rest("GET",this.build_url(id),null,success,error,complete);
}
HundoWord.Base.prototype.create = function(data,success,error,complete) {
    return this.rest("POST",this.build_url(),data,success,error,complete);
}
HundoWord.Base.prototype.update = function(id,data,success,error,complete) {
    return this.rest("POST",this.build_url(id),data,success,error,complete);
}
HundoWord.Base.prototype.delete = function(id,success,error,complete) {
    return this.rest("DELETE",this.build_url(id),null,success,error,complete);
}

// Words entity for those that can append and remove words

HundoWord.Words = function(api,path) {
    HundoWord.Base.call(this,api,path);
}

HundoWord.Words.prototype = new HundoWord.Base();

// Add append and remove

HundoWord.Words.prototype.append = function(id,words,success,error,complete) {
    return this.rest("POST",this.build_url(id,"append"),{words: words},success,error,complete);
}
HundoWord.Words.prototype.remove = function(id,words,success,error,complete) {
    return this.rest("POST",this.build_url(id,"remove"),{words: words},success,error,complete);
}

// Achievement just has base

HundoWord.Achievement = function(api) {
    HundoWord.Base.call(this,api,"achievement");
}

HundoWord.Achievement.prototype = new HundoWord.Base();

// Program has words base

HundoWord.Program = function(api) {
    HundoWord.Words.call(this,api,"program");
}

HundoWord.Program.prototype = new HundoWord.Words();

// Student has words base and a few more methods

HundoWord.Student = function(api) {
    HundoWord.Words.call(this,api,"student");
}

HundoWord.Student.prototype = new HundoWord.Words();

HundoWord.Student.prototype.attain = function(id,word,achievement,success,error,complete) {
    return this.rest("POST",this.build_url(id,"attain"),{word: word,achievement: achievement},success,error,complete);
}
HundoWord.Student.prototype.yield = function(id,word,achievement,success,error,complete) {
    return this.rest("POST",this.build_url(id,"yield"),{word: word,achievement: achievement},success,error,complete);
}
HundoWord.Student.prototype.position = function(id,success,error,complete) {
    return this.rest("GET",this.build_url(id,"position"),null,success,error,complete);
}
HundoWord.Student.prototype.progress = function(id,success,error,complete) {
    return this.rest("GET",this.build_url(id,"progress"),null,success,error,complete);
}


// API

HundoWord.API = function(url) {
    this.url = url;

    this.achievement = new HundoWord.Achievement(this);
    this.program = new HundoWord.Program(this);
    this.student = new HundoWord.Student(this);

}

// Use as constructor

HundoWord.API.prototype.constructor = HundoWord.API;


// Headers for learning

HundoWord.API.prototype.headers = function() {
    return {authorization: "Token " + this.token};
}


// Builds URL off Community base

HundoWord.API.prototype.build_url = function(path,id,action) {

    var url = this.url + path + "/";

    if (typeof id !== 'undefined') {
        url += id + "/";
    }

    if (typeof action !== 'undefined') {
        url += action + "/";
    }

    return url;

}


// Makes a REST call

HundoWord.API.prototype.rest = function(type,url,data,headers,success,error,complete) {

    var response = $.ajax({
        type: type,
        url: url,
        headers: headers,
        contentType: "application/json",
        data: (data === null) ? null : JSON.stringify(data),
        dataType: "json",
        success: success,
        error: error,
        complete: complete,
        async: (success != null || error != null || complete != null)
    });

    if (success != null || error != null || complete != null) {
        return;
    }

    //alert(response.status);

    if ((response.status != 200) && (response.status != 201) && (response.status != 202)) {
        throw new HundoWord.APIException(type + ": " + url + " failed",response);
    }

    return response.responseJSON;

}


// Registers an account

HundoWord.API.prototype.register = function(username,password,email,success,error,complete) {

    return this.rest("POST",this.build_url("register"),{
        username: username,
        password: password,
        email: email
    },null,success,error,complete);

}


// Gets token

HundoWord.API.prototype.login = function(username,password,success,error,complete) {

    var self = this;
    var respond = function(data) {
        self.token = data["token"];
        if (success) {
            success(data);
        }
    }

    var response = $.ajax({
        type: "POST",
        url: this.build_url("token"),
        contentType: "application/json",
        data: JSON.stringify({
            username: username,
            password: password
        }),
        dataType: "json",
        success: respond,
        error: error,
        complete: complete,
        async: (success != null || error != null || complete != null)
    });

    if (success != null || error != null || complete != null) {
        return;
    }

    if (response.status != 200) {
        throw new HundoWord.APIException("POST: " + this.build_url("token") + " failed",response);
    }

}


// Determines if there's an exception in the response

HundoWord.API.prototype.exception = function() {
    try {
        return this.response.responseJSON["exception"];
    } catch (exception) {}
}

