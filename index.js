const fs = require('fs');
const Crawler = require("crawler");
const scrapeIt = require("scrape-it");
const _ = require('lodash');

const selector = '.xl7428234';
const CrawUrl = 'http://www.mca.gov.cn/article/sj/xzqh/2019/201901-06/201906211421.html';

function fetchASave(cityCode, cityName) {
        let url = `https://geo.datav.aliyun.com/areas/bound/${cityCode}_full.json`;
        console.log(`url: `, url);
        scrapeIt(url).then(res => {
            if( res.response.statusCode === 200 ) {
                let filename = `./geojsons/${cityName}.json`
                fs.writeFile(filename, res.body, (err) => {
                    if (err) throw err;
                    console.log(filename);
                });
            }
        }).catch(e => {
            console.log(e)
        });
}

function crawl() {
    return new Crawler({
        maxConnections : 10,
        callback : function (error, res, done)  {
            if(error){
                console.log(error);
            } else {
                var $ = res.$;
                let cityCode, cityName;
                $(selector).each(async function(index, el) {
                    if(index % 2 === 0) {
                        cityCode = $(el).text().trim();
                    } else {
                        cityName = $(el).text().trim();
                        _.delay((cityCode, cityName) => fetchASave(cityCode, cityName), 1000, cityCode, cityName);
                    }
                });
            }

            done();
        }
    });
}


const c = crawl();
c.queue(CrawUrl);