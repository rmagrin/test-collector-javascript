const { v4: uuidv4 } = require('uuid')
const axios = require('axios')

const fs = require('fs')

// FIXME: currently used for debugging, please remove :)
const log = (text) => {
  fs.appendFile('buildkite-analytics.log', text + "\n", () => {})
}

class JestBuildkiteAnalyticsReporter {
  constructor(globalConfig, options) {
    this._buildkiteAnalyticsKey = process.env.BUILDKITE_ANALYTICS_KEY
    this._globalConfig = globalConfig
    this._options = options
    this._testResults = []
  }

  onRunStart(test) {
    this._run_key = uuidv4()
  }

  onRunComplete(test, results) {
    let data = {
      'format': 'json',
      'run_env': {
        'key': this._run_key
      },
      "data": this._testResults,
    }
    let config = {
      headers: {
        'Authorization': `Token token="${this._buildkiteAnalyticsKey}"`,
        'Content-Type': 'application/json'
      }

    }

    axios.post('https://analytics-api.buildkite.com/v1/uploads', data, config)
    .then(function (response) {
      log('success, yay')
    })
    .catch(function (error) {
      log('error, failed')
    })

  }

  onTestStart(test) {
  }

  onTestResult(test, testResult) {
    testResult.testResults.forEach((result) => {
      let id = uuidv4()
      this._testResults.push({
        'id': id,
        'scope': result.ancestorTitles.join(' '),
        'name': result.title,
        'identifier': `${testResult.testFilePath} -t "${result.title}"`,
        'location': `${testResult.testFilePath} -t "${result.title}"`,
        'file_name': testResult.testFilePath,
        'result': result.status, // TODO: may need to map this from jest-> buildkite status
        'failure_reason': this.stripANSIColorCodes(result.failureMessages.join(' ')),
        'failure_expanded': [],
        'history': {
          'section': 'top',
          'start_at': testResult.perfStats.start,
          'end_at': testResult.perfStats.end,
          'duration': result.duration / 1000,
        }

      })
    })
  }

  stripANSIColorCodes(string) { return string.replace(/\u001b[^m]*?m/g,'') }
}

module.exports = JestBuildkiteAnalyticsReporter