var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var _ = require('lodash');
var fs = require('fs');
/* GET users listing. */

router.get('/allhindu', function(req, res, next){
  var url = "http://www.thehindu.com/";
  var links = [];
  request(url, function(error, response, html){
    if(error){
      console.log(error);
    }
    else{
      var $ = cheerio.load(html);
      $('#firstlist').children().each(function(i, element){
        var link = $(this).attr('href');
        if(link !== '#'){
            links.push(link);
        }
      });
      loadHinduCityData(links);
    }
  });
});

router.get('/hindu', function(req, res, next){
  var url = "http://www.thehindu.com/todays-paper/";
  var links = [];
  request(url, function(error, response, html){
    if(error){
      console.log(error);
    }
    else{
      var $ = cheerio.load(html);
      $('#content ul a').each(function(i, element){
        var link = $(this).attr('href');
        links.push(link);
      });
      console.log(links);
      loadHindu(links);
      res.render('hindu');
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
                  loadNews(link);
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

router.get('/deccan', function(req, res, next){
  var url = "http://www.deccanchronicle.com/";
  var links = [];
  request(url, function(error, response, html){
    if(error){
      console.log(error);
    }
    else {
      var $ = cheerio.load(html);
      $('a').each(function(i, element){
        var link = $(this).attr('href')
        if(_.endsWith(link, 'html')){
          link = 'http://www.deccanchronicle.com'+link;
          links.push(link);
        }
      });
      loadDeccan(links);
    }
  });
});

function loadDeccan(links){
  _(links).forEach(function(link){
    request(link, function(error, response, html){
      if(error){
        console.log(error);
      }
      else{
        var $ = cheerio.load(html);
        
      }
    });
  })
}

function loadHinduCityData(cities){
  var links = [];
  _(cities).forEach(function(city){
    request(city, function(error, response, html){
      if(error){
        console.log(error);
      }
      else{
        var $ = cheerio.load(html);
        $('.sub-headline').each(function(i, element){
          var link = $(this).children().first().attr('href');
          if(link !== undefined){
            links.push(link);
          }
        });
        loadHindu(links);
      }
    });
  });
}

function loadNews(url){
  request(url, function(error, response, html){
    if(error){
      console.log(error);
    }
    else{
      var $ = cheerio.load(html);
      var news = [];
      $('.news_head li').each(function(i, element){
        console.log(url , $(this).children().first().attr('href'));
        news.push($(this).children().first().attr('href'));
      });
      //console.log(news);
      //loadIndianExpress(news);
    }
  });
}

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
        console.log(someText);
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

function loadHindu(news){
  var i=1;
  _(news).forEach(function(newsitem){
    request(newsitem, function(error, response, html){
      if(error){
        console.log(error);
      }
      else {
        var $ = cheerio.load(html);
        var someText = $('.body').text();
        someText = someText.replace(/(\r\n|\t|\r|\n|<br>)/gm,"");
        if(someText !== ""){
          fs.appendFile('./hindu.txt', someText + '\n', 'utf-8', function(err){
            if(err){
              console.log(err);
            }
          });
        }
        i++;
        if(i >= news.length){
          return;
        }
      }
    });
  });
}

module.exports = router;
