@echo off
set NEON_API_KEY=napi_974gt58fcgahhemrn5l6vy7fs2eflqkxyd9t5ss12oiwt47e3tg3fcj1iwgas63w
echo "Running Neon Init..."
call npx.cmd --yes neon@latest init --agent
echo "Running Neon Link..."
call npx.cmd --yes neon@latest link --project-id long-dream-11073328 --agent

