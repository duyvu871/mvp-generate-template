import { execSync } from 'child_process';
import chalk from 'chalk';

/**
 * Convert various Git URL formats to GitHub raw URL
 */
export function convertToGitHubRawUrl(
  repoUrl: string,
  filePath: string,
  branch = 'main'
): string | null {
  let owner: string, repo: string;

  // Handle different GitHub URL formats
  if (repoUrl.startsWith('git@github.com:')) {
    // git@github.com:user/repo.git -> user/repo
    const match = repoUrl.match(/git@github\.com:([^\/]+)\/(.+?)(?:\.git)?$/);
    if (!match) return null;
    [, owner, repo] = match;
  } else if (repoUrl.includes('github.com')) {
    // https://github.com/user/repo.git -> user/repo
    // https://github.com/user/repo -> user/repo
    const match = repoUrl.match(
      /github\.com[\/:]([^\/]+)\/([^\/\.]+?)(?:\.git)?(?:\/.*)?$/
    );
    if (!match) return null;
    [, owner, repo] = match;
  } else {
    return null; // Not a GitHub URL
  }

  // Clean up repo name (remove .git if present)
  repo = repo.replace(/\.git$/, '');

  // Build raw GitHub URL
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
}

/**
 * Download content from GitHub raw API using curl
 */
export async function downloadFromGitHubRaw(
  repoUrl: string,
  filePath: string,
  branch = 'main',
  debug = false
): Promise<string | null> {
  try {
    const rawUrl = convertToGitHubRawUrl(repoUrl, filePath, branch);

    if (!rawUrl) {
      if (debug) {
        console.log(chalk.yellow(`⚠️ Not a GitHub repository: ${repoUrl}`));
      }
      return null;
    }

    if (debug) {
      console.log(chalk.gray(`🌐 Fetching from GitHub raw: ${rawUrl}`));
    }

    // Use curl to download content directly
    const curlCommand = `curl -L -s -f "${rawUrl}"`;

    try {
      const content = execSync(curlCommand, {
        encoding: 'utf8',
        stdio: debug ? ['pipe', 'pipe', 'inherit'] : 'pipe',
        timeout: 30000, // 30 second timeout
      });

      if (content && content.trim()) {
        if (debug) {
          console.log(
            chalk.green(`✅ Content fetched from GitHub raw: ${filePath}`)
          );
        }
        return content.trim();
      } else {
        if (debug) {
          console.log(
            chalk.yellow(`⚠️ Empty content returned for: ${filePath}`)
          );
        }
        return null;
      }
    } catch (curlError) {
      if (debug) {
        const errorMsg =
          curlError instanceof Error ? curlError.message : String(curlError);

        if (errorMsg.includes('404') || errorMsg.includes('Not Found')) {
          console.log(chalk.yellow(`⚠️ File not found: ${filePath}`));
        } else if (errorMsg.includes('403') || errorMsg.includes('Forbidden')) {
          console.log(
            chalk.yellow(`⚠️ Access forbidden (private repo?): ${filePath}`)
          );
        } else {
          console.log(chalk.yellow(`⚠️ curl failed for: ${rawUrl}`));
          console.log(chalk.gray(`Error: ${errorMsg}`));
        }
      }
      return null;
    }
  } catch (error) {
    if (debug) {
      console.error(
        chalk.red(
          `❌ GitHub raw download failed: ${error instanceof Error ? error.message : error}`
        )
      );
    }
    return null;
  }
}

/**
 * Check if a URL is a GitHub repository
 */
export function isGitHubRepository(repoUrl: string): boolean {
  return repoUrl.includes('github.com');
}

/**
 * Download multiple files from GitHub raw API
 */
export async function downloadMultipleFromGitHubRaw(
  repoUrl: string,
  filePaths: string[],
  branch = 'main',
  debug = false
): Promise<Record<string, string | null>> {
  const results: Record<string, string | null> = {};

  if (debug) {
    console.log(
      chalk.gray(`🌐 Downloading ${filePaths.length} files from GitHub raw...`)
    );
  }

  // Download files in parallel for better performance
  const downloadPromises = filePaths.map(async (filePath) => {
    const content = await downloadFromGitHubRaw(
      repoUrl,
      filePath,
      branch,
      debug
    );
    return { filePath, content };
  });

  const downloadResults = await Promise.all(downloadPromises);

  downloadResults.forEach(({ filePath, content }) => {
    results[filePath] = content;
  });

  if (debug) {
    const successful = Object.values(results).filter(
      (content) => content !== null
    ).length;
    console.log(
      chalk.gray(
        `📊 Downloaded ${successful}/${filePaths.length} files successfully`
      )
    );
  }

  return results;
}

/**
 * Test if a GitHub repository and branch exists by trying to fetch README
 */
export async function testGitHubRepository(
  repoUrl: string,
  branch = 'main',
  debug = false
): Promise<boolean> {
  try {
    const testFiles = ['README.md', 'readme.md', 'README.txt', 'package.json'];

    for (const testFile of testFiles) {
      const content = await downloadFromGitHubRaw(
        repoUrl,
        testFile,
        branch,
        false
      );
      if (content) {
        if (debug) {
          console.log(
            chalk.green(`✅ Repository accessible: ${repoUrl} (${branch})`)
          );
        }
        return true;
      }
    }

    if (debug) {
      console.log(
        chalk.yellow(
          `⚠️ Repository not accessible or empty: ${repoUrl} (${branch})`
        )
      );
    }
    return false;
  } catch (error) {
    if (debug) {
      console.log(
        chalk.red(`❌ Repository test failed: ${repoUrl} (${branch})`)
      );
    }
    return false;
  }
}
