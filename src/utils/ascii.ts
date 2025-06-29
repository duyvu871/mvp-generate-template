import chalk from 'chalk';

export function displayWelcome() {
  console.log(
    chalk.cyan(`
 ███╗   ███╗██╗   ██╗██████╗       ██████╗ ███████╗███╗   ██╗
 ████╗ ████║██║   ██║██╔══██╗     ██╔════╝ ██╔════╝████╗  ██║
 ██╔████╔██║██║   ██║██████╔╝     ██║  ███╗█████╗  ██╔██╗ ██║
 ██║╚██╔╝██║╚██╗ ██╔╝██╔═══╝      ██║   ██║██╔══╝  ██║╚██╗██║
 ██║ ╚═╝ ██║ ╚████╔╝ ██║          ╚██████╔╝███████╗██║ ╚████║
 ╚═╝     ╚═╝  ╚═══╝  ╚═╝           ╚═════╝ ╚══════╝╚═╝  ╚═══╝
  `)
  );
  console.log(chalk.white.bold('          🚀 Project Template Generator 🚀\n'));
}
