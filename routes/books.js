var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var extract = require('pdf-text-extract');

router.get('/', function(req, res, next){
  extract('./story.pdf', function(err, pages){
    if(err){
      console.log(err);
    }else{
      pages = pages.slice(4, pages.length);
      _(pages).forEach(function(page){
        var someText = page;
        someText = someText.replace(/(\r\n|\t|\r|\n|\t\t|<br>)/gm,"");
        if(someText !== ""){
          fs.appendFile('./story.txt', someText + '\n', 'utf-8', function(err){
            if(err){
              console.log(err);
            }
          });
        }
      })
    }
  });
});

router.get('/book1', function(req, res, next){
  var url = "http://www.publicbookshelf.com/contemporary/guardian/baby";
  request(url, function(error, response, html){
    if(error){
      console.log(error);
    }
    else {
      var $ = cheerio.load(html);
      var someText = $('#text p').text();
      someText = someText.replace(/(\r\n|\t|\r|\n|<br>)/gm,"");
      if(someText !== ""){
        fs.appendFile('./book1.txt', someText + '\n', 'utf-8', function(err){
          if(err){
            console.log(err);
          }
        });
      }
    }
  });
  for(var i=2;i<=9; i++){
    url = "http://www.publicbookshelf.com/contemporary/guardian/baby-"+i.toString();
    request(url, function(error, response, html){
      if(error){
        console.log(error);
      }
      else {
        var $ = cheerio.load(html);
        var someText = $('#text p').text();
        someText = someText.replace(/(\r\n|\t|\r|\n|<br>)/gm,"");
        if(someText !== ""){
          fs.appendFile('./book1.txt', someText + '\n', 'utf-8', function(err){
            if(err){
              console.log(err);
            }
          });
        }
      }
    });
  }
});

router.get('/fictionbooks', function(req, res, next){
  var books = [];
  var url = "http://www.readcentral.com/ReadCentral-Top-Ten-Fiction-Books-List";
  request(url, function(error, response, html){
    if(error){
      console.log(error);
    }
    else{
      var $ = cheerio.load(html);
      $('.readheading a').each(function(i, element){
        books.push($(this).attr('href'));
      });
      openFictionBooks(books);
    }
  });
});

router.get('/nonfictionbooks', function(req, res, next){
  var books = [];
  var url = "http://www.readcentral.com/ReadCentral-Top-Ten-Non-Fiction-Books-List";
  request(url, function(error, response, html){
    if(error){
      console.log(error);
    }else{
      var $ = cheerio.load(html);
      $('.readheading a').each(function(i, element){
        books.push($(this).attr('href'));
      })
      openNonFictionBooks(books);
    }
  });
});

router.get('/poetry', function(req, res, next){
  var books = [];
  var url = "http://www.readcentral.com/ReadCentral-Top-Poetry-Books-List";
  request(url, function(error, response, html){
    if(error){
      console.log(error);
    }else{
      var $ = cheerio.load(html);
      $('.readheading a').each(function(i, element){
        books.push($(this).attr('href'));
      })
      openPoetryBooks(books);
    }
  });
})

router.get('/moral', function(req, res, next){
  var url = "http://www.kidsworldfun.com/shortstories.php";
  var books = [];
  request(url, function(error, response, html){
    if(error){
      console.log(error);
    }else {
      var $ = cheerio.load(html);
      $('.bodyText3 a').each(function(i, element){
        books.push($(this).attr('href'));
      });
      books.pop();
      openMoralBooks(books);
    }
  });
})

router.get('/pauladaunt', function(req, res, next){
  var url = "http://www.pauladaunt.com/books/";
  var books = [];
  request(url, function(error, response, html){
    if(error){
      console.log(error);
    }else{
      var $ = cheerio.load(html);
      console.log($());
    }
  })
})

function openFictionBooks(books){
  _(books).forEach(function(book){
    var links = [];
    var url = book;
    request(url, function(error, response, html){
      if(error){
        console.log(error);
      }else{
        var $ = cheerio.load(html);
        $('.bookindex a').each(function(i, element){
          if(i >=1){
            var link = "http://readcentral.com" + $(this).attr('href')
            links.push(link);
          }
        });
        readFictionBook(links);
      }
    });
  });
}

function readFictionBook(links){
  var i=1;
  _(links).forEach(function(link){
    request(link, function(error, response, html){
      if(error){
        console.log(error);
      }else{
        var $ = cheerio.load(html);
        var someText = $('.book_chapter_p').text();
        someText = someText.replace(/(\r\n|\t|\r|\n|<br>)/gm,"");
        if(someText !== ""){
          fs.appendFile('./fictionbooks.txt', someText + '\n', 'utf-8', function(err){
            if(err){
              console.log(err);
            }
          });
        }
        i++;
        if(i >= links.length){
          return;
        }
      }
    });
  });
}

function openNonFictionBooks(books){
  _(books).forEach(function(book){
    var links = [];
    var url = book;
    request(url, function(error, response, html){
      if(error){
        console.log(error);
      }else{
        var $ = cheerio.load(html);
        $('.bookindex a').each(function(i, element){
          if(i >=1){
            var link = "http://readcentral.com" + $(this).attr('href')
            links.push(link);
          }
        });
        readNonFictionBook(links);
      }
    });
  });
}

function readNonFictionBook(links){
  var i=1;
  _(links).forEach(function(link){
    request(link, function(error, response, html){
      if(error){
        console.log(error);
      }else{
        var $ = cheerio.load(html);
        var someText = $('.book_chapter_p').text();
        someText = someText.replace(/(\r\n|\t|\r|\n|<br>)/gm,"");
        if(someText !== ""){
          fs.appendFile('./nonfictionbooks.txt', someText + '\n', 'utf-8', function(err){
            if(err){
              console.log(err);
            }
          });
        }
        i++;
        if(i >= links.length){
          return;
        }
      }
    });
  });
}

function openPoetryBooks(books){
  _(books).forEach(function(book){
    var links = [];
    var url = book;
    request(url, function(error, response, html){
      if(error){
        console.log(error);
      }else{
        var $ = cheerio.load(html);
        $('.bookindex a').each(function(i, element){
          if(i >=1){
            var link = "http://readcentral.com" + $(this).attr('href')
            links.push(link);
          }
        });
        readPoetryBook(links);
      }
    });
  });
}

function readPoetryBook(links){
  var i=1;
  _(links).forEach(function(link){
    request(link, function(error, response, html){
      if(error){
        console.log(error);
      }else{
        var $ = cheerio.load(html);
        var someText = $('.book_chapter_p').text();
        someText = someText.replace(/(\r\n|\t|\r|\n|<br>)/gm,"");
        if(someText !== ""){
          fs.appendFile('./poetrybooks.txt', someText + '\n', 'utf-8', function(err){
            if(err){
              console.log(err);
            }
          });
        }
        i++;
        if(i >= links.length){
          return;
        }
      }
    });
  });
}

function openMoralBooks(books){
  _(books).forEach(function(book){
    links = [];
    links2 = [];
    var url = book;
    request(url, function(error, response, html){
      if(error){
        console.log(error);
      }else{
        var $ = cheerio.load(html);
        $('.poem_list li').each(function(i, element){
          var link;
          var subl = $(this).children().attr('href');
          if(_.startsWith(subl, 'http://')){
            link = subl;
          }else{
           link = "http://www.kidsworldfun.com/"+$(this).children().attr('href');
          }
          if(_.endsWith(link, 'html'))
            links2.push(link);
          else
            links.push(link);
        });
        readMoralBooks(links);
        readMoralBooks2(links2);
      }
    })
  });
}

function readMoralBooks(links){
  var i=1;
  _(links).forEach(function(link){
    var url = link;
    request(url, function(error, response, html){
      if(error){
        console.log(error);
      }else{
        var $ = cheerio.load(html);
        var someText = $('.con_welcome_sub3 p').text();
        someText = someText.replace(/(\r\n|\t|\r|\n|<br>)/gm,"");
        if(someText !== ""){
          fs.appendFile('./moralbooks.txt', someText + '\n', 'utf-8', function(err){
            if(err){
              console.log(err);
            }
          });
        }
        i++;
        if(i >= links.length){
          return;
        }
      }
    });
  });
}

function readMoralBooks2(links){
  var i=1;
  _(links).forEach(function(link){
    var url = link;
    request(url, function(error, response, html){
      if(error){
        console.log(error);
      }else{
        var $ = cheerio.load(html);
        var someText = $('#main-content p').text();
        someText = someText.replace(/(\r\n|\t|\r|\n|<br>)/gm,"");
        if(someText !== ""){
          fs.appendFile('./moralbooks.txt', someText + '\n', 'utf-8', function(err){
            if(err){
              console.log(err);
            }
          });
        }
        i++;
        if(i >= links.length){
          return;
        }
      }
    });
  });
}

module.exports = router;
