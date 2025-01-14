import {pageInterface} from "./../pageInterface";

export const Mangarock: pageInterface = {
    name: 'Mangarock',
    domain: 'https://mangarock.com',
    database: 'Mangarock',
    type: 'manga',
    isSyncPage: function(url){
      if(typeof utils.urlPart(url, 5) != 'undefined'){
        return true;
      }
      return false;
    },
    sync:{
      getTitle: function(url){
        return j.$('a[href*="'+Mangarock.overview!.getIdentifier(url)+'"]').text().trim();
      },
      getIdentifier: function(url){return Mangarock.overview!.getIdentifier(url);},
      getOverviewUrl: function(url){return url.split('/').slice(0, 5).join('/')},
      getEpisode: function(url){
        con.log(j.$("option:contains('Chapter')").first().parent().find(':selected').text());
        return EpisodePartToEpisode(j.$("option:contains('Chapter')").first().parent().find(':selected').text())
      },
      getVolume: function(url){//TODO
        return 0;
      },
    },
    overview:{
      getTitle: function(){return j.$('h1').first().text().trim();},
      getIdentifier: function(url){return utils.urlPart(url, 4).replace(/mrs-serie-/i,'')},
      uiSelector: function(selector){
        selector.insertBefore($( "#chapters-list" ).first());
      },
      list:{
        offsetHandler: false,
        elementsSelector: function(){return j.$('[data-test="chapter-table"] tr');},
        elementUrl: function(selector){return utils.absoluteLink(selector.find("a").first().attr('href'), Mangarock.domain);},
        elementEp: function(selector){return EpisodePartToEpisode(selector.find('a').text());},
      }
    },
    init(page){
      api.storage.addStyle(require('!to-string-loader!css-loader!less-loader!./style.less').toString());

      start();

      utils.urlChangeDetect(function(){
        page.url = window.location.href;
        page.UILoaded = false;
        $('#flashinfo-div, #flash-div-bottom, #flash-div-top').remove();
        start();
      });

      function start(){
        if(!/manga/i.test(utils.urlPart(page.url, 3))){
          con.log('Not a manga page!');
          return;
        }
        if(Mangarock.isSyncPage(page.url)){
          utils.waitUntilTrue(function(){return Mangarock.sync.getTitle(page.url)}, function(){
            page.handlePage();
          });
        }else{
          j.$(document).ready(function(){
            var waitTimeout = false;
            utils.waitUntilTrue(function(){
              con.log('visibility', j.$('#page-content .col-lg-8 .lazyload-placeholder:visible').length);
              return !j.$('#page-content .col-lg-8 .lazyload-placeholder:visible').length || waitTimeout
            }, function(){
              page.handlePage();
            });
            setTimeout(function(){
              waitTimeout = true;
            }, 1000)
          });

        }
      }
    }
};

function EpisodePartToEpisode(string) {
  if(!string) return '';
  if(!(isNaN(parseInt(string)))){
      return string;
  }
  //https://mangarock.com/manga/mrs-serie-124208
  string = string.replace(/(campaign|battle)/i,'Chapter');
  var temp = [];
  temp = string.match(/Chapter\ \d+/i);
  con.log(temp);
  if(temp !== null){
      string = temp[0];
      temp = string.match(/\d+/);
      if(temp !== null){
          return temp[0];
      }
  }else{
    var tempString = string.replace(/vol(ume)?.?\d+/i,'');
    tempString = tempString.replace(/:.+/i,'');
    temp = tempString.match(/\d+/i);
    if(temp !== null && temp.length === 1){
      return temp[0];
    }
  }

  return '';
}
