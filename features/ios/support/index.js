var reporter = require('cucumber-html-reporter');
 
var options = {
        theme: 'bootstrap',
        jsonFile: 'report/cucumber_report.json',
        output: 'report/cucumber_ios_report.html',
        reportSuiteAsScenarios: true,
        launchReport: false,
        metadata: {
            "App Version":"0.1",
            "Test Environment": "PRODUÇÃO",
            "Platform": "IOS",
            "Executed": "LOCAL"
        }
    };
 
    reporter.generate(options);