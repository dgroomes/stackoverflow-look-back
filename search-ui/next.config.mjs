import * as process from 'node:process';

/**
 * Detect if the deployment target is GitHub Pages.
 *
 * @return {boolean}
 */
function deployToGhPages() {
    return 'DEPLOY_TO_GITHUB_PAGES' in process.env && process.env.DEPLOY_TO_GITHUB_PAGES.toLowerCase() === 'true'
}

/**
 * This is configuration that's specific for deploying to GitHub Pages. GitHub Pages has the quirk of serving contents
 * from a URL path equal to the name of the GitHub repository. So for example, if the GitHub org is 'MyName' and the
 * repository is 'my-repo', then the GitHub Pages URL will be `https://MyName.github.io/my-repo`.
 */
const gitHubPagesConfig = {
    basePath: '/stackoverflow-look-back',
    assetPrefix: '/stackoverflow-look-back',
};

const defaultConfig = {};

let config;

if (deployToGhPages()) {
    config = gitHubPagesConfig;
} else {
    config = defaultConfig;
}

export default config;
