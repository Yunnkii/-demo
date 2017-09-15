// var express = require('express');
// var cheerio = require('cheerio');
// var superagent = require('superagent');
// var url = require('url');

// var app = express();
// var cnodeUrl = 'http://cnodejs.org' ;
// app.get('/', function (req, res, next) {
//   	superagent.get(cnodeUrl)
// 	    .end(function (err, sres) {
// 		    if (err) {
// 		        return next(err);
// 		    }
// 		    var $ = cheerio.load(sres.text);
// 		    // 存放总的对象
// 		    var items = [];
// 		    //存放作者数据
// 		    //var author = [];
// 		    //存放链接
// 		    var topicUrls = [];
// 		    // 获取首页作者名称
// 		 //    $('#topic_list .cell .user_avatar img').each(function (id,ele) {
// 		 // 		var $element = $(ele);
// 			// 	author.push($element.attr('title'));
// 			// });
// 		    //获取首页链接
// 		    $('#topic_list .topic_title').each(function (idx, element) {
// 		        var $element = $(element);
// 		        // 合并url
// 		        var href = url.resolve(cnodeUrl,$element.attr('href'));
// 		        //url 存到数组中
// 		        topicUrls.push(href);
// 		        // items.push({
// 			       //  title: $element.attr('title'),
// 			       //  href: url+$element.attr('href')
// 		        // });
// 		    });
		    
// 		    var ep = require('eventproxy');

// 		    // res.send(items);
// 		    ep.after('topic_html',topicUrls.length,function (topics) {
// 				topics = topics.map(function (topicPair) {
// 					var topicUrl = topicPair[0];
// 					var topichtml = topicPair[1];
// 					var $ = cheerio.load(topichtml);
// 					return ({
// 						title: $('.topic_full_title').text.trim(),
// 						href: topicUrl,
// 						author: $('.topic_header .changes span:eq(1) a').eq(0).text().trim(),
// 						reply_author: $('.reply_author').eq(0).text().trim(),
// 						comment1: $('.reply_content').eq(0).text().trim(),
// 					});
// 				});
// 				console.log('final:');
// 				console.log(topics);
// 			});

// 			topicUrls.forEach(function (topicUrl) {
// 				superagent.get(topicUrl)
// 					.end(function (err,res) {
// 						console.log('fetch'+topicUrl+"successful");
// 						console.log('res.text:');
// 						ep.emit('topic_html',[topicUrl,res.text]);
// 					});
// 			});
// 		});
// });


// app.listen(3000, function () {
//   console.log('app is listening at port 3000');
// });


var eventproxy = require('eventproxy');
var superagent = require('superagent');
var cheerio = require('cheerio');
var url = require('url');
var express = require('express');


var app = express();
var cnodeUrl = 'https://cnodejs.org/';
app.get('/', function (req, sres, next) {
	superagent.get(cnodeUrl)
	.end(function (err, res) {

	    if (err) {
	      return console.error(err);
	    }
	    
	    var topicUrls = [];
	    var $ = cheerio.load(res.text);
	    $('#topic_list .topic_title').each(function (idx, element) {
	      var $element = $(element);
	      var href = url.resolve(cnodeUrl, $element.attr('href'));
	      topicUrls.push(href);
	    });

	    var ep = new eventproxy();
	    
	    ep.after('topic_html', topicUrls.length, function (topics) {
	    	//console.log(topics);
	      	topics = topics.map(function (topicPair) {
		        var topicUrl = topicPair[0];
		        var topicHtml = topicPair[1];
		        var $ = cheerio.load(topicHtml);
		        return({
		          	title: $('#content .topic_full_title').text(),
		          	href: topicUrl,
		          	author: $('.topic_header .changes span a').eq(0).text().trim(),
					reply_author: $('.reply_author').eq(0).text().trim(),
					comment1: $('.reply_content').eq(0).text().trim(),
					scores: $('#sidebar .panel .inner .user_card .floor .big').text()
		        });
		      
	      	});
	    	sres.send(topics);
	    });
	    
	    topicUrls.forEach(function (topicUrl) {
	      superagent.get(topicUrl)
	        .end(function (err, res) {
	          console.log('fetch ' + topicUrl + ' successful');
	          ep.emit('topic_html',[topicUrl,res.text]);
	        });
	    });
	
	});
});

app.listen(3000, function () {
  console.log('app is listening at port 3000');
});