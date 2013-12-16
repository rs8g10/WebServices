
/*
 * Creation, delete, update and retrieval of questions
 */

var helper = require("../js/helper");

exports.create_question = function(req, resp) {
	var title = req.body.title;
	var body = req.body.body;
	if (title && body) {
		req.models.question.create([{
		                            	title: title, 
		                            	body: body, 
		                            	date: new Date().getTime()
		                            }], function(err, items) {
			if (err) {
				resp.send(500);
			} else {
				resp.location("/questions/" + items[0].id);
				resp.send(201);
			}
		});
	} else {
		resp.send(400);
	}
};

exports.get_questions = function(req, resp) {
	var count = req.query.count;
	var rangeStart = req.query.start;
	var rangeEnd = req.query.end;
	var inputValid = true;
	if (count !== undefined) {
		if (!helper.check_int(count)) {
			inputValid = false;
		} else {
			count = parseInt(count);
			if (count <= 0) {
				inputValid = false;
			}
		}
	}
	if (rangeStart !== undefined && rangeEnd !== undefined) {
		if (!helper.check_int(rangeStart) || !helper.check_int(rangeEnd)) {
			inputValid = false;
		} else {
			rangeStart = parseInt(rangeStart);
			rangeEnd = parseInt(rangeEnd);
			if (rangeStart < 0 || rangeStart > rangeEnd) {
				inputValid = false;
			}
		}
	} else if (rangeStart !== undefined || rangeEnd !== undefined) {
		inputValid = false;
	}
	if (!inputValid) {
		resp.send(400);
	} else {
		var offset = null, 
			limit = null;
		if (rangeStart !== undefined) {
			offset = rangeStart;
			limit = rangeEnd - rangeStart + 1;
		} else if (count !== undefined) {
			offset = 0;
			limit = count;
		};
		var callback = function(err, questions) {
	    	encode_questions(questions, function(err, json_questions) {
	    		if (err) {
	    			resp.send(err);
	    		} else {
	    			resp.send(json_questions);
	    		}
	    	});
		};
		if (offset !== null) {
			req.models.question.find(null, ["date", "Z"])
							    .limit(limit)
							    .offset(offset)
							    .run(callback);
		} else {
			req.models.question.find(null, ["date", "Z"])
							   .run(callback);
		}
	}
};

exports.get_question = function(req, resp) {
	find_question(req, req.params.id, function(err, question) {
		if (err) {
			resp.send(err);
		} else {
			encode_question(question, function(err, json_question) {
				if (err) {
					resp.send(err);
				} else {
					resp.send(json_question);
				}
			});
		}
	});
};

exports.delete_question = function(req, resp) {
	find_question(req, req.params.id, function(err, question) {
		if (err) {
			resp.send(err);
		} else {
			question.getAnswers(function(err, answers) {
				if (err) {
					resp.send(500);
				} else {
					remove_answers(answers, function(err) {
						if (err) {
							resp.send(err);
						} else {
							remove_comments(question, function(err) {
								if (err) {
									resp.send(500);
								} else {
									question.remove(function(err) {
										if (err) {
											resp.send(500);
										} else {
											resp.send(204);
										}
									});
								}
							});
						}
					});
				}
			});
		}	
	}); 
};

exports.update_question = function(req, resp) {
	find_question(req, req.params.id, function(err, question) {
		if (err) {
			resp.send(err);
		} else {
			var title = req.body.title;
			var body = req.body.body;
			if (title) {
				question.title = title;
			}
			if (body) {
				question.body = body;
			}
			question.save(function(err) {
				if (err) {
					resp.send(500);
				} else {
					resp.send(204);
				}
			});
		}
	});
};

function find_question(req, id, callback) {
	if (helper.check_int(id)) {
		req.models.question.find({id : parseInt(id)}, function(err, questions) {
			if (err) {
				callback(500, null);
			} else if (questions.length === 0) {
				callback(404, null);
			} else {
				var question = questions[0];
				callback(null, question);
			}
		});
	} else {
		callback.send(400);
	}
}

function encode_questions(questions, callback, json_questions) {
	if (!json_questions) {
		json_questions = [];
	}
	if (questions.length === 0) {
		callback(null, json_questions);
	} else {
		var question = questions.shift();
		encode_question(question, function(err, json_question) {
			if (err) {
				callback(err, null);
			} else {
				json_questions.push(json_question);
				encode_questions(questions, callback, json_questions);
			}
		});
	}
}

function encode_question(question, callback) {
	question.getAnswers(function(err, answers) {
		if (err) {
			callback(500, null);
		} else {
			question.getComments(function(err, comments) {
				if (err) {
					callback(500, null);
				} else {
					callback(null, {title: question.title,
							  		body: question.body,
							  		date: question.date,
							  		answers_count: answers.length,
							  		comments_count: comments.length});
				}
			});
		}
	});
}

function remove_answers(answers, callback) {
	if (answers.length === 0) {
		callback(null);
	} else {
		var answer = answers.shift();
		remove_answer(answer, function(err) {
			if (err) {
				callback(err);
			} else {
				remove_answers(answers, callback);
			}
		});
	}
}

function remove_answer(answer, callback) {
	remove_comments(answer, function(err) {
		if (err) {
			callback(err);
		} else {
			answer.remove(function(err) {
				if (err) {
					callback(500);
				} else {
					callback(null);
				}
			});
		}
	});
}

function remove_comments(object, callback) {
	object.getComments(function(err, comments) {
		if (err) {
			callback(500);
		} else {
			object.removeComments(comments, function(err) {
				if (err) {
					callback(500);
				} else {
					callback(null);
				}
			});
		}
	});
}
