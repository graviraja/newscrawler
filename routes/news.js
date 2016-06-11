var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var _ = require('lodash');
var fs = require('fs');
/* GET users listing. */

router.get('/hindu', function(req, res, next){
  var url = "http://www.thehindu.com/";
  request(url, function(error, response, html){
    if(error){
      console.log(error);
    }
    else{
      console.log('entered');
      var $ = cheerio.load(html);
      $('.h-lead-story').each(function(i, element){
        console.log($(this).children().first().attr('href'));
        console.log($(this).children().find('h3').text());
      });
    }
  });
});

router.get('/archive', function(req, res, next){
  var url = "http://archive.indianexpress.com/";
  var links = [];
  request(url, function(error, response, html){
    if(error){
      console.log(error);
    }
    else{
      var $ = cheerio.load(html);
      $('.archivetbl').children().children().children().each(function(i, element){
        $(this).children().each(function(j, ele){
          var _this = $(this).children().first().next();
          if(_this.hasClass('show')){
            _this.children().children().first().children().children().each(function(j, ele){
              if(j >=1){
                  var link = "http://archive.indianexpress.com" + $(this).children().attr('href');
                  console.log(link);
              }
            });
          }
        })
      });
    }
  });
});

router.get('/indianexpress', function(req, res, next){
  var url = "http://archive.indianexpress.com/archive/news/1/1/2014/";
  request(url, function(error, response, html){
    if(error){
      console.log(error);
    }
    else{
      var $ = cheerio.load(html);
      var news = [];
      $('.news_head li').each(function(i, element){
        news.push($(this).children().first().attr('href'));
      });
      loadIndianExpress(news);
    }
  });
});

router.get('/timesofindia', function(req, res, next){
  var url = "http://timesofindia.indiatimes.com/home/headlines";
  request(url, function(error, response, html){
    if(error){
      console.log('--------------------------------------- top data error --------------------------------------------------');
      console.log(error);
    }
    else{
      var $ = cheerio.load(html);
      var news = [];
      $('.content li').each(function(i, element){
        var item={link:"", text:""};
        item.link = $(this).children().first().attr('href');
        item.text = $(this).children().first().text();
        news.push(item);
      });
      loadTimesofIndia(news);
      res.render('timesofindia');
    }
  });
});

function loadIndianExpress(news){
  var i=1;
  _(news).forEach(function(newsitem){
    request(newsitem, function(error, response, html){
      if(error){
        console.log(error);
      }
      else {
        var $ = cheerio.load(html);
        var someText = $('.ie2013-contentstory p').text();
        someText = someText.replace(/(\r\n|\t|\r|\n|<br>)/gm,"");
        fs.appendFile('./indianexpress.txt', someText + '\n', 'utf-8', function(err){
          if(err){
            console.log(err);
          }
        });
        i++;
        if(i >= news.length){
          return;
        }
      }
    });
  });
}


function loadTimesofIndia(news){
  var i = 1;
  _(news).forEach(function(newsitem){
    if(_.startsWith(newsitem.link, "http://")){}
    else{
      newsitem.link = "http://timesofindia.indiatimes.com" + newsitem.link;
    }
    var data={content:""};
    request(newsitem.link, function(error, response, html){
      if(error){
        console.log('------------------ internal data error ---------------------');
        console.log(newsitem.link);
        console.log(error);
      }
      else{
          var $ = cheerio.load(html);
          var someText = $('.Normal').text();
          someText = someText.replace(/(\r\n|\t|\r|\n|<br>)/gm,"");
          data.content = someText;
          fs.appendFile('./timesofindia.txt', data.content + '\n', 'utf-8', function(err){
            if(err){
              console.log(err);
            }
          });
          i++;
          if(i >= news.length){
            return;
          }
      }
    });
  });
}

module.exports = router;
