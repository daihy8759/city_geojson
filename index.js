const fs = require('fs').promises;
const axios = require('axios');
const cheerio = require('cheerio');
const del = require('del');

const selector = '.xl7428234';
const CrawUrl = 'http://www.mca.gov.cn/article/sj/xzqh/2019/201901-06/201906211421.html';
const cityCodes = []
const cityNames = []

async function fetchASave(cityCode, cityName) {
    let url = `https://geo.datav.aliyun.com/areas/bound/${cityCode}_full.json`;
    let filename = `./geojsons/${cityName}.json`
    console.log(`url: `, url);
    try{
        const res = await axios.get(url)
        if( res.status === 200 ) {
            await fs.writeFile(filename, JSON.stringify(res.data));
        }
    }catch(e){
        console.log(e)
        // 写入空数据
        await fs.writeFile(filename, '{"type":"FeatureCollection","features":[]}')
    }
}

function updateReadme(){
    // 更新README.md
    fs.readdir('./geojsons', (err, files) => {
        const dataArray = ['# 中国城市 geojsons 列表']
        dataArray.push("\n");
        dataArray.push("\n");
        files.forEach(file => {
            const filename = file.split(".")[0]
            dataArray.push(`+ [${filename}](./geojsons/${filename}.json)\n`)
        });
        fs.writeFile('./README.md', dataArray.join(''), (err) => {
            if (err) throw err;
        });
    });
}

async function crawl() {
    await del(['./geojsons/*.json'])
    const res = await axios.get(CrawUrl);
    const $ = cheerio.load(res.data);
    const nodes = $(selector);
    nodes.each((index,value) => {
        if(index % 2 === 0) {
            cityCode = $(value).text().trim();
            cityCodes.push(cityCode);
        } else {
            cityName = $(value).text().trim();
            cityNames.push(cityName);
        }
    })
    await Promise.all(cityCodes.map(async (arr,index) => {
        await fetchASave(arr, cityNames[index]);
    }));
    updateReadme();
}

crawl();