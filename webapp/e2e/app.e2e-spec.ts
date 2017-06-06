import { RemPage } from './app.po';

describe('rem App', () => {
  let page: RemPage;

  beforeEach(() => {
    page = new RemPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
