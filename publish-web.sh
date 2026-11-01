#!/usr/bin/env bash
#
# Публикация веб-сборки в GitHub Pages.
#
#   ./publish-web.sh                             # берёт свежий экспорт из ~/Downloads
#   ./publish-web.sh путь/к/Reunion.zip          # или архив по явному пути
#   ./publish-web.sh путь/к/Reunion/             # или уже распакованную папку
#
# Сборка уходит в ветку gh-pages и полностью заменяет то, что там было.
# Исходники проекта скрипт не трогает: он работает в отдельном worktree.

set -euo pipefail

downloads=${DOWNLOADS_DIR:-$HOME/Downloads}

# Свежайший кандидат на сборку в Загрузках: zip-архив или папка с index.html
# (Safari распаковывает скачанное сам). pattern отбирает по имени.
newest_build() {
	local pattern=$1
	{
		# Только архивы, внутри которых есть index.html. Иначе сюда попадает
		# архив исходников с GitHub: он тоже называется reunion-*.zip, но
		# публиковать его нельзя.
		find "$downloads" -maxdepth 1 -type f -iname "*${pattern}*.zip" |
			while read -r zip; do
				if unzip -l "$zip" 2>/dev/null | grep -q 'index\.html'; then
					echo "$zip"
				fi
			done
		find "$downloads" -mindepth 1 -maxdepth 1 -type d -iname "*${pattern}*" |
			while read -r dir; do
				if [ -f "$dir/index.html" ]; then
					echo "$dir"
				fi
			done
	} 2>/dev/null |
		while read -r path; do
			printf '%s\t%s\n' "$(stat -f %m "$path")" "$path"
		done |
		sort -rn | head -1 | cut -f2-
}

src=${1:-}
if [ -z "$src" ]; then
	# Сначала ищем по имени проекта, потом любую сборку.
	src=$(newest_build reunion || true)
	[ -n "$src" ] || src=$(newest_build '' || true)
	if [ -z "$src" ]; then
		echo "В $downloads нет ни zip-архива, ни папки со сборкой." >&2
		echo "Архивы без index.html внутри пропускаются — скачанные с GitHub" >&2
		echo "исходники проекта сборкой не являются." >&2
		echo "Сначала экспорт: Menu → Project → Export project → Web (HTML5)." >&2
		echo "Либо укажите путь: $0 <экспорт.zip | папка со сборкой>" >&2
		exit 1
	fi
	echo "Беру сборку: $src (от $(stat -f '%Sm' -t '%d.%m.%Y %H:%M' "$src"))"
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
	# ditto, а не unzip: Info-ZIP на macOS не смотрит на флаг UTF-8 и ломает
	# кириллицу в именах, а потом врёт про «disk full».
	if ! ditto -x -k "$src" "$build"; then
		echo "Не получилось распаковать $src — это точно архив экспорта?" >&2
		exit 1
	fi
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
