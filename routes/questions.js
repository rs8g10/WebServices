
/*
 * Creation, delete, update and retrieval of questions
 */

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