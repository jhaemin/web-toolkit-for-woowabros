const { prompt } = require('enquirer')
const fs = require('node:fs')
const prettier = require('prettier')

prettier.resolveConfig(process.cwd()).then((prettierRc) => {
  /** @type {string} */
  const packageVersion = JSON.parse(
    fs.readFileSync('./package.json', 'utf-8')
  ).version

  const packageVersionSplit = packageVersion
    .split('.')
    .map((v) => Number.parseInt(v))

  const patchVersion = `${packageVersionSplit[0]}.${packageVersionSplit[1]}.${
    packageVersionSplit[2] + 1
  }`
  const minorVersion = `${packageVersionSplit[0]}.${
    packageVersionSplit[1] + 1
  }.0`
  const majorVersion = `${packageVersionSplit[0] + 1}.0.0`

  const choices = [
    {
      name: `Patch: ${packageVersion} → ${patchVersion}`,
      value: patchVersion,
    },
    {
      name: `Minor: ${packageVersion} → ${minorVersion}`,
      value: minorVersion,
    },
    {
      name: `Major: ${packageVersion} → ${majorVersion}`,
      value: majorVersion,
    },
  ]

  prompt({
    type: 'select',
    name: 'nextVersion',
    message: 'Select next version',
    choices,
    result(name) {
      return choices.find((choice) => choice.name === name).value
    },
  })
    .then(async ({ nextVersion }) => {
      const formatted = await prettier.format(
        JSON.stringify(
          {
            ...JSON.parse(fs.readFileSync('./package.json', 'utf-8')),
            version: nextVersion,
          },
          null,
          2
        ),

        { parser: 'json', ...prettierRc }
      )

      fs.writeFileSync('./package.json', formatted)
    })
    .catch((err) => {
      console.error(err)
    })
})
