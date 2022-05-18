const puppeteer = require('puppeteer');
const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));
const fs = require('fs');
const moment = require('moment-timezone');
moment.locale('pt-br');
const db = require('./db');
const START_SCRIPT_AT = process.env.START_SCRIPT_AT;
const STOP_SCRIPT_AT = process.env.STOP_SCRIPT_AT;

const main = async () => {
	console.log('iniciando')
	let url = `https://cargas.ct.express/new_appcall`;

	const browser = await puppeteer.launch({
        args: [  
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // <- this one doesn't works in Windows
            '--disable-gpu'
        ],	
	    defaultViewport: null,
        headless: true
    });

	const [page] = await browser.pages();

    page.on('response', async (response) => {
        if (response.url().includes('msearch')) {
            let responseJson = await response.json();
            let responseText = await response.text();
            if (responseText.includes('fila_text')) {
                let textFormatado = [];
                for (let response of responseJson.responses) {
                    for (let hit of response.hits.hits) {
                        textFormatado.push(hit._source);
                    }
                }

                const now = moment().tz("America/Sao_Paulo").format('YYYY-MM-DD HH:mm:ss');
                console.log(now + ' retorno encontrado, inserindo no banco de dados');
                salva_dados = await db.insertData({created: now, dados: JSON.stringify(textFormatado)});
                if ( salva_dados ) {
                    console.log(now + ' salvo com sucesso no banco de dados');
                }
                //fs.writeFileSync('retorno_ok - ' + moment().format('YYYY_MM_DD__HH_mm_ss') + '.json', JSON.stringify(textFormatado));
            }
        }
    });

	await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15');
	await page.goto(url, {waitUntil: 'networkidle2'});

    await page.evaluate(async () => {
        var xpath = "//button[text()='JÁ TENHO CADASTRO']";
        var matchingElement = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        matchingElement.click();
    });

    await page.focus('input[type=email]')
    await snooze(2000);
    await page.keyboard.type('gbarrosjunio@gmail.com')
    await snooze(2000);

    await page.focus('#notASearchField')
    await snooze(2000);

    await page.keyboard.type('070914')
    await snooze(3000);

    await page.evaluate(async () => {
        var xpathentrar = "//button[text()='ENTRAR']";
        var entrar = document.evaluate(xpathentrar, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        entrar.click();
    });
    console.log(moment().tz("America/Sao_Paulo").format('YYYY-MM-DD HH:mm:ss'));
    console.log('Fim');
}

main();

setInterval(async function() {
    now = moment().tz("America/Sao_Paulo").format('YYYY-MM-DD HH:mm:ss');
    now_custom = moment().tz("America/Sao_Paulo").format('HH:mm');
    console.log(now);
    console.log(now_custom);
    console.log(START_SCRIPT_AT);
    console.log(STOP_SCRIPT_AT);

    if ( now_custom == START_SCRIPT_AT) {
        main();
    }

    if ( now_custom == STOP_SCRIPT_AT) {
        process.exit(200)
    }
},60000);

