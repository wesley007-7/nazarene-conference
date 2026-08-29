@echo off
call npx.cmd prisma generate
call npx.cmd prisma db push

