const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

function run(cmd, options = {}) {
  console.log(`\x1b[36m[EXEC]\x1b[0m ${cmd}`);
  execSync(cmd, { stdio: "inherit", shell: "/bin/bash", ...options });
}

const WORKTREE_PATH = ".deploy-main";

try {
  // Verifica se está na develop
  const branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
  if (branch !== "develop") {
    console.error(`[ABORTADO] Você está na branch '${branch}'. Troque para 'develop' para iniciar o deploy.`);
    process.exit(1);
  }

  // Atualiza repositório
  run("git fetch origin");

  // Remove worktree antiga se existir
  if (fs.existsSync(WORKTREE_PATH)) {
    run(`rm -rf ${WORKTREE_PATH}`);
    run(`git worktree prune`);
  }

  // Cria novo worktree limpo da branch main
  run(`git worktree add ${WORKTREE_PATH} origin/main`);

  // Copia arquivos necessários para a produção
  const filesToCopy = [
    "package.json",
    "pnpm-lock.yaml",
    "tsconfig.build.json",
    ".env-example",
    "resources",
    "ecosystem.config.js",
  ];
  filesToCopy.forEach(file => run(`cp -r ${file} ${WORKTREE_PATH}/`));

  // Build isolado
  run(`pnpm install --frozen-lockfile`, { cwd: WORKTREE_PATH });
  run(`pnpm run build`, { cwd: WORKTREE_PATH });

  // Commit e push
  run(`git add -f dist ecosystem.config.js resources package.json pnpm-lock.yaml .env-example`, {
    cwd: WORKTREE_PATH,
  });

  run(`git commit -m "release: build de produção"`, { cwd: WORKTREE_PATH });
  run(`git push origin HEAD:main`, { cwd: WORKTREE_PATH });

  // Limpeza final
  run(`rm -rf ${WORKTREE_PATH}`);
  console.log("\x1b[32m[✅] Deploy concluído com sucesso!\x1b[0m");

} catch (err) {
  run(`rm -rf ${WORKTREE_PATH}`);
  console.error("\x1b[31m[❌ ERRO]\x1b[0m Falha durante o deploy:", err.message);
  process.exit(1);
}
