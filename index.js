const puppeteer = require('puppeteer');
const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));
const fs = require('fs');

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
        headless: false
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
                fs.writeFileSync('retorno_ok.json', JSON.stringify(textFormatado));
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
}

main();