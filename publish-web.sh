#!/usr/bin/env bash
#
# Публикация веб-сборки в GitHub Pages.
#
#   ./publish-web.sh ~/Downloads/Reunion.zip     # zip из Export project → Web (HTML5)
#   ./publish-web.sh ~/Downloads/Reunion/        # или уже распакованная папка
#
# Сборка уходит в ветку gh-pages и полностью заменяет то, что там было.
# Исходники проекта скрипт не трогает: он работает в отдельном worktree.

set -euo pipefail

src=${1:-}
if [ -z "$src" ]; then
	echo "Использование: $0 <экспорт.zip | папка со сборкой>" >&2
	exit 1
fi

repo=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
tmp=$(mktemp -d)
worktree=$tmp/gh-pages
cleanup() {
	git -C "$repo" worktree remove --force "$worktree" 2>/dev/null || true
	git -C "$repo" worktree prune
	rm -rf "$tmp"
}
trap cleanup EXIT

# 1. Разложить сборку в tmp/build
build=$tmp/build
mkdir -p "$build"
if [ -d "$src" ]; then
	cp -R "$src"/. "$build"/
elif [ "${src##*.}" = "zip" ]; then
	unzip -q "$src" -d "$build"
else
	echo "Нужен .zip экспорта или папка со сборкой, а не $src" >&2
	exit 1
fi

# Construct кладёт index.html в корень архива, но иногда он оказывается
# на уровень глубже — найдём его сами.
if [ ! -f "$build/index.html" ]; then
	found=$(find "$build" -maxdepth 3 -name index.html | head -1)
	if [ -z "$found" ]; then
		echo "В сборке нет index.html — это точно экспорт Web (HTML5)?" >&2
		exit 1
	fi
	build=$(dirname "$found")
fi

# Без этого файла GitHub Pages прогонит сборку через Jekyll
# и выбросит файлы и папки, имена которых начинаются с подчёркивания.
touch "$build/.nojekyll"

# 2. Перенести сборку в gh-pages
git -C "$repo" fetch --quiet origin gh-pages
git -C "$repo" worktree add --quiet --detach "$worktree" origin/gh-pages
find "$worktree" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -R "$build"/. "$worktree"/
git -C "$worktree" add --all

if git -C "$worktree" diff --cached --quiet; then
	echo "Сборка не отличается от опубликованной — публиковать нечего."
	exit 0
fi

git -C "$worktree" commit --quiet -m "Update web build"
git -C "$worktree" push --quiet origin HEAD:gh-pages
git -C "$repo" fetch --quiet origin gh-pages:gh-pages

origin=$(git -C "$repo" remote get-url origin)
origin=${origin%.git}
name=${origin##*/}
owner=${origin%/*}
owner=${owner##*[:/]}
echo "Опубликовано. Через минуту-две: https://$owner.github.io/$name/"
echo "Если игра не обновилась — обновите страницу с Shift (сборка кешируется service worker'ом)."
