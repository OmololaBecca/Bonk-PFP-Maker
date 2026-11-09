export class HomePage {
  constructor(page) {
    this.page = page;
    this.heroHeading = page.getByRole('heading', { name: 'Create Your BONK PFP', level: 1 });
    this.tryPfpMakerLink = page.getByRole('link', { name: 'Try BONK PFP Maker' });
  }

  async goto() {
    await this.page.goto('/');
  }

  communityHeading(name) {
    return this.page.getByRole('heading', { name, exact: true, level: 3 });
  }
}
