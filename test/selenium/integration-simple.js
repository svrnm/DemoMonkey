import chai from 'chai'
import base from './base'

const expect = chai.expect

describe('Integration (Simple)', function () {
  const url = 'https://github.com/svrnm/demomonkey'

  before('Start Webdriver', base.start)
  after('Quit Webdriver', base.quit)

  describe('Un-tampered webpage', function () {
    this.timeout(10000)
    it('github page of this project has demomonkey in its title', async function () {
      await base.getDriver().get(url)
      const title = await base.getDriver().getTitle()
      expect(title).to.include.string('DemoMonkey')
    })
  })

  describe('tampered webpage', function () {
    this.timeout(10000)
    this.retries(4)
    // Autocomplete & editing the editor via automation does not work
    it('will disable autoComplete', function () {
      return base.disableOptionalFeature('editorAutocomplete')
    })
    it('allows to create new configurations', function () {
      return base.createConfig('testape', 'DemoMonkey = testape\n@include = /.*/\n')
    })
    it('has toggle buttons on the popup menu', function () {
      return base.enableConfig('testape')
    })
    it('github page of this project will have testape in its title', async function () {
      await base.getDriver().get(url)
      await base.getDriver().sleep(1000)
      const title = await base.getDriver().getTitle()
      expect(title).to.include.string('testape')
    })
  })
})
