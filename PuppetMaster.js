const puppeteer = require('puppeteer'); // https://github.com/GoogleChrome/puppeteer


class PuppetMaster {
    // Viewport specs taken from Mozilla Firefox. Default viewports are the sizes required by App Store and Google Play for app submissions
    viewports = [
        {
            'name': 'Pixel 2',
            'filename': 'AndroidPhone',
            'viewport': {width: 411, height: 731, dpr: 1}
        },
        {
            'name': 'iPhone XS Max',
            'filename': 'iPhone6_5inch',
            'viewport': {width: 414, height: 896, dpr: 3}
        },
        {
            'name': 'iPhone 6/7/8 Plus',
            'filename': 'iPhone5_5inch',
            'viewport': {width: 414, height: 736, dpr: 3}
        },
        {
            'name': 'iPad 10.5',
            'filename': 'AndroidTablet',
            'viewport': {width: 834, height: 1112, dpr: 2}
        },
        {
            'name': 'iPad 12.9',
            'filename': 'iPadPro',
            'viewport': {width: 1024, height: 1366, dpr: 2}
        },
    ];


    /*
        Required parameters:
        - URL of website to take screenshots [string],
        - Delay before screenshot is taken to allow for website dependencies to load [int],
        - Relative file path of this script for screenshots to be saved [string]
     */
    constructor(url, delay_ms, relativeFilePath) {
        if (url && delay_ms && relativeFilePath) {
            this.url = url;
            this.delay = delay_ms;
            this.filePath = relativeFilePath;

            this.runPuppeteer()
            .then(() => {
                this.browser.close();
                console.log(this.url + ' screenshots completed');
            })
            .catch(err => {
                console.log("Could not generate screenshots for " + this.url + ". " + err);
            });
        }
        else {
            console.log("Unable to generate screenshots for this page. Please verify all required parameters have been provided.");
        }
    }

    sleep(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }

    async runPuppeteer() {
        return await new Promise(async (resolve) => {
            this.browser = await puppeteer.launch();
            console.log('Generating screenshots for ' + this.url + '...');

            for (let i = 0; i < this.viewports.length; i++) {
                const page = await this.browser.newPage();

                await page.setViewport({
                    width: this.viewports[i].viewport.width,
                    height: this.viewports[i].viewport.height,
                    deviceScaleFactor: this.viewports[i].viewport.dpr,
                    isMobile: true,
                    isLandscape: false
                });

                await page.goto(this.url, {waitUntil: 'networkidle2'});

                await this.sleep(this.delay); // Pause before taking screenshot to allow website dependencies to load

                await page.screenshot({
                    path: this.filePath + '/' + this.viewports[i].filename + '.png',
                    type: "png"
                })
                .then(() => {
                    console.log(this.viewports[i].filename + " screenshot generated");
                });
            }
            resolve();
        });
    }
}
