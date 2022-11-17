const failureExpanded = (errors) => {
  try {
    return errors.map((failure) => {
      let {stack, ...expanded} = failure
      let expandedArray = Object.keys(expanded).map((key) => {
        return `${key}: ${expanded[key]}`
      })
      return { backtrace: stack.split(/\r?\n/), expanded: expandedArray }
    })
  } catch {
    console.log(`Errors object: ${JSON.stringify(errors)}`)
    return [ { backtrace: [], expanded: [ JSON.stringify(errors) ] } ]
  }

}

module.exports = failureExpanded