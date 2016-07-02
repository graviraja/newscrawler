var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var _ = require('lodash');
var fs = require('fs');

router.get('/allhindu', function(req, res, next) {
    var url = "http://www.thehindu.com/";
    var links = [];
    request(url, function(error, response, html) {
        if (error) {
            console.log(error);
        } else {
            var $ = cheerio.load(html);
            $('#firstlist').children().each(function(i, element) {
                var link = $(this).attr('href');
                if (link !== '#') {
                    links.push(link);
                }
            });
            loadHinduCityData(links);
        }
    });
});

router.get('/hindu', function(req, res, next) {
    var url = "http://www.thehindu.com/todays-paper/";
    var links = [];
    request(url, function(error, response, html) {
        if (error) {
            console.log(error);
        } else {
            var $ = cheerio.load(html);
            $('#content ul a').each(function(i, element) {
                var link = $(this).attr('href');
                links.push(link);
            });
            console.log(links);
            loadHindu(links);
            res.render('hindu');
        }
    });
});

router.get('/archive', function(req, res, next) {
    var interval;
    var url = "http://archive.indianexpress.com/";
    var links = [];
    request(url, function(error, response, html) {
        if (error) {
            console.log(error);
        } else {
            var $ = cheerio.load(html);
            $('.archivetbl').children().children().children().each(function(i, element) {
                $(this).children().each(function(j, ele) {
                    var _this = $(this).children().first().next();
                    if (_this.hasClass('show')) {
                        _this.children().children().first().children().children().each(function(j, ele) {
                            if (j >= 1) {
                                var link = "http://archive.indianexpress.com" + $(this).children().attr('href');
                                links.push(link);
                            }
                        });
                    }
                })
            });
            var i = 981;
            interval = setInterval(function() {
                console.log(i);
                loadNews(links[i++], i);
            }, 25000);
        }
    });
});

router.get('/archive/2014/jan', function(req, res, next) {
    var url = "http://archive.indianexpress.com/";
    var links = [];
    request(url, function(error, response, html) {
        if (error) {
            console.log(error);
        } else {
            var $ = cheerio.load(html);
            $('.archivetbl td .show .calender a').each(function(i, element) {
                var subl = $(this).attr('href');
                if (_.startsWith(subl, '#') === false) {
                    var link = "http://archive.indianexpress.com" + subl;
                    links.push(link);
                }
            });
        }
        loadFirstMonth(links);
    });
});

router.get('/indianexpress', function(req, res, next) {
    var url = "http://archive.indianexpress.com/archive/news/1/1/2014/";
    request(url, function(error, response, html) {
        if (error) {
            console.log(error);
        } else {
            var $ = cheerio.load(html);
            var news = [];
            $('.news_head li').each(function(i, element) {
                news.push($(this).children().first().attr('href'));
            });
            loadIndianExpress(news);
        }
    });
});

router.get('/timesofindia', function(req, res, next) {
    var url = "http://timesofindia.indiatimes.com/home/headlines";
    request(url, function(error, response, html) {
        if (error) {
            console.log('--------------------------------------- top data error --------------------------------------------------');
            console.log(error);
        } else {
            var $ = cheerio.load(html);
            var news = [];
            $('.content li').each(function(i, element) {
                var item = {
                    link: "",
                    text: ""
                };
                item.link = $(this).children().first().attr('href');
                item.text = $(this).children().first().text();
                news.push(item);
            });
            loadTimesofIndia(news);
            res.render('timesofindia');
        }
    });
});

router.get('/deccan', function(req, res, next) {
    var url = "http://www.deccanchronicle.com/";
    var links = [];
    request(url, function(error, response, html) {
        if (error) {
            console.log(error);
        } else {
            var $ = cheerio.load(html);
            $('a').each(function(i, element) {
                var link = $(this).attr('href')
                if (_.endsWith(link, 'html')) {
                    link = 'http://www.deccanchronicle.com' + link;
                    links.push(link);
                }
            });
            loadDeccan(links);
        }
    });
});

router.get('/hindustantimes', function(req, res, next) {
    var links = [];
    var url = "http://www.hindustantimes.com/";
    request(url, function(error, response, html) {
        if (error) {
            console.log(error);
        } else {
            var $ = cheerio.load(html);
            $('a').each(function(i, element) {
                var link = $(this).attr('href');
                if (_.endsWith(link, 'html')) {
                    links.push(link);
                }
            });
            loadHindustanTimes(links);
        }
    });
})

router.get('/andhra', function(req, res, next){
  var url = "http://www.visalaandhra.com/archives";
  request(url, function(error, response, html){
    if(error){
      console.log(error);
    }else{
      var $ = cheerio.load(html);
      $('.floatleft a').each(function(i, element){
        var url = $(this).attr('href');
        loadEachYear(url);
      });
    }
  })
})

var all = [];

function loadEachYear(url){
  var dates = []
  var interval;
  request(url, function(error, response, html){
    if(error){
      console.log(error);
    }else{
      var $ = cheerio.load(html);
      $('.days a').each(function(i, element){
          dates.push($(this).attr('href'));
      });
      loadEachDateLinks(dates);
    }
    if(all.length == 2352){
        var i = 2005;
        interval = setInterval(function() {
            console.log(i);
            eachDay(all[i++]);
        }, 15000);
        //  eachDay(all[0]);
    }
  })
}

function loadEachDateLinks(dates){
  _(dates).forEach(function(date){
      all.push(date)
  });
}

function eachDay(date){
  var b = date.split('/');
  var filename = b[6]+'-'+b[5]+'-'+b[4]+'.txt';
  request(date, function(error, response, html){
    if(error){
      console.log(error);
    }else{
      var $ = cheerio.load(html);
      $('.listitem a').each(function(i, element){
          request($(this).attr('href'), function(err, res, ht){
            if(err){
                console.log(err);
            }
            else{
                var $ = cheerio.load(ht);
                var someText = $('.content p').text();
                if (someText !== "") {
                    fs.appendFile(filename, someText+'\n', 'utf-8', function(err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            }
          });
      });
    }
  });
}

function loadEachdate(url) {
    request(url, function(error, response, html) {
        if (error) {
            console.log(error);
        } else {
            console.log('entered inner most level');
            var $ = cheerio.load(html);
            var someText = $('.ie2013-contentstory p').text();
            someText = someText.replace(/(\r\n|\t|\r|\n|<br>)/gm, "");
            if (someText !== "") {
                fs.appendFile('./indianexpress.txt', someText + '\n', 'utf-8', function(err) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        }
    });
}

function loadUrls(links) {
    _(links).forEach(function(link) {
        var urls = [];
        request(link, function(error, response, html) {
            if (error) {
                console.log(error);
            } else {
                var $ = cheerio.load(html);
                $('.news_head li').each(function(i, element) {
                    urls.push($(this).children().first().attr('href'));
                });
            }
            var i = 1;
            _(urls).forEach(function(newsitem) {
                request(newsitem, function(error, response, html) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('entered inner most level');
                        var $ = cheerio.load(html);
                        var someText = $('.ie2013-contentstory p').text();
                        someText = someText.replace(/(\r\n|\t|\r|\n|<br>)/gm, "");
                        if (someText !== "") {
                            fs.appendFile('./indianexpress.txt', someText + '\n', 'utf-8', function(err) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        }
                        i++;
                        if (i >= urls.length) {
                            return;
                        }
                    }
                });
            });
        });
    });
}

function loadFirstMonth(links) {
    for (var i = 0; i < 5; i++) {
        var url = links[i];
        request(url, function(error, response, html) {
            if (error) {
                console.log(error);
            } else {
                var $ = cheerio.load(html);
                var news = [];
                $('.news_head li').each(function(i, element) {
                    news.push($(this).children().first().attr('href'));
                });
                loadIndianExpress(news);
            }
        })
    }
}

function loadHindustanTimes(links) {
    var i = 1;
    _(links).forEach(function(link) {
        request(link, function(error, response, html) {
            if (error) {
                console.log(error);
            } else {
                var $ = cheerio.load(html);
                var someText = $('.sty_txt p').text();
                someText = someText.replace(/(\r\n|\t|\r|\n|<br>)/gm, "");
                someText = someText.replace(/..+/, "\n");
                if (someText !== "") {
                    fs.appendFile('./hindustantimes.txt', someText + '\n', 'utf-8', function(err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
                i++;
                if (i >= links.length) {
                    return;
                }
            }
        })
    });
}

function loadDeccan(links) {
    var i = 1;
    _(links).forEach(function(link) {
        request(link, function(error, response, html) {
            if (error) {
                console.log(error);
            } else {
                var $ = cheerio.load(html);
                var someText = $('#storyBody p').text();
                someText = someText.replace(/(\r\n|\t|\r|\n|<br>)/gm, "");
                if (someText !== "") {
                    fs.appendFile('./deccanchronicle.txt', someText + '\n', 'utf-8', function(err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
                i++;
                if (i >= links.length) {
                    return;
                }
            }
        });
    })
}

function loadHinduCityData(cities) {
    var links = [];
    _(cities).forEach(function(city) {
        request(city, function(error, response, html) {
            if (error) {
                console.log(error);
            } else {
                var $ = cheerio.load(html);
                $('.sub-headline').each(function(i, element) {
                    var link = $(this).children().first().attr('href');
                    if (link !== undefined) {
                        links.push(link);
                    }
                });
                loadHindu(links);
            }
        });
    });
}

function loadNews(url, name) {
    request(url, function(error, response, html) {
        if (error) {
            console.log(url);
            console.log(error);
        } else {
            var $ = cheerio.load(html);
            var news = [];
            $('.news_head li').each(function(i, element) {
                news.push($(this).children().first().attr('href'));
            });
            loadIndianExpress(news, name);
            return;
        }
    });
}

function loadIndianExpress(news, name) {
    var i = 1;
    _(news).forEach(function(newsitem) {
        request(newsitem, function(error, response, html) {
            if (error) {
                console.log(error);
            } else {
                var $ = cheerio.load(html);
                var someText = $('.ie2013-contentstory p').text();
                someText = someText.replace(/(\r\n|\t|\r|\n|<br>)/gm, "");
                if (someText !== "") {
                    fs.appendFile('./' + name + '.txt', someText + '\n', 'utf-8', function(err) {
                        if (err) {
                            console.log(err);
                        }
                        console.log(name, 'created');
                    });
                }
                i++;
                if (i >= news.length) {
                    return;
                }
            }
        });
    });
}

function loadTimesofIndia(news) {
    var i = 1;
    _(news).forEach(function(newsitem) {
        if (_.startsWith(newsitem.link, "http://")) {} else {
            newsitem.link = "http://timesofindia.indiatimes.com" + newsitem.link;
        }
        var data = {
            content: ""
        };
        request(newsitem.link, function(error, response, html) {
            if (error) {
                console.log('------------------ internal data error ---------------------');
                console.log(newsitem.link);
                console.log(error);
            } else {
                var $ = cheerio.load(html);
                var someText = $('.Normal').text();
                someText = someText.replace(/(\r\n|\t|\r|\n|<br>)/gm, "");
                data.content = someText;
                fs.appendFile('./timesofindia.txt', data.content + '\n', 'utf-8', function(err) {
                    if (err) {
                        console.log(err);
                    }
                });
                i++;
                if (i >= news.length) {
                    return;
                }
            }
        });
    });
}

function loadHindu(news) {
    var i = 1;
    _(news).forEach(function(newsitem) {
        request(newsitem, function(error, response, html) {
            if (error) {
                console.log(error);
            } else {
                var $ = cheerio.load(html);
                var someText = $('.body').text();
                someText = someText.replace(/(\r\n|\t|\r|\n|<br>)/gm, "");
                if (someText !== "") {
                    fs.appendFile('./hindu.txt', someText + '\n', 'utf-8', function(err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
                i++;
                if (i >= news.length) {
                    return;
                }
            }
        });
    });
}

module.exports = router;
