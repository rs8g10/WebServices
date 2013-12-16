
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var questions = require('./routes/questions');
var http = require('http');
var orm = require('orm');
var sqlite3 = require('sqlite3').verbose();

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.use(express.logger('dev'));
app.use(express.methodOverride());
app.use(express.bodyParser());

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.use(orm.express("sqlite://ws.db", {
    define: function (db, models, next) {
        models.question = db.define("question", { 
        	title: {type: "text", size: 100, required: true},
        	body: {type: "text", size: 1000, required: true},
        	date: {type: "date", time: true, required: true}
        });
        models.answer = db.define("answer", { 
        	body: {type: "text", size: 1000, required: true},
        	date: {type: "date", time: true, required: true}
        });
        models.comment = db.define("comment", { 
        	body: {type: "text", size: 1000, required: true},
        	date: {type: "date", time: true, required: true}
        });
        models.question.hasMany("answers", models.answer, {}, { reverse: "questions"});
        models.question.hasMany("comments", models.comment, {}, { reverse: "questions"});
        models.answer.hasMany("comments", models.comment, {}, { reverse: "answers"});
        db.sync(function(err) {
        	if (err) {
        		throw err;
        	}
            next();
        });
    }
}));

app.get("/", routes.index);
app.post("/questions", questions.create_question);
app.get("/questions", questions.get_questions);
app.get("/questions/:id", questions.get_question);
app.del("/questions/:id", questions.delete_question);
app.put("/questions/:id", questions.update_question);


http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
