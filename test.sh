echo -e "Using curl -i -d title=title1 -d body=text1 -X POST localhost:3000/questions\n"
curl -i -d title=title1 -d body=text1 -X POST "localhost:3000/questions"
echo -e "\n\nUsing curl -i -X GET localhost:3000/questions/1\n"
curl -i -X GET "localhost:3000/questions/1"
echo -e "\n\nUsing curl -i -d title=title2 -X PUT localhost:3000/questions/1\n"
curl -i -d title=title2 -X PUT "localhost:3000/questions/1"
echo -e "\n\nUsing curl -i -X GET localhost:3000/questions/1\n"
curl -i -X GET "localhost:3000/questions/1"
echo -e "\n\nUsing curl -i -X DELETE localhost:3000/questions/1\n"
curl -i -X DELETE "localhost:3000/questions/1"
echo -e "\n\nUsing curl -i -X GET localhost:3000/questions/1\n"
curl -i -X GET "localhost:3000/questions/1"
echo -e "\n\nUsing curl -i -d title=title1 -X POST localhost:3000/questions\n"
curl -i -d title=title1 -X POST "localhost:3000/questions"
echo -e "\n\nUsing curl -i -d title=title1 -d body=text1 -X POST localhost:3000/questions\n"
curl -i -d title=title1 -d body=text1 -X POST "localhost:3000/questions"
echo -e "\n\nUsing curl -i -X DELETE localhost:3000/questions\n"
curl -i -X DELETE "localhost:3000/questions"
echo -e "\n\nUsing curl -i -X GET localhost:3000/questions\n"
curl -i -X GET "localhost:3000/questions"


echo -e "\n\nUsing curl -i -d body=text2 -X POST localhost:3000/questions/2/answers\n"
curl -i -d body=text2 -X POST "localhost:3000/questions/2/answers"
echo -e "\n\nUsing curl -i -X GET localhost:3000/questions/2/answers/1\n"
curl -i -X GET "localhost:3000/questions/2/answers/1"
echo -e "\n\nUsing curl -i -d body=text3 -X PUT localhost:3000/questions/2/answers/1\n"
curl -i -d body=text3 -X PUT "localhost:3000/questions/2/answers/1"
echo -e "\n\nUsing curl -i -X GET localhost:3000/questions/2/answers/1\n"
curl -i -X GET "localhost:3000/questions/2/answers/1"
echo -e "\n\nUsing curl -i -X DELETE localhost:3000/questions/2/answers/1\n"
curl -i -X DELETE "localhost:3000/questions/2/answers/1"
echo -e "\n\nUsing curl -i -X GET localhost:3000/questions/2/answers/1\n"
curl -i -X GET "localhost:3000/questions/2/answers/1"
echo -e "\n\nUsing curl -i -d body=text2 -X POST localhost:3000/questions/2/answers\n"
curl -i -d body=text2 -X POST "localhost:3000/questions/2/answers"
echo -e "\n\nUsing curl -i -X GET localhost:3000/questions/2/answers\n"
curl -i -X GET "localhost:3000/questions/2/answers"


echo -e "\n\nUsing curl -i -d body=text4 -X POST localhost:3000/questions/2/comments\n"
curl -i -d body=text4 -X POST "localhost:3000/questions/2/comments"
echo -e "\n\nUsing curl -i -X GET localhost:3000/questions/2/comments/1\n"
curl -i -X GET "localhost:3000/questions/2/comments/1"
echo -e "\n\nUsing curl -i -d body=text5 -X PUT localhost:3000/questions/2/comments/1\n"
curl -i -d body=text5 -X PUT "localhost:3000/questions/2/comments/1"
echo -e "\n\nUsing curl -i -X GET localhost:3000/questions/2/comments/1\n"
curl -i -X GET "localhost:3000/questions/2/comments/1"
echo -e "\n\nUsing curl -i -X DELETE localhost:3000/questions/2/comments/1\n"
curl -i -X DELETE "localhost:3000/questions/2/comments/1"
echo -e "\n\nUsing curl -i -X GET localhost:3000/questions/2/comments/1\n"
curl -i -X GET "localhost:3000/questions/2/comments/1"
echo -e "\n\nUsing curl -i -d body=text4 -X POST localhost:3000/questions/2/comments\n"
curl -i -d body=text4 -X POST "localhost:3000/questions/2/comments"
echo -e "\n\nUsing curl -i -X GET localhost:3000/questions/2/comments\n"
curl -i -X GET "localhost:3000/questions/2/comments"


echo -e "\n\nUsing curl -i -d body=text6 -X POST localhost:3000/questions/2/answers/2/comments\n"
curl -i -d body=text6 -X POST "localhost:3000/questions/2/answers/2/comments"
echo -e "\n\nUsing curl -i -X GET localhost:3000/questions/2/answers/2/comments/3\n"
curl -i -X GET "localhost:3000/questions/2/answers/2/comments/3"
echo -e "\n\nUsing curl -i -d body=text7 -X PUT localhost:3000/questions/2/answers/2/comments/3\n"
curl -i -d body=text7 -X PUT "localhost:3000/questions/2/answers/2/comments/3"
echo -e "\n\nUsing curl -i -X GET localhost:3000/questions/2/answers/2/comments/3\n"
curl -i -X GET "localhost:3000/questions/2/answers/2/comments/3"
echo -e "\n\nUsing curl -i -X DELETE localhost:3000/questions/2/answers/2/comments/3\n"
curl -i -X DELETE "localhost:3000/questions/2/answers/2/comments/3"
echo -e "\n\nUsing curl -i -X GET localhost:3000/questions/2/answers/2/comments/3\n"
curl -i -X GET "localhost:3000/questions/2/answers/2/comments/3"
echo -e "\n\nUsing curl -i -d body=text6 -X POST localhost:3000/questions/2/answers/2/comments\n"
curl -i -d body=text6 -X POST "localhost:3000/questions/2/answers/2/comments"
echo -e "\n\nUsing curl -i -X GET localhost:3000/questions/2/answers/2/comments\n"
curl -i -X GET "localhost:3000/questions/2/answers/2/comments"
echo -e "\n\nUsing curl -i -d body=text8 -X POST localhost:3000/questions/2/answers/2/comments/4\n"
curl -i -d body=text8 -X POST "localhost:3000/questions/2/answers/2/comments/4"
echo -e "\n\nEND\n"
